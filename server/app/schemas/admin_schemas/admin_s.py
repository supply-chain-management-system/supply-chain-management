from pydantic import BaseModel, EmailStr

class InviteRequest(BaseModel):
    email: str
    role: str