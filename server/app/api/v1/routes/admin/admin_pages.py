import uuid
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.api.deps import get_db
from app.models.company_auth.managers import InviteToken
from app.api.v1.routes.admin.emailsend import send_invite_email

router = APIRouter()

@router.post("/invite")
async def create_invite(email: str, role: str, db: Session = Depends(get_db)):
    
    token = str(uuid.uuid4())

    invite = InviteToken(
        email=email,
        role=role,
        token=token
    )

    db.add(invite)
    db.commit()

    link = f"http://localhost:5173/register?token={token}"

    await send_invite_email(email, link)
    return {
        "message": "Invite created",
        "invite_link": link
    }