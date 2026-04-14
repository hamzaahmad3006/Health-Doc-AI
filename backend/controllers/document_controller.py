import os
import shutil
import re
import uuid
import datetime
from fastapi import UploadFile, HTTPException
from sqlalchemy.orm import Session
from typing import Any
from backend.models import Document, AuditLog, WorkspaceConfig, Patient
from backend.services.ai_service import AIService

from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
import io
from fastapi.responses import StreamingResponse

# --- Helpers ---
def create_audit_log(db: Session, user_id: int, action: str, resource_type: str, resource_id: str = None, details: str = None):
    audit_entry = AuditLog(
        user_id=user_id,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        details=details
    )
    db.add(audit_entry)
    db.commit()

UPLOAD_DIR = "uploads"
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)

async def list_documents(db: Session, patient_id: int = None):
    # Log access (Generic list access)
    create_audit_log(db, 1, "list", "document", details=f"User listed documents (Patient Filter: {patient_id})")
    query = db.query(Document)
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
    return query.order_by(Document.created_at.desc()).all()

async def list_patients(db: Session):
    create_audit_log(db, 1, "list", "patient", details="User listed all patients")
    # Only return patients who have at least one document
    return db.query(Patient).filter(Patient.user_id == 1, Patient.documents.any()).all()

async def get_stats(db: Session, patient_id: int = None):
    query = db.query(Document)
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
        
    docs = query.all()
    total = len(docs)
    pending = len([d for d in docs if d.status in ["processing", "pending"]])
    
    completed_docs = [d for d in docs if d.status == "completed" and d.confidence_score is not None]
    avg_accuracy = 0
    if completed_docs:
        avg_accuracy = sum([d.confidence_score for d in completed_docs]) / len(completed_docs)
    
    return {
        "totalProcessed": total,
        "pendingReview": pending,
        "accuracyRate": round(avg_accuracy * 100, 1)
    }

