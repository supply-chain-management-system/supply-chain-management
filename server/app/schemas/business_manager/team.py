from pydantic import BaseModel, EmailStr

class InviteRequestSchema(BaseModel):
    business_name: str
    email: EmailStr
    role: str

class InviteResponseSchema(BaseModel):
    status: str
    message: str
    invite_email: str
    assigned_role: str