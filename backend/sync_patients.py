import os
import json
from sqlalchemy.orm import Session
from backend.database import SessionLocal
from backend.models import Document, Patient

def sync_patients():
    db: Session = SessionLocal()
    try:
        # 1. Fetch all documents (even those linked) to check for missing age/gender data
        docs = db.query(Document).filter(Document.extracted_data != None).all()
        print(f"Scanning {len(docs)} reports for patient demographics...")

        for doc in docs:
            # 2. Check if extracted_data exists and has a patient_name
            if doc.extracted_data and isinstance(doc.extracted_data, dict):
                patient_name = doc.extracted_data.get("patient_name")
                patient_age = doc.extracted_data.get("patient_age")
                patient_gender = doc.extracted_data.get("patient_gender")
                
                if patient_name:
                    print(f"Processing report for: {patient_name}")
                    
                    # 3. Find or create patient
                    patient = db.query(Patient).filter(
                        Patient.name.ilike(patient_name),
                        Patient.user_id == doc.user_id
                    ).first()
                    
                    if not patient:
                        print(f"Creating new patient profile for: {patient_name}")
                        patient = Patient(
                            name=patient_name, 
                            user_id=doc.user_id,
                            age=patient_age,
                            gender=patient_gender
                        )
                        db.add(patient)
                        db.flush() # Get the new ID
                    else:
                        # Backfill age/gender if missing
                        if patient_age and not patient.age:
                            print(f"Updating age for {patient_name}: {patient_age}")
                            patient.age = patient_age
                        if patient_gender and not patient.gender:
                            print(f"Updating gender for {patient_name}: {patient_gender}")
                            patient.gender = patient_gender
                    
                    # 4. Link document to patient
                    doc.patient_id = patient.id
                    print(f"Linked doc {doc.id} to patient {patient_name}")
        
        db.commit()
        print("Data synchronization complete.")
        
    except Exception as e:
        db.rollback()
        print(f"Error during synchronization: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    sync_patients()
