from pydantic import BaseModel
from typing import Optional


class CompanyBase(BaseModel):
    name: str
    registration_number: Optional[str]
    address: Optional[str]
    industry: Optional[str]


class CompanyResponse(CompanyBase):
    id: int

    class Config:
        from_attributes = True


class RoleBase(BaseModel):
    name: str
    description: Optional[str]


class RoleResponse(RoleBase):
    id: int

    class Config:
        from_attributes = True


class InviteRequest(BaseModel):
    business_id: int
    role: str
    email: str
    manager_card_id: Optional[int] = None
    manager_card_name: Optional[str] = None