async def upload_and_process(file: UploadFile, db: Session, user_id: int):
    # 1. Create file IDs and save raw file
    file_id = str(uuid.uuid4())
    file_ext = os.path.splitext(file.filename)[1]
    file_name = f"{file_id}{file_ext}"
    file_path = os.path.join(UPLOAD_DIR, file_name)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # 2. Store preliminary record in DB
    db_doc = Document(
        id=file_id,
        filename=file.filename,
        file_path=file_path,
        user_id=user_id,
        status="processing"
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    
    # Audit: Upload
    create_audit_log(db, user_id, "upload", "document", resource_id=file_id, details=f"Uploaded {file.filename}")

    # 3. Trigger AI Processing
    try:
        # Fetch current workspace config
        config_obj = await get_config(db, user_id)
        config_dict = {
            "ai_model": config_obj.ai_model,
            "language": config_obj.language,
            "custom_fields": config_obj.custom_fields if config_obj.custom_fields else ["patient_name", "date", "diagnosis", "medications", "vital_signs", "lab_results"],
            "instructions": config_obj.instructions
        }
        
        ai_result = await AIService.process_document(file_path, config=config_dict)
        data = ai_result.get("data", {})
        is_medical = data.get("is_medical", True) # Default to True for backward compatibility if AI fails to return it
        
        # 4. Update DB with extracted data
        if not is_medical:
            # Delete the record and uploaded file — non-medical docs should NOT be saved
            rejection_reason = data.get("rejection_reason", "This document does not appear to be a medical report.")
            db.delete(db_doc)
            db.commit()
            if os.path.exists(file_path):
                os.remove(file_path)
            
            create_audit_log(db, user_id, "rejected_non_medical", "document", resource_id=file_id, details=f"Rejected: {rejection_reason}")
            
            raise HTTPException(
                status_code=422,
                detail={
                    "type": "non_medical",
                    "message": rejection_reason,
                    "filename": file.filename
                }
            )
        else:
            db_doc.status = "completed"
            db_doc.extracted_data = data
            db_doc.confidence_score = ai_result.get("confidence")
            db_doc.requires_human_review = ai_result.get("needs_review", False)
            db_doc.is_anonymized = ai_result.get("is_anonymized", False)

            # 4.5. Automatic Patient Identification
            patient_name = data.get("patient_name")
            patient_age = data.get("patient_age")
            patient_gender = data.get("patient_gender")

            if patient_name:
                # Find or create patient
                patient = db.query(Patient).filter(
                    Patient.name.ilike(patient_name), 
                    Patient.user_id == user_id
                ).first()

                if not patient:
                    patient = Patient(
                        name=patient_name, 
                        user_id=user_id,
                        age=patient_age,
                        gender=patient_gender
                    )
                    db.add(patient)
                else:
                    # Update age/gender if they are provided and current ones are missing
                    if patient_age and not patient.age:
                        patient.age = patient_age
                    if patient_gender and not patient.gender:
                        patient.gender = patient_gender
                
                db.commit()
                db.refresh(patient)
                
                db_doc.patient_id = patient.id
        
        db.commit()
        db.refresh(db_doc)
        
        # Audit: Process complete
        create_audit_log(db, user_id, "process_complete", "document", resource_id=file_id)
        
    except HTTPException:
        # Re-raise HTTP exceptions (like 422 for non-medical) so they reach the client
        raise
    except Exception as e:
        db_doc.status = "error"
        db.commit()
        print(f"Processing Error for {file_id}: {e}")

    return db_doc

async def get_document_status(doc_id: str, db: Session):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Audit: View detail
    create_audit_log(db, 1, "view", "document", resource_id=doc_id)
    return doc

async def delete_document(doc_id: str, db: Session):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Delete physiological file
    if os.path.exists(doc.file_path):
        os.remove(doc.file_path)
    
    # Audit: Delete
    create_audit_log(db, 1, "delete", "document", resource_id=doc_id, details=f"Deleted {doc.filename}")
    
    # Delete DB record
    db.delete(doc)
    db.commit()
    return {"message": "Document deleted successfully"}
    

async def export_documents(db: Session, format: str):
    docs = db.query(Document).all()
    
    # Audit: Bulk Export
    create_audit_log(db, 1, "export_all", "document", details=f"Exported all records in {format} format")
    
    if format == "json":
        return [
            {
                "id": d.id,
                "filename": d.filename,
                "status": d.status,
                "confidence": d.confidence_score,
                "extracted_data": d.extracted_data,
                "created_at": d.created_at.isoformat()
            }
            for d in docs
        ]
    
    elif format == "csv":
        import csv
        import io
        from fastapi.responses import StreamingResponse
        
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Header
        writer.writerow(["ID", "Filename", "Status", "Confidence", "Extraction Date", "Extracted Info"])
        
        for d in docs:
            # Flatten extracted data for CSV
            info = ""
            if d.extracted_data:
                info = "; ".join([f"{k}: {v}" for k, v in d.extracted_data.items()])
            
            writer.writerow([
                d.id,
                d.filename,
                d.status,
                d.confidence_score if d.confidence_score else "N/A",
                d.created_at.strftime("%Y-%m-%d %H:%M:%S"),
                info
            ])
        
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": f"attachment; filename=documents_export_{uuid.uuid4().hex[:8]}.csv"}
        )
    
    else:
        raise HTTPException(status_code=400, detail="Unsupported format. Use 'csv' or 'json'.")

async def upload_clinic_logo(file: UploadFile, db: Session, user_id: int = 1):
    """
    Uploads a clinic logo and updates the workspace configuration.
    """
    config = await get_config(db, user_id)
    
    # Create directory if not exists
    logo_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), "static/logos")
    os.makedirs(logo_dir, exist_ok=True)
    
    # Generate unique filename
    ext = os.path.splitext(file.filename)[1]
    filename = f"logo_{user_id}_{uuid.uuid4().hex[:8]}{ext}"
    file_path = os.path.join(logo_dir, filename)
    
    # Save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
        
    # Update config
    config.clinic_logo_url = f"/static/logos/{filename}"
    db.commit()
    
    # Audit trail
    create_audit_log(db, user_id, "upload_logo", "workspace_config", details=f"Uploaded clinic logo: {filename}")
    
    return {"status": "success", "logo_url": config.clinic_logo_url}

async def update_document(doc_id: str, obj_in: dict, db: Session):
    doc = db.query(Document).filter(Document.id == doc_id).first()
    if not doc:
        raise HTTPException(status_code=404, detail="Document not found")
    
    for field, value in obj_in.items():
        if hasattr(doc, field):
            setattr(doc, field, value)
    
    db.commit()
    db.refresh(doc)
    
    # Audit: Update
    create_audit_log(db, 1, "update", "document", resource_id=doc_id)
    return doc

