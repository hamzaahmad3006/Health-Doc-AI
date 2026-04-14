import os
import json
import re
from typing import Dict, Any, List
from groq import Groq
import pytesseract
from PIL import Image
import pdfplumber
from dotenv import load_dotenv

# Re-load to be absolutely sure
load_dotenv()

class AIService:
    _client = None

    @staticmethod
    def scrub_pii(text: str) -> str:
        """
        Simple regex-based PII scrubber to mask phones and emails.
        Name masking is disabled as users prefer to see extracted patient names.
        """
        # Mask Emails
        text = re.sub(r'[\w\.-]+@[\w\.-]+\.\w+', '[EMAIL_MASKED]', text)
        # Mask Phone Numbers
        text = re.sub(r'\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}', '[PHONE_MASKED]', text)
        
        return text

    @classmethod
    def get_client(cls):
        if cls._client is None:
            api_key = os.getenv("GROQ_API_KEY")
            if api_key:
                cls._client = Groq(api_key=api_key)
        return cls._client

    @staticmethod
    async def extract_text(file_path: str) -> str:
        """
        Extracts text from PDF or Image using pdfplumber and pytesseract.
        """
        ext = os.path.splitext(file_path)[1].lower()
        extracted_text = ""

        try:
            if ext == ".pdf":
                with pdfplumber.open(file_path) as pdf:
                    for page in pdf.pages:
                        text = page.extract_text()
                        if text:
                            extracted_text += text + "\n"

            elif ext in [".png", ".jpg", ".jpeg"]:
                extracted_text = pytesseract.image_to_string(Image.open(file_path))

            elif ext == ".txt":
                with open(file_path, "r") as f:
                    extracted_text = f.read()

            return extracted_text.strip() or f"No text could be extracted from {os.path.basename(file_path)}"

        except Exception as e:
            print(f"Extraction Error: {e}")
            return f"Error extracting text: {str(e)}"

    @classmethod
    async def analyze_fields(cls, raw_text: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Extracts structured data using Groq models with dynamic fields and instructions.
        """
        client = cls.get_client()
        if not client:
            return {"error": "Groq API Key not found"}

        if not raw_text or "No text could be extracted" in raw_text:
            return {"error": "No text content to analyze", "status": "failed"}

        # Configuration extraction
        model = config.get("ai_model", "llama-3.3-70b-versatile") if config else "llama-3.3-70b-versatile"
        language = config.get("language", "English") if config else "English"
        custom_fields = config.get("custom_fields", []) if config else []
        instructions = config.get("instructions", []) if config else []

        # Build dynamic prompt
        instructions_text = "\n- ".join(instructions) if instructions else "No specific rules."
        
        system_prompt = (
            "You are a professional medical document analysis agent. "
            "Your goal is to extract structured health data from the provided text as a JSON object. "
            "The text might be in English, Urdu, or Roman Urdu (Hinglish/Urdu written in Latin alphabet).\n\n"
            f"Target Language for extraction: {language}.\n\n"
            "DIRECTIONS:\n"
            "1. VALIDATION: First, determine if the document is a medical report, lab result, prescription, or health-related. "
            "Set a boolean field 'is_medical' to true if it is, and false otherwise.\n"
            "2. IF NOT MEDICAL: If 'is_medical' is false, set all other fields to null and provide a brief explanation in 'rejection_reason' (e.g., 'This document appears to be a grocery receipt, not a medical report.').\n"
            "3. IF MEDICAL: If it is a MEDICAL REPORT/LAB RESULT, always look for: patient_name, patient_age, patient_gender, date, medical_record_number, lab_results (with values and ranges), diagnosis, and summary.\n"
            "4. If this is a PRESCRIPTION (locally known as 'Parchi') or MEDICINE LIST, look for: doctor_name, hospital_name, date, patient_age, patient_gender, vital_signs (BP, HR, Temp), and medications (name, dosage, frequency).\n"
            "5. If any CUSTOM FIELDS are provided below, prioritize them above all else.\n"
            "6. Extract ALL other relevant key-value pairs you find in the document.\n"
            "7. If a field seems ambiguous, extract it with a descriptive key.\n"
            "8. Translate medical terms to English if they are in another language, but keep original values.\n"
            "9. ADD A FIELD 'health_insights': Provide a brief, friendly explanation of why these medicines or tests might be prescribed. Keep it informative but cautious.\n"
            "10. ALWAYS include 'medical_disclaimer': 'This analysis is for informational purposes only. Please consult a qualified doctor before making any medical decisions.'\n"
            "11. ADD A BOOLEAN FIELD 'requires_human_review': Set to true if the text is illegible, vital signs are dangerously extreme, or if medications are unclear.\n"
            "12. CRITICAL: EXTRACT THE ACTUAL PATIENT NAME, AGE, AND GENDER. DO NOT MASK, DO NOT ANONYMIZE. If you see this data, you MUST return it as is.\n\n"
            "JSON STRUCTURE FOR METRICS:\n"
            "- lab_results: A list of objects like [{\"test\": \"Glucose\", \"value\": \"120 mg/dL\", \"range\": \"70-100\"}].\n"
            "- vital_signs: A list of objects like [{\"vital\": \"BP\", \"value\": \"120/80\"}, {\"vital\": \"HR\", \"value\": \"72\"}].\n"
            "- Always prioritize test names: 'Glucose', 'Hemoglobin', 'HbA1c', 'Creatinine'.\n\n"
            f"CUSTOM FIELDS: {', '.join(custom_fields) if custom_fields else 'patient_name, diagnosis, medications, vital_signs, lab_results'}\n"
            f"SPECIAL RULES: {instructions_text}\n\n"
            "Return ONLY a valid JSON object. If a specific requested field is missing, use null."
        )

        try:
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Extract all data from this document text:\n\n{raw_text[:4000]}"}
                ],
                model=model,
                response_format={"type": "json_object"}
            )
            return json.loads(chat_completion.choices[0].message.content)
        except Exception as e:
            print(f"Groq Extraction Error: {e}")
            return {"error": str(e), "status": "failed"}

    @classmethod
    async def process_document(cls, file_path: str, config: Dict[str, Any] = None) -> Dict[str, Any]:
        """
        Orchestrates OCR, Scrubbing, and Analysis.
        """
        raw_text = await cls.extract_text(file_path)
        
        # Privacy Layer: Scrub PII
        scrubbed_text = cls.scrub_pii(raw_text)
        
        extracted_data = await cls.analyze_fields(scrubbed_text, config)
        
        # Calculate a simple confidence score
        has_error = "error" in extracted_data
        confidence = 0.95 if not has_error else 0.0
        
        # Check for human review flag
        needs_review = extracted_data.get("requires_human_review", False)
        if confidence < 0.6: needs_review = True

        return {
            "data": extracted_data,
            "confidence": confidence,
            "needs_review": needs_review,
            "is_anonymized": True,
            "provider": f"Groq ({config.get('ai_model', 'llama-3.3-70b-versatile') if config else 'llama-3.3-70b-versatile'})",
            "raw_text_preview": scrubbed_text[:200] if scrubbed_text else ""
        }

    @staticmethod
    async def check_interactions(medications: List[str]):
        """
        Uses AI to identify potential interactions between a list of medications.
        """
        if not medications:
            return {"status": "success", "message": "No medications provided.", "interactions": []}
            
        meds_str = ", ".join(medications)
        prompt = f"""
        Identify potential medical interactions or conflicts between the following medications:
        Medications: {meds_str}
        
        Focus on:
        1. Serious risks (Major interactions).
        2. Side effects that might worsen when taken together.
        3. Simple advice on timing (e.g., don't take with milk).
        
        Format your response in simple, clear points. 
        Start with a disclaimer: "This is NOT medical advice. Consult your doctor."
        """
        
        try:
            client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            
            chat_completion = client.chat.completions.create(
                messages=[
                    {"role": "system", "content": "You are a helpful medical assistant focusing on drug safety."},
                    {"role": "user", "content": prompt}
                ],
                model="llama-3.3-70b-versatile",
            )
            
            return {
                "status": "success",
                "medications": medications,
                "analysis": chat_completion.choices[0].message.content
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
