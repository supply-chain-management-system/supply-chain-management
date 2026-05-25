from fastapi import APIRouter, Depends, status
from pydantic import BaseModel
from typing import Optional
from app.core.security import get_current_user
from app.db.database import db

router = APIRouter()

class UserSyncSchema(BaseModel):
    user_id: int
    name: str
    email: str
    role: Optional[str] = None
    company_id: Optional[int] = None
    is_active: bool = True

@router.post("/users/sync", status_code=status.HTTP_200_OK)
async def sync_user(user_data: UserSyncSchema, current_user = Depends(get_current_user)):
    user_doc = {
        "_id": user_data.user_id,
        "name": user_data.name,
        "email": user_data.email,
        "role": user_data.role,
        "company_id": user_data.company_id,
        "is_active": user_data.is_active
    }
    await db.users.replace_one({"_id": user_data.user_id}, user_doc, upsert=True)
    return {"status": "success", "message": "User profile synced successfully"}