async def get_config(db: Session, user_id: int):
    config = db.query(WorkspaceConfig).filter(WorkspaceConfig.user_id == user_id).first()
    if not config:
        # Create default config if not exists
        config = WorkspaceConfig(user_id=user_id)
        db.add(config)
        db.commit()
        db.refresh(config)
    return config

async def update_config(db: Session, user_id: int, obj_in: dict):
    config = await get_config(db, user_id)
    for field, value in obj_in.items():
        if hasattr(config, field):
            setattr(config, field, value)
    db.commit()
    db.refresh(config)
    return config

async def get_health_trends(db: Session, patient_id: int = None):
    """
    Aggregates medical lab results and vitals from all completed documents to find trends.
    Handles both dictionary and list formats for flexibility.
    """
    query = db.query(Document).filter(Document.status == "completed")
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
        
    docs = query.order_by(Document.created_at.asc()).all()
    
    trends = []
    
    # Normalization Map
    METRIC_MAP = {
        # Glucose aliases
        "GLUCOSE": "Glucose",
        "BLOOD GLUCOSE": "Glucose",
        "BLOOD SUGAR": "Glucose",
        "SUGAR": "Glucose",
        "RBS": "Glucose",
        "FBS": "Glucose",
        "FASTING GLUCOSE": "Glucose",
        "RANDOM BLOOD SUGAR": "Glucose",
        "GLUCOSE FASTING": "Glucose",
        "GLUCOSE RANDOM": "Glucose",
        "POST PRANDIAL GLUCOSE": "Glucose",
        "BLOOD SUGAR FASTING": "Glucose",
        "BLOOD SUGAR RANDOM": "Glucose",
        # Hemoglobin aliases
        "HEMOGLOBIN": "Hemoglobin",
        "HB": "Hemoglobin",
        "HGB": "Hemoglobin",
        "HEMOGLOBIN A1C": "Hemoglobin", # Grouping A1c with Hemoglobin for base trends
        "HBA1C": "Hemoglobin",
        "A1C": "Hemoglobin",
        # Vitals aliases
        "BLOOD PRESSURE": "BP",
        "HEART RATE": "HR",
        "PULSE": "HR",
        "SPO2": "SpO2",
        "OXYGEN": "SpO2",
        "TEMPERATURE": "Temperature",
        "TEMP": "Temperature"
    }

    def normalize_key(key: str) -> str:
        k = str(key).upper().strip()
        return METRIC_MAP.get(k, key)

    def extract_numeric(val: Any) -> float:
        if val is None: return None
        try:
            # Handle BP specifically "120/80" -> Sistolic
            if isinstance(val, str) and "/" in val:
                return float(val.split("/")[0])
            # Clean string like "11.2 g/dL" or "120 mg/dL"
            clean_str = re.sub(r'[^0-9.]', '', str(val))
            return float(clean_str) if clean_str else None
        except:
            return None

    for doc in docs:
        data = doc.extracted_data
        if not data:
            continue
            
        entry = {
            "date": doc.created_at.strftime("%b %d, %H:%M"),
            "doc_id": doc.id,
            "metrics": {}
        }
        
        # 1. Process Lab Results
        lab_data = data.get("lab_results", [])
        
        # Handle Dictionary Format: {"Glucose": {"value": 120}}
        if isinstance(lab_data, dict):
            for test, info in lab_data.items():
                norm_test = normalize_key(test)
                if isinstance(info, dict):
                    val = extract_numeric(info.get("value"))
                    if val is not None: entry["metrics"][norm_test] = val
                else:
                    val = extract_numeric(info)
                    if val is not None: entry["metrics"][norm_test] = val
        
        # Handle List Format: [{"test": "Glucose", "value": 120}]
        elif isinstance(lab_data, list):
            for item in lab_data:
                if not isinstance(item, dict): continue
                test_name = item.get("test") or item.get("name") or item.get("label")
                if test_name:
                    norm_test = normalize_key(test_name)
                    val = extract_numeric(item.get("value") or item.get("result"))
                    if val is not None: entry["metrics"][norm_test] = val

        # 2. Process Vitals
        vitals_data = data.get("vital_signs", [])
        
        # Handle Dictionary Format: {"BP": "120/80"}
        if isinstance(vitals_data, dict):
            for vital, info in vitals_data.items():
                norm_vital = normalize_key(vital)
                # Specialized BP handling for trends (Systolic)
                if norm_vital == "BP" and isinstance(info, str) and "/" in info:
                    val = extract_numeric(info)
                    if val is not None: entry["metrics"]["BP_Systolic"] = val
                else:
                    val = extract_numeric(info)
                    if val is not None: entry["metrics"][norm_vital] = val
                    
        # Handle List Format: [{"vital": "BP", "value": "120/80"}]
        elif isinstance(vitals_data, list):
            for item in vitals_data:
                if not isinstance(item, dict): continue
                vital_name = item.get("vital") or item.get("name") or item.get("type")
                if vital_name:
                    norm_vital = normalize_key(vital_name)
                    val_data = item.get("value") or item.get("result")
                    if norm_vital == "BP" and isinstance(val_data, str) and "/" in val_data:
                        val = extract_numeric(val_data)
                        if val is not None: entry["metrics"]["BP_Systolic"] = val
                    else:
                        val = extract_numeric(val_data)
                        if val is not None: entry["metrics"][norm_vital] = val

        if entry["metrics"]:
            trends.append(entry)
            
    return trends

