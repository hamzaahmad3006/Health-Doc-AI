from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional, Any, Dict, List

class DocumentBase(BaseModel):
    filename: str
    status: str
    confidence_score: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None
    is_approved: bool = False
    requires_human_review: bool = False
    is_anonymized: bool = False

class DocumentCreate(DocumentBase):
    pass

class DocumentUpdate(BaseModel):
    filename: Optional[str] = None
    status: Optional[str] = None
    confidence_score: Optional[float] = None
    extracted_data: Optional[Dict[str, Any]] = None
    is_approved: Optional[bool] = None
    requires_human_review: Optional[bool] = None
    is_anonymized: Optional[bool] = None

class Document(DocumentBase):
    id: str
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class WorkspaceConfigBase(BaseModel):
    ai_model: str = "llama-3.3-70b-versatile"
    language: str = "English"
    custom_fields: List[str] = []
    instructions: List[str] = []
    confidence_threshold: float = 0.85
    auto_approve: bool = True
    retention_days: int = 30
    clinic_name: str = "Health Docs AI Clinic"
    clinic_address: Optional[str] = None
    clinic_logo_url: Optional[str] = None
    pdf_theme_color: str = "#3b82f6"
    webhook_url: Optional[str] = None

class WorkspaceConfigUpdate(BaseModel):
    ai_model: Optional[str] = None
    language: Optional[str] = None
    custom_fields: Optional[List[str]] = None
    instructions: Optional[List[str]] = None
    confidence_threshold: Optional[float] = None
    auto_approve: Optional[bool] = None
    retention_days: Optional[int] = None
    clinic_name: Optional[str] = None
    clinic_address: Optional[str] = None
    clinic_logo_url: Optional[str] = None
    pdf_theme_color: Optional[str] = None
    webhook_url: Optional[str] = None

class WorkspaceConfig(WorkspaceConfigBase):
    id: int
    user_id: int

    model_config = ConfigDict(from_attributes=True)

class AuditLogBase(BaseModel):
    action: str
    resource_type: str
    resource_id: Optional[str] = None
    details: Optional[str] = None
    ip_address: Optional[str] = None

class AuditLog(AuditLogBase):
    id: int
    user_id: int
    timestamp: datetime

    model_config = ConfigDict(from_attributes=True)

class UserBase(BaseModel):
    email: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
