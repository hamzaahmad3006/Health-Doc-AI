from fastapi import APIRouter, Depends, UploadFile, File
from sqlalchemy.orm import Session
from typing import List
from backend.database import get_db
from backend.controllers import document_controller
from backend import schemas

from backend.services.ai_service import AIService
from backend.services.fhir_service import FHIRService

router = APIRouter(redirect_slashes=False)

@router.get("/", response_model=List[schemas.Document])
async def get_documents(patient_id: int = None, db: Session = Depends(get_db)):
    return await document_controller.list_documents(db, patient_id)

@router.get("/patients")
async def get_patients(db: Session = Depends(get_db)):
    return await document_controller.list_patients(db)

@router.get("/stats/")
async def get_stats(patient_id: int = None, db: Session = Depends(get_db)):
    return await document_controller.get_stats(db, patient_id)

@router.get("/export/{format}")
async def export_documents(format: str, db: Session = Depends(get_db)):
    return await document_controller.export_documents(db, format)

@router.post("/upload/", response_model=schemas.Document)
async def upload_document(file: UploadFile = File(...), db: Session = Depends(get_db)):
    # Mock user_id=1 for now
    return await document_controller.upload_and_process(file, db, user_id=1)

@router.get("/{doc_id}/fhir")
async def get_fhir_export(doc_id: str, db: Session = Depends(get_db)):
    doc = await document_controller.get_document_status(doc_id, db)
    fhir_bundle = FHIRService.map_to_fhir_r4(schemas.Document.from_orm(doc).dict())
    
    # Optional: trigger webhook if configured
    config = await document_controller.get_config(db, user_id=1)
    if config.webhook_url:
        await FHIRService.dispatch_webhook(config.webhook_url, fhir_bundle)
        
    return fhir_bundle

@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: Session = Depends(get_db)):
    return await document_controller.delete_document(doc_id, db)

@router.patch("/{doc_id}", response_model=schemas.Document)
async def update_document(doc_id: str, doc_update: schemas.DocumentUpdate, db: Session = Depends(get_db)):
    return await document_controller.update_document(doc_id, doc_update.dict(exclude_unset=True), db)

@router.get("/configuration/workspace", response_model=schemas.WorkspaceConfig)
async def get_config(db: Session = Depends(get_db)):
    return await document_controller.get_config(db, user_id=1)

@router.patch("/configuration/workspace", response_model=schemas.WorkspaceConfigUpdate)
async def update_config(config_update: schemas.WorkspaceConfigUpdate, db: Session = Depends(get_db)):
    return await document_controller.update_config(db, user_id=1, obj_in=config_update.dict(exclude_unset=True))

@router.post("/configuration/logo")
async def upload_logo(file: UploadFile = File(...), db: Session = Depends(get_db)):
    return await document_controller.upload_clinic_logo(file, db, user_id=1)

@router.get("/analysis/trends")
async def get_trends(patient_id: int = None, db: Session = Depends(get_db)):
    return await document_controller.get_health_trends(db, patient_id)

@router.get("/analysis/schedule")
async def get_schedule(patient_id: int = None, db: Session = Depends(get_db)):
    return await document_controller.get_medication_schedule(db, patient_id)

@router.get("/analysis/summary-pdf")
async def get_summary_pdf(document_id: str = None, db: Session = Depends(get_db)):
    return await document_controller.generate_medical_summary_pdf(db, document_id=document_id)

@router.get("/analysis/interactions")
async def get_interactions(db: Session = Depends(get_db)):
    return await document_controller.check_medication_interactions(db)

@router.get("/analysis/search-meds")
async def search_meds(query: str, db: Session = Depends(get_db)):
    return await document_controller.search_medications(query, db)


@router.get("/alerts")
async def get_alerts(patient_id: int = None, db: Session = Depends(get_db)):
    return await document_controller.get_dashboard_alerts(db, patient_id)

@router.get("/{doc_id}", response_model=schemas.Document)
async def get_status(doc_id: str, db: Session = Depends(get_db)):
    return await document_controller.get_document_status(doc_id, db)