async def get_medication_schedule(db: Session, patient_id: int = None):
    """
    Consolidates medications from all completed documents into a unified daily schedule.
    """
    # Fetch documents from last 90 days to ensure active prescriptions
    ninety_days_ago = datetime.datetime.utcnow() - datetime.timedelta(days=90)
    query = db.query(Document).filter(
        Document.status == "completed",
        Document.created_at >= ninety_days_ago
    )
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
        
    docs = query.order_by(Document.created_at.desc()).all()
    
    medications_map = {} # name -> details
    
    for doc in docs:
        data = doc.extracted_data
        if not data:
            continue
            
        meds = data.get("medications", [])
        if not isinstance(meds, list):
            continue
            
        for med in meds:
            if not isinstance(med, dict):
                continue
                
            name = med.get("name", "Unknown").strip().title()
            if not name or name == "Unknown":
                continue
                
            # Deduplicate by name, keep the most recent one
            if name not in medications_map:
                medications_map[name] = {
                    "name": name,
                    "dosage": med.get("dosage"),
                    "frequency": med.get("frequency"),
                    "type": med.get("type"),
                    "prescribed_date": doc.created_at.strftime("%Y-%m-%d"),
                    "insights": data.get("health_insights")
                }
    
    # Categorize for the timeline
    schedule = {
        "Morning": [],
        "Afternoon": [],
        "Evening": [],
        "Night": [],
        "Other/As Needed": []
    }
    
    for med in medications_map.values():
        freq = str(med.get("frequency", "")).lower()
        
        assigned = False
        if any(keyword in freq for keyword in ["morning", "subah", "nashta", "breakfast"]):
            schedule["Morning"].append(med)
            assigned = True
        if any(keyword in freq for keyword in ["afternoon", "dopahar", "lunch"]):
            schedule["Afternoon"].append(med)
            assigned = True
        if any(keyword in freq for keyword in ["evening", "shaam", "tea"]):
            schedule["Evening"].append(med)
            assigned = True
        if any(keyword in freq for keyword in ["night", "raat", "dinner", "sote"]):
            schedule["Night"].append(med)
            assigned = True
            
        if not assigned:
            schedule["Other/As Needed"].append(med)
            
    return schedule

