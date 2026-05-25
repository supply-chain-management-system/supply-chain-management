from pydantic import BaseModel, EmailStr
from typing import Optional

class SupplierBase(BaseModel):
    name: str
    category: str # e.g., Raw Materials, Packaging, Electronics
    contact_email: EmailStr
    phone: Optional[str] = None
    lead_time_days: int
    business_id: Optional[int] = 1
    manager_id: Optional[int] = None

class SupplierCreate(SupplierBase):
    pass

class SupplierOut(SupplierBase):
    id: int
    rating: float
    is_active: bool

    class Config:
        from_attributes = True
