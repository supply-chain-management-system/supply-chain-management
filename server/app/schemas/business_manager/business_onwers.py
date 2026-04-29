from pydantic import BaseModel, EmailStr

class BusinessOwnerCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    business_id: int