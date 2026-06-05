from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ProfileBase(BaseModel):
    phone: Optional[str] = None
    job_title: Optional[str] = None
    department: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    avatar_url: Optional[str] = None
    budget_authority: Optional[str] = None
    focus_area: Optional[str] = None
    categories_managed: Optional[str] = None
    supplier_target_score: Optional[str] = None
    office_extension: Optional[str] = None
    fleet_size: Optional[str] = None
    regions_managed: Optional[str] = None
    logistics_license_no: Optional[str] = None

class ProfileUpdate(ProfileBase):
    pass

class ProfileOut(ProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class UserProfileOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    company_name: Optional[str] = None
    profile: Optional[ProfileOut] = None

    class Config:
        from_attributes = True
