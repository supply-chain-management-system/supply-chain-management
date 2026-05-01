from fastapi import APIRouter, Depends
from app.services.auth.dependancy import require_role

router = APIRouter(prefix="/business-manager", tags=["Business Manager Dashboard"])


@router.get("/status")
def get_dashboard_status(user=Depends(require_role(["Business Manager"]))):
    """
    Temporary endpoint to verify the Business Manager module is connected.
    """
    return {
        "status": "success",
        "module": "business_manager",
        "message": "Business Manager routing is active.",
    }
