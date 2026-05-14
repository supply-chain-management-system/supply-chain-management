# app/schemas/business_card.py

from pydantic import BaseModel, EmailStr, Field
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


class BusinessManagerResponse(BaseModel):
    id: int
    name: str
    email: EmailStr
    role: str
    business_id: Optional[str] = None
    is_active: bool
    is_verified: bool
    created_at: datetime

    class Config:
        from_attributes = True


class BusinessCardResponse(BusinessCardBase):
    id: int
    created_at: datetime
    managers: list[BusinessManagerResponse] = Field(default_factory=list)

    class Config:
        from_attributes = True
