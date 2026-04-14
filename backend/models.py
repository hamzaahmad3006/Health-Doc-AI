from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, JSON, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    full_name = Column(String)
    last_login_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Patient(Base):
    __tablename__ = "patients"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    age = Column(Integer, nullable=True)
    gender = Column(String, nullable=True)
    user_id = Column(Integer, ForeignKey("users.id")) # Managing doctor
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    documents = relationship("Document", back_populates="patient")

class Document(Base):
    __tablename__ = "documents"
    id = Column(String, primary_key=True, index=True)
    filename = Column(String)
    file_path = Column(String)
    status = Column(String, default="pending") # pending, processing, completed, error
    confidence_score = Column(Float, nullable=True)
    extracted_data = Column(JSON, nullable=True)
    is_approved = Column(Boolean, default=False)
    requires_human_review = Column(Boolean, default=False)
    is_anonymized = Column(Boolean, default=False)
    user_id = Column(Integer, ForeignKey("users.id"))
    patient_id = Column(Integer, ForeignKey("patients.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="documents")
    patient = relationship("Patient", back_populates="documents")

class WorkspaceConfig(Base):
    __tablename__ = "workspace_configs"
    id = Column(Integer, primary_key=True, index=True)
    ai_model = Column(String, default="llama-3.3-70b-versatile")
    language = Column(String, default="English")
    custom_fields = Column(JSON, default=lambda: ["patient_name", "diagnosis", "medications", "vital_signs", "lab_results"]) 
    instructions = Column(JSON, default=lambda: ["Extract vitals like BP and HR", "List all prescribed medicines", "Highlight abnormal lab values if mentioned"])
    confidence_threshold = Column(Float, default=0.85)
    auto_approve = Column(Boolean, default=True)
    retention_days = Column(Integer, default=30)
    
    # New Branding Fields
    clinic_name = Column(String, default="Health Docs AI Clinic")
    clinic_address = Column(String, nullable=True)
    clinic_logo_url = Column(String, nullable=True)
    pdf_theme_color = Column(String, default="#3b82f6") # Blue-500
    webhook_url = Column(String, nullable=True)
    
    user_id = Column(Integer, ForeignKey("users.id"))

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    action = Column(String) # e.g., "view", "download", "delete", "login"
    resource_type = Column(String) # e.g., "document", "user"
    resource_id = Column(String, nullable=True)
    details = Column(String, nullable=True)
    ip_address = Column(String, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

User.documents = relationship("Document", back_populates="owner")
User.configs = relationship("WorkspaceConfig", backref="owner")
User.audit_logs = relationship("AuditLog", backref="user")