async def generate_medical_summary_pdf(db: Session, user_id: int = 1):
    """
    Generates a professional consolidated medical summary PDF.
    """
    # 1. Fetch data & config for branding
    docs = db.query(Document).filter(Document.status == "completed").order_by(Document.created_at.desc()).all()
    schedule = await get_medication_schedule(db)
    trends = await get_health_trends(db)
    config = await get_config(db, user_id)
    
    # Audit: PDF Download
    create_audit_log(db, user_id, "download_summary_pdf", "document", details="User downloaded personal medical summary PDF")
    
    # 2. Create PDF buffer
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=letter)
    elements = []
    styles = getSampleStyleSheet()
    
    # Custom Styles using branding
    theme_color = colors.HexColor(config.pdf_theme_color) if config.pdf_theme_color else colors.darkblue
    
    title_style = ParagraphStyle('TitleStyle', parent=styles['Heading1'], spaceAfter=20, alignment=1, textColor=theme_color)
    section_style = ParagraphStyle('SectionStyle', parent=styles['Heading2'], spaceAfter=10, spaceBefore=20, color=theme_color)
    normal_style = styles['Normal']
    
    # 2.5 Add Logo if exists
    if config.clinic_logo_url:
        try:
            # Construct absolute path for reportlab
            logo_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), config.clinic_logo_url.lstrip('/'))
            if os.path.exists(logo_path):
                img = Image(logo_path, width=80, height=80)
                img.hAlign = 'CENTER' # As per user preference or centered for symmetry
                elements.append(img)
                elements.append(Spacer(1, 12))
        except Exception as e:
            print(f"Error adding logo to PDF: {e}")
    
    # 3. Build Content
    clinic_label = getattr(config, 'clinic_name', 'Health Docs AI Clinic') or 'Health Docs AI Clinic'
    elements.append(Paragraph(f"{clinic_label}", title_style))
    
    clinic_address = getattr(config, 'clinic_address', None)
    if clinic_address:
        elements.append(Paragraph(f"{clinic_address}", ParagraphStyle('Addr', parent=normal_style, alignment=1, fontSize=9, textColor=colors.grey, spaceAfter=10)))
    
    elements.append(Paragraph(f"Medical Summary - Generated on: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}", ParagraphStyle('Sub', parent=normal_style, alignment=1, fontSize=10)))
    elements.append(Spacer(1, 12))
    
    # Section: Active Medications
    elements.append(Paragraph("1. Active Medication Schedule (Last 90 Days)", section_style))
    med_data = [["Time", "Medicine", "Dosage", "Frequency"]]
    for time, meds in schedule.items():
        for m in meds:
            med_data.append([time, m['name'], m.get('dosage') or '-', m.get('frequency') or '-'])
    
    if len(med_data) > 1:
        t = Table(med_data, colWidths=[80, 150, 100, 150])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), theme_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('GRID', (0, 0), (-1, -1), 1, colors.black),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("No active medications found.", normal_style))
        
    # Section: Recent Vitals & Lab Trends
    elements.append(Paragraph("2. Recent Health Trends", section_style))
    trend_data = [["Date", "Metrics (Lab Results / Vitals)"]]
    for trend in trends[:5]: # Last 5 readings
        metrics_str = ", ".join([f"{k}: {v}" for k, v in trend['metrics'].items()])
        # Wrap string in Paragraph to enable text wrapping in table
        metrics_para = Paragraph(metrics_str, styles['Normal'])
        trend_data.append([trend['date'], metrics_para])
        
    if len(trend_data) > 1:
        t = Table(trend_data, colWidths=[100, 380])
        t.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), theme_color),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
            ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ]))
        elements.append(t)
    else:
        elements.append(Paragraph("No historical trends available.", normal_style))
        
    # Section: Health Insights Summary
    elements.append(Paragraph("3. AI Health Insights & Guidance", section_style))
    seen_insights = set()
    for d in docs[:3]: # Top 3 recent insights
        if not d.extracted_data or not isinstance(d.extracted_data, dict):
            continue
        insight = d.extracted_data.get("health_insights")
        if insight and insight not in seen_insights:
            elements.append(Paragraph(f"<b>{d.created_at.strftime('%Y-%m-%d')}:</b> {insight}", normal_style))
            elements.append(Spacer(1, 6))
            seen_insights.add(insight)
            
    # Disclaimer
    elements.append(Spacer(1, 30))
    elements.append(Paragraph("<b>Disclaimer:</b> This report is generated by an AI assistant based on provided documents. It is for informational purposes only. Please consult your physician for professional medical advice.", ParagraphStyle('Disc', parent=normal_style, fontSize=8, textColor=colors.red)))
    
    # 4. Generate PDF
    doc.build(elements)
    buffer.seek(0)
    
    filename_safe = clinic_label.replace(' ', '_')
    return StreamingResponse(
        buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename_safe}_Summary.pdf"}
    )

