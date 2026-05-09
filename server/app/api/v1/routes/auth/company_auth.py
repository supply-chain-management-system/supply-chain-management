from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
import httpx
import uuid
import os
from dotenv import load_dotenv

from app.schemas.auth.company import InviteRequest
from app.services.auth.dependancy import get_current_user
from app.models.auth.user import User
from app.services.auth.rolebased import build_recipients, get_owner_email

app = APIRouter(tags=["Company Invitations"])

load_dotenv()

N8N_WEBHOOK_URL = os.getenv(
    "N8N_WEBHOOK_URL", "http://localhost:5678/webhook-test/invite/company/managers"
)


@app.post("/invite/send")
async def send_invite(
    payload: InviteRequest,
    current_user: User = Depends(get_current_user),
):
    try:
        event_id = str(uuid.uuid4())
        print(current_user.schema_name)
        business_owner_email = get_owner_email(current_user.schema_name)

        recipients = build_recipients(current_user, payload, business_owner_email)

        data = {
            "event_id": event_id,
            "business_id": payload.business_id,
            "role": payload.role,
            "invited_email": payload.email,
            "created_by": current_user.email,
            "owner_email": business_owner_email,
            "recipients": recipients,
            "event_type": "invite_created",
        }

        async with httpx.AsyncClient() as client:
            response = await client.post(N8N_WEBHOOK_URL, json=data)

        if response.status_code not in [200, 201]:
            raise HTTPException(
                status_code=500, detail=f"Failed to trigger n8n: {response.text}"
            )

        return {"status": "success", "event_id": event_id, "recipients": recipients}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
