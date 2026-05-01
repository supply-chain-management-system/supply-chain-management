from fastapi import APIRouter, BackgroundTasks
from app.schemas.business_manager.team import InviteRequestSchema, InviteResponseSchema

# Import your new shared email service
from app.services.email_service import send_role_invitation_email

router = APIRouter(
    prefix="/business-manager/team",
    tags=["Business Manager Team"]
)

@router.post("/invite", response_model=InviteResponseSchema)
async def invite_team_member(invite_data: InviteRequestSchema, background_tasks: BackgroundTasks):
    """
    Generate a role-scoped invite link and dispatch an email.
    Token generation is mocked pending the Auth team's completion.
    """
    
    # 1. TODO: Wait for teammate's token generation logic
    # For now, we mock the token and the frontend setup link
    mock_token = "abc-123-secure-token"
    invite_link = f"http://localhost:5173/setup-account?token={mock_token}&email={invite_data.email}"
    
    # 2. Add the email sending task to the background queue
    background_tasks.add_task(
        send_role_invitation_email,
        email_to=invite_data.email,
        role=invite_data.role,
        business_name=invite_data.business_name,
        invite_link=invite_link
    )
    
    # 3. Return the response immediately to the frontend
    return InviteResponseSchema(
        status="success",
        message=f"Invitation generated and email dispatched to {invite_data.email}.",
        invite_email=invite_data.email,
        assigned_role=invite_data.role
    )