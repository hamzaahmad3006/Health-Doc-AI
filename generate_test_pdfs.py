"""
Generate test medical report PDFs with patient demographics (Age, Gender).
"""
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.lib import colors
from reportlab.lib.units import inch

def create_john_donland_report():
    """Creates a lab report for John Donland with age and gender."""
    c = canvas.Canvas("test_medical_report.pdf", pagesize=letter)
    width, height = letter

    # Header
    c.setFillColor(colors.HexColor("#1a365d"))
    c.rect(0, height - 100, width, 100, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 45, "City Medical Laboratory")
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 65, "123 Healthcare Avenue, Karachi | Phone: 021-12345678")
    c.drawCentredString(width / 2, height - 80, "Email: info@citymedlab.com | PMDC Reg: LAB-2024-0891")

    # Patient Info Box
    y = height - 130
    c.setFillColor(colors.HexColor("#f0f4f8"))
    c.rect(40, y - 85, width - 80, 85, fill=True, stroke=True)
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, y - 20, "PATIENT INFORMATION")
    
    c.setFont("Helvetica", 11)
    c.drawString(60, y - 40, "Patient Name: John Donland")
    c.drawString(60, y - 55, "Age: 45 years")
    c.drawString(60, y - 70, "Gender: Male")
    
    c.drawString(350, y - 40, "Date: 2025-03-15")
    c.drawString(350, y - 55, "Report ID: LR-2025-00412")
    c.drawString(350, y - 70, "Ref. Doctor: Dr. Ahmed Khan")

    # Lab Results Header
    y = y - 110
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#1a365d"))
    c.drawString(60, y, "LABORATORY RESULTS - Complete Blood Count (CBC)")
    
    # Table Header
    y -= 25
    c.setFillColor(colors.HexColor("#2c5282"))
    c.rect(40, y - 5, width - 80, 22, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Test Name")
    c.drawString(230, y, "Result")
    c.drawString(350, y, "Normal Range")
    c.drawString(470, y, "Status")

    # Table Rows
    results = [
        ("Hemoglobin", "14.2 g/dL", "13.0 - 17.0 g/dL", "Normal"),
        ("WBC Count", "7,500 /cumm", "4,000 - 11,000 /cumm", "Normal"),
        ("RBC Count", "4.8 million/cumm", "4.5 - 5.5 million/cumm", "Normal"),
        ("Platelet Count", "250,000 /cumm", "150,000 - 400,000 /cumm", "Normal"),
        ("Glucose (Fasting)", "142 mg/dL", "70 - 100 mg/dL", "HIGH"),
        ("HbA1c", "7.2%", "< 5.7%", "HIGH"),
        ("Total Cholesterol", "220 mg/dL", "< 200 mg/dL", "HIGH"),
        ("Creatinine", "1.1 mg/dL", "0.7 - 1.3 mg/dL", "Normal"),
    ]
    
    c.setFont("Helvetica", 10)
    for i, (test, result, normal, status) in enumerate(results):
        y -= 22
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#edf2f7"))
            c.rect(40, y - 5, width - 80, 22, fill=True)
        
        c.setFillColor(colors.black)
        c.drawString(60, y, test)
        c.drawString(230, y, result)
        c.drawString(350, y, normal)
        
        if status == "HIGH":
            c.setFillColor(colors.red)
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica", 10)
        c.drawString(470, y, status)
        c.setFont("Helvetica", 10)

    # Vital Signs
    y -= 40
    c.setFillColor(colors.HexColor("#1a365d"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, y, "VITAL SIGNS")
    
    y -= 25
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 11)
    c.drawString(60, y, "Blood Pressure: 135/88 mmHg")
    c.drawString(300, y, "Heart Rate: 78 bpm")
    y -= 18
    c.drawString(60, y, "Temperature: 98.6°F")
    c.drawString(300, y, "SpO2: 97%")

    # ===== MEDICATION SCHEDULE =====
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#1a365d"))
    c.drawString(60, y, "PRESCRIBED MEDICATION SCHEDULE")

    # Table Header
    y -= 25
    c.setFillColor(colors.HexColor("#2c5282"))
    c.rect(40, y - 5, width - 80, 22, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Medication")
    c.drawString(200, y, "Dosage")
    c.drawString(290, y, "Morning")
    c.drawString(370, y, "Afternoon")
    c.drawString(460, y, "Night")

    medications = [
        ("Metformin",       "500mg",  "Yes", "Yes", "No"),
        ("Atorvastatin",    "10mg",   "No",  "No",  "Yes"),
        ("Lisinopril",      "5mg",    "Yes", "No",  "No"),
        ("Aspirin",         "75mg",   "No",  "Yes", "No"),
        ("Omeprazole",      "20mg",   "Yes", "No",  "Yes"),
    ]

    c.setFont("Helvetica", 10)
    for i, (med, dose, morn, aft, night) in enumerate(medications):
        y -= 22
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#edf2f7"))
            c.rect(40, y - 5, width - 80, 22, fill=True)
        c.setFillColor(colors.black)
        c.drawString(60, y, med)
        c.drawString(200, y, dose)
        # Morning
        if morn == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(305, y, morn)
        # Afternoon
        if aft == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(390, y, aft)
        # Night
        if night == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(470, y, night)
        c.setFont("Helvetica", 10)

    # Doctor Notes
    y -= 35
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.HexColor("#1a365d"))
    c.drawString(60, y, "DOCTOR'S NOTES:")
    y -= 18
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawString(60, y, "Patient shows elevated glucose and HbA1c levels suggestive of Type 2 Diabetes.")
    y -= 15
    c.drawString(60, y, "Cholesterol levels slightly above normal range. Lifestyle modifications recommended.")
    y -= 15
    c.drawString(60, y, "Take Metformin with meals (morning & afternoon). Atorvastatin before bed.")

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawCentredString(width / 2, 40, "This is a computer-generated report. Please consult your physician for medical advice.")
    
    c.save()
    print("✅ Created: test_medical_report.pdf (John Donland, Male, Age 45)")


def create_jane_doe_report():
    """Creates a lab report for Jane Doe with age and gender."""
    c = canvas.Canvas("jane_doe_lab_report.pdf", pagesize=letter)
    width, height = letter

    # Header
    c.setFillColor(colors.HexColor("#4a1a6b"))
    c.rect(0, height - 100, width, 100, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 45, "National Health Diagnostics")
    c.setFont("Helvetica", 11)
    c.drawCentredString(width / 2, height - 65, "456 Wellness Road, Lahore | Phone: 042-87654321")
    c.drawCentredString(width / 2, height - 80, "Email: lab@nationalhealthdiag.pk | PMDC Reg: LAB-2024-1245")

    # Patient Info Box
    y = height - 130
    c.setFillColor(colors.HexColor("#faf5ff"))
    c.rect(40, y - 85, width - 80, 85, fill=True, stroke=True)
    
    c.setFillColor(colors.black)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, y - 20, "PATIENT INFORMATION")
    
    c.setFont("Helvetica", 11)
    c.drawString(60, y - 40, "Patient Name: Jane Doe")
    c.drawString(60, y - 55, "Age: 32 years")
    c.drawString(60, y - 70, "Gender: Female")
    
    c.drawString(350, y - 40, "Date: 2025-04-02")
    c.drawString(350, y - 55, "Report ID: LR-2025-00587")
    c.drawString(350, y - 70, "Ref. Doctor: Dr. Fatima Zahra")

    # Lab Results Header
    y = y - 110
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#4a1a6b"))
    c.drawString(60, y, "LABORATORY RESULTS - Comprehensive Metabolic Panel")

    # Table Header
    y -= 25
    c.setFillColor(colors.HexColor("#6b21a8"))
    c.rect(40, y - 5, width - 80, 22, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Test Name")
    c.drawString(230, y, "Result")
    c.drawString(350, y, "Normal Range")
    c.drawString(470, y, "Status")

    # Table Rows
    results = [
        ("Hemoglobin", "11.8 g/dL", "12.0 - 16.0 g/dL", "LOW"),
        ("WBC Count", "6,200 /cumm", "4,000 - 11,000 /cumm", "Normal"),
        ("RBC Count", "4.1 million/cumm", "3.8 - 5.2 million/cumm", "Normal"),
        ("Platelet Count", "280,000 /cumm", "150,000 - 400,000 /cumm", "Normal"),
        ("Glucose (Fasting)", "92 mg/dL", "70 - 100 mg/dL", "Normal"),
        ("Vitamin D", "18 ng/mL", "30 - 100 ng/mL", "LOW"),
        ("Iron (Serum)", "45 mcg/dL", "60 - 170 mcg/dL", "LOW"),
        ("TSH", "3.2 mIU/L", "0.4 - 4.0 mIU/L", "Normal"),
    ]
    
    c.setFont("Helvetica", 10)
    for i, (test, result, normal, status) in enumerate(results):
        y -= 22
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#faf5ff"))
            c.rect(40, y - 5, width - 80, 22, fill=True)
        
        c.setFillColor(colors.black)
        c.drawString(60, y, test)
        c.drawString(230, y, result)
        c.drawString(350, y, normal)
        
        if status == "LOW":
            c.setFillColor(colors.HexColor("#c05621"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica", 10)
        c.drawString(470, y, status)
        c.setFont("Helvetica", 10)

    # Vital Signs
    y -= 40
    c.setFillColor(colors.HexColor("#4a1a6b"))
    c.setFont("Helvetica-Bold", 14)
    c.drawString(60, y, "VITAL SIGNS")
    
    y -= 25
    c.setFillColor(colors.black)
    c.setFont("Helvetica", 11)
    c.drawString(60, y, "Blood Pressure: 110/72 mmHg")
    c.drawString(300, y, "Heart Rate: 68 bpm")
    y -= 18
    c.drawString(60, y, "Temperature: 98.2°F")
    c.drawString(300, y, "SpO2: 99%")

    # ===== MEDICATION SCHEDULE =====
    y -= 40
    c.setFont("Helvetica-Bold", 14)
    c.setFillColor(colors.HexColor("#4a1a6b"))
    c.drawString(60, y, "PRESCRIBED MEDICATION SCHEDULE")

    # Table Header
    y -= 25
    c.setFillColor(colors.HexColor("#6b21a8"))
    c.rect(40, y - 5, width - 80, 22, fill=True)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(60, y, "Medication")
    c.drawString(200, y, "Dosage")
    c.drawString(290, y, "Morning")
    c.drawString(370, y, "Afternoon")
    c.drawString(460, y, "Night")

    medications = [
        ("Ferrous Sulfate",  "325mg",     "Yes", "No",  "No"),
        ("Vitamin D3",       "50,000 IU", "Yes", "No",  "No"),
        ("Folic Acid",       "5mg",       "Yes", "No",  "Yes"),
        ("Calcium Carbonate","500mg",     "No",  "Yes", "Yes"),
        ("Paracetamol",      "500mg",     "No",  "Yes", "No"),
    ]

    c.setFont("Helvetica", 10)
    for i, (med, dose, morn, aft, night) in enumerate(medications):
        y -= 22
        if i % 2 == 0:
            c.setFillColor(colors.HexColor("#faf5ff"))
            c.rect(40, y - 5, width - 80, 22, fill=True)
        c.setFillColor(colors.black)
        c.drawString(60, y, med)
        c.drawString(200, y, dose)
        # Morning
        if morn == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(305, y, morn)
        # Afternoon
        if aft == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(390, y, aft)
        # Night
        if night == "Yes":
            c.setFillColor(colors.HexColor("#276749"))
            c.setFont("Helvetica-Bold", 10)
        else:
            c.setFillColor(colors.HexColor("#a0aec0"))
            c.setFont("Helvetica", 10)
        c.drawString(470, y, night)
        c.setFont("Helvetica", 10)

    # Doctor Notes
    y -= 35
    c.setFont("Helvetica-Bold", 12)
    c.setFillColor(colors.HexColor("#4a1a6b"))
    c.drawString(60, y, "DOCTOR'S NOTES:")
    y -= 18
    c.setFont("Helvetica", 10)
    c.setFillColor(colors.black)
    c.drawString(60, y, "Patient presents with mild anemia (low hemoglobin) and Vitamin D deficiency.")
    y -= 15
    c.drawString(60, y, "Iron levels are below normal. Recommending iron-rich diet and supplementation.")
    y -= 15
    c.drawString(60, y, "Take Ferrous Sulfate on empty stomach in morning. Calcium in afternoon & night.")

    # Footer
    c.setFont("Helvetica-Oblique", 8)
    c.setFillColor(colors.grey)
    c.drawCentredString(width / 2, 40, "This is a computer-generated report. Please consult your physician for medical advice.")
    
    c.save()
    print("✅ Created: jane_doe_lab_report.pdf (Jane Doe, Female, Age 32)")


if __name__ == "__main__":
    create_john_donland_report()
    create_jane_doe_report()
    print("\n🎉 Both test PDFs generated successfully!")
