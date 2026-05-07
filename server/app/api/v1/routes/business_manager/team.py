from fastapi import APIRouter, HTTPException, Depends, status
import httpx
import uuid
from sqlalchemy.orm import Session

# Import your database session
from app.api.deps import get_db

# Import your schemas and models
from app.schemas.business_manager.team import InviteRequestSchema
# IMPORTANT: Verify this import path matches where your teammate created the model!
from app.models.company_auth.managers import InviteToken 

router = APIRouter(
    prefix="/business-manager/team",
    tags=["Business Manager Team"]
)

@router.post("/invite", status_code=status.HTTP_201_CREATED, description="invite new manager")
async def create_invite(data: InviteRequestSchema, db: Session = Depends(get_db)):
    """
    Generates a secure UUID token, saves it to the DB, and dispatches the email via n8n.
    """
    
    # 1. Teammate's Logic: Generate secure token & save to Database
    token = str(uuid.uuid4())
    
    invite = InviteToken(
        email=data.email,
        role=data.role,
        token=token
    )
    db.add(invite)
    db.commit()

    # 2. Generate the real frontend setup link using the secure token
    invite_link = f"http://localhost:5173/register?token={token}&email={data.email}"

    # 3. Your Logic: Dispatch to n8n Automation Engine
    # Make sure this is your active ngrok URL!
    n8n_url = "https://shady-detonator-daylong.ngrok-free.dev/webhook-test/invite-user"
    
    payload = {
        "email": data.email,
        "role": data.role,
        "business_name": data.business_name if hasattr(data, 'business_name') else "NexusGrid", 
        "invite_link": invite_link
    }
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(n8n_url, json=payload)
            response.raise_for_status()
        except Exception as e:
            # If n8n fails, we alert the frontend but the DB token is still safely saved
            raise HTTPException(status_code=500, detail=f"Database saved, but n8n email failed: {str(e)}")

    # Return exactly what the React frontend expects
    return {
        "status": "success",
        "message": "Invite created securely and dispatched via n8n",
        "invite_link": invite_link
    }