async def check_medication_interactions(db: Session):
    """
    Identifies potential interactions between all active medications.
    """
    schedule = await get_medication_schedule(db)
    
    # Flatten all med names
    all_meds = []
    for time_group in schedule.values():
        for med in time_group:
            all_meds.append(med["name"])
            
    # Deduplicate
    unique_meds = list(set(all_meds))
    
    # Audit: Interactions Check
    create_audit_log(db, 1, "check_interactions", "medical_analysis", details=f"Checked interactions for {len(unique_meds)} drugs")
    
    if not unique_meds:
        return {"status": "success", "analysis": "No active medications found to analyze."}
        
    return await AIService.check_interactions(unique_meds)

async def search_medications(query: str, db: Session):
    """
    Searches for a specific medicine across all historical documents.
    """
    docs = db.query(Document).filter(Document.status == "completed").all()
    results = []
    
    query = query.lower()
    for d in docs:
        meds = d.extracted_data.get("medications", [])
        for m in meds:
            if query in str(m.get("name", "")).lower():
                results.append({
                    "date": d.created_at.strftime("%Y-%m-%d"),
                    "medicine": m,
                    "doc_id": d.id
                })
                
    return results

async def get_dashboard_alerts(db: Session, patient_id: int = None):
    """
    Scans recent documents for critical health metrics and system alerts.
    """
    # 1. Check for Pending Documents (System Alert)
    pending_query = db.query(Document).filter(Document.status.in_(["processing", "pending"]))
    if patient_id:
        pending_query = pending_query.filter(Document.patient_id == patient_id)
    
    pending_count = pending_query.count()
    alerts = []
    
    if pending_count > 5:
        alerts.append({
            "id": "system_pending",
            "type": "warning",
            "message": f"System Load: {pending_count} reports are currently in the processing queue.",
            "action": "View Queue"
        })

    # 2. Check for Critical Lab Results/Vitals in the latest completed document
    latest_query = db.query(Document).filter(Document.status == "completed")
    if patient_id:
        latest_query = latest_query.filter(Document.patient_id == patient_id)
    
    latest_doc = latest_query.order_by(Document.created_at.desc()).first()
    
    if latest_doc and latest_doc.extracted_data:
        data = latest_doc.extracted_data
        
        # Check Glucose
        lab_results = data.get("lab_results", [])
        glucose_val = None
        
        # Normalize search for glucose
        if isinstance(lab_results, list):
            for item in lab_results:
                test = str(item.get("test", "")).upper()
                if "GLUCOSE" in test or "SUGAR" in test:
                    try:
                        val_str = re.sub(r'[^0-9.]', '', str(item.get("value", "")))
                        glucose_val = float(val_str) if val_str else None
                        break
                    except: pass
        
        if glucose_val and glucose_val > 140:
            alerts.append({
                "id": f"critical_glucose_{latest_doc.id}",
                "type": "critical",
                "message": f"Elevated Glucose Detected: {glucose_val} mg/dL (Report: {latest_doc.filename})",
                "action": "Review Labs"
            })
            
        # Check Cholesterol
        chol_val = None
        if isinstance(lab_results, list):
            for item in lab_results:
                test = str(item.get("test", "")).upper()
                if "CHOLESTEROL" in test:
                    try:
                        val_str = re.sub(r'[^0-9.]', '', str(item.get("value", "")))
                        chol_val = float(val_str) if val_str else None
                        break
                    except: pass
        
        if chol_val and chol_val > 200:
            alerts.append({
                "id": f"high_chol_{latest_doc.id}",
                "type": "warning",
                "message": f"High Cholesterol Detected: {chol_val} mg/dL (Limit: 200). Lifestyle review suggested.",
                "action": "View Recommendations"
            })
            
        # Check Blood Pressure
        vitals = data.get("vital_signs", [])
        sbp = None
        if isinstance(vitals, list):
            for item in vitals:
                vital = str(item.get("vital", "")).upper()
                if "BP" in vital or "BLOOD PRESSURE" in vital:
                    val_str = str(item.get("value", ""))
                    if "/" in val_str:
                        try:
                            sbp_str = re.sub(r'[^0-9.]', '', val_str.split("/")[0])
                            sbp = float(sbp_str) if sbp_str else None
                            break
                        except: pass

        if sbp and sbp > 160:
            alerts.append({
                "id": f"critical_bp_{latest_doc.id}",
                "type": "critical",
                "message": f"Hypertensive Crisis Alert: Systolic BP is {sbp} mmHg. Immediate review recommended.",
                "action": "Review Vitals"
            })

    # Fallback to empty list if no critical issues found
    return alerts
