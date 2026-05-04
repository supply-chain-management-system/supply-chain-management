from pydantic import BaseModel, HttpUrl, validator
from typing import Optional
from enum import Enum


class ModeEnum(str, Enum):
    personal = "personal"
    team = "team"
    enterprise = "enterprise"


class CompanySetupSchema(BaseModel):
    name: str
    industry: str
    is_mode: ModeEnum
    company_size: str
    website: Optional[str] = None
    registration_number: Optional[str] = None
    address: Optional[str] = None
    country: str
    phone: Optional[str] = None

    @validator("name")
    def name_not_empty(cls, v):
        if not v.strip():
            raise ValueError("Company name cannot be empty")
        return v.strip()
    
    
