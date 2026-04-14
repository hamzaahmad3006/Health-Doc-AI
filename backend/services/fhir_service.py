import datetime
import uuid
import httpx
from typing import Dict, Any, List

class FHIRService:
    @staticmethod
    def map_to_fhir_r4(doc_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Maps extracted medical data to a FHIR R4 Bundle.
        """
        bundle_id = str(uuid.uuid4())
        extracted = doc_data.get("extracted_data", {})
        
        # 1. Patient Resource
        patient_name = extracted.get("patient_name", "Anonymous Patient")
        patient_resource = {
            "resourceType": "Patient",
            "id": "patient-1",
            "name": [{"text": patient_name}],
            "gender": "unknown"
        }
        
        bundle = {
            "resourceType": "Bundle",
            "id": bundle_id,
            "type": "collection",
            "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
            "entry": [
                {"resource": patient_resource}
            ]
        }
        
        # 2. Observations (Vitals)
        vitals = extracted.get("vital_signs", {})
        if isinstance(vitals, dict):
            for name, val in vitals.items():
                obs = {
                    "resourceType": "Observation",
                    "status": "final",
                    "code": {
                        "text": name
                    },
                    "subject": {"reference": "Patient/patient-1"},
                    "valueString": str(val)
                }
                bundle["entry"].append({"resource": obs})
        
        # 3. Observations (Labs)
        labs = extracted.get("lab_results", {})
        if isinstance(labs, dict):
            for name, info in labs.items():
                val = info.get("value") if isinstance(info, dict) else info
                obs = {
                    "resourceType": "Observation",
                    "status": "final",
                    "category": [{
                        "coding": [{
                            "system": "http://terminology.hl7.org/CodeSystem/observation-category",
                            "code": "laboratory"
                        }]
                    }],
                    "code": {"text": name},
                    "subject": {"reference": "Patient/patient-1"},
                    "valueString": str(val)
                }
                bundle["entry"].append({"resource": obs})
                
        # 4. MedicationStatements
        meds = extracted.get("medications", [])
        if isinstance(meds, list):
            for med in meds:
                if not isinstance(med, dict): continue
                statement = {
                    "resourceType": "MedicationStatement",
                    "status": "active",
                    "medicationCodeableConcept": {
                        "text": med.get("name", "Unknown Medication")
                    },
                    "subject": {"reference": "Patient/patient-1"},
                    "dosage": [{
                        "text": f"{med.get('dosage')} - {med.get('frequency')}"
                    }]
                }
                bundle["entry"].append({"resource": statement})

        return bundle

    @staticmethod
    async def dispatch_webhook(url: str, payload: Dict[str, Any]):
        """
        Sends FHIR payload to an external webhook endpoint.
        """
        if not url:
            return
            
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(url, json=payload, timeout=10.0)
                response.raise_for_status()
                print(f"Webhook dispatched successfully to {url}")
        except Exception as e:
            print(f"Webhook dispatch failed: {e}")
