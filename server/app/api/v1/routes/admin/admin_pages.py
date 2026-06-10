import uuid
from sqlalchemy.orm import Session
from app.db.deps import get_db
from app.models.company_auth.managers import InviteToken
from app.api.v1.routes.admin.emailsend import send_invite_email
from app.schemas.admin_schemas.admin_s import InviteRequest
from fastapi import APIRouter, Depends, HTTPException, Request, status, Response

router = APIRouter()


@router.post(
    "/invite",
    status_code=status.HTTP_201_CREATED,
    description="invite new manager",
)
async def create_invite(data: InviteRequest, db: Session = Depends(get_db)):
    token = str(uuid.uuid4())

    invite = InviteToken(email=data.email, role=data.role, token=token)

    db.add(invite)
    db.commit()

    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    link = f"{frontend_url}/register?token={token}"

    await send_invite_email(data.email, link)

    return {"message": "Invite created", "invite_link": link}


@router.get("/invite")
def get_managers(db: Session = Depends(get_db)):
    invites = db.query(InviteToken).all()

    return [
        {
            "id": invite.id,
            "email": invite.email,
            "role": invite.role,
            "token": invite.token,
            "created_at": invite.created_at,
        }
        for invite in invites
    ]
