# app/api/v1/routes/business_manager/team.py

from fastapi import APIRouter, HTTPException, Depends, status
import httpx
import uuid
from sqlalchemy.orm import Session
from app.db.deps import get_db ,get_tenant_db
from app.models.company_auth.managers import InviteToken 
from pydantic import BaseModel, EmailStr
from typing import Optional

router = APIRouter(prefix="/business-manager/team", tags=["Business Manager Team"])

class RefinedInviteSchema(BaseModel):
    email: EmailStr
    role: str # e.g., "Factory Manager"
    business_name: str = "NexusGrid"
    target_id: Optional[int] = None  # The specific Factory or Warehouse ID

@router.post("/invite", status_code=status.HTTP_201_CREATED)
async def create_context_aware_invite(data: RefinedInviteSchema, db: Session = Depends(get_tenant_db)):
    token = str(uuid.uuid4())
    
    # Save to DB with the target_id (ensure your InviteToken model has this column!)
    invite = InviteToken(
        email=data.email,
        role=data.role,
        token=token,
        # target_id=data.target_id # Uncomment once you add target_id to your DB model
    )
    db.add(invite)
    db.commit()

    # The link now carries the role and the specific target ID for the registration page
    invite_link = f"http://localhost:5173/register?token={token}&role={data.role}&tid={data.target_id or 0}"

    # Dispatch to n8n
    n8n_url = "http://127.0.0.1:5678/webhook/invite-user"
    payload = {
        "email": data.email,
        "role": data.role,
        "business_name": data.business_name,
        "invite_link": invite_link,
        "target_id": data.target_id
    }
    
    async with httpx.AsyncClient() as client:
        try:
            # We use the local 127.0.0.1 address as established previously
            await client.post(n8n_url, json=payload)
        except Exception as e:
            # We log the error but don't stop, as the DB record is already saved
            print(f"n8n Dispatch Error: {e}")

    return {
        "status": "success",
        "message": f"Invite for {data.role} dispatched.",
        "invite_link": invite_link # Useful for manual testing/copying
    }