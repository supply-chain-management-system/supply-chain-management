# app/schemas/business_card.py

from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class BusinessCardBase(BaseModel):
    name: str
    category: str
    size: str
    tagline: Optional[str] = None
    email: EmailStr
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class BusinessCardCreate(BusinessCardBase):
    pass


class BusinessCardUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    email: Optional[EmailStr] = None
    description: Optional[str] = None
    color: Optional[str] = None


class BusinessCardResponse(BusinessCardBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
