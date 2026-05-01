from fastapi import APIRouter
from app.schemas.business_manager.team import InviteRequestSchema, InviteResponseSchema

router = APIRouter(
    prefix="/business-manager/team",
    tags=["Business Manager Team"]
)

@router.post("/invite", response_model=InviteResponseSchema)
def invite_team_member(invite_data: InviteRequestSchema):
    """
    Generate a role-scoped invite link and dispatch an email.
    (Currently a placeholder until we connect the JWT and Email services).
    """
    
    # TODO: Add logic to generate JWT token
    # TODO: Add logic to send email
    
    return InviteResponseSchema(
        status="success",
        message="Invitation generated successfully.",
        invite_email=invite_data.email,
        assigned_role=invite_data.role
    )