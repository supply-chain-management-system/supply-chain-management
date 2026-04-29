from fastapi import APIRouter

# We assign a specific prefix and tag to keep Swagger documentation organized
router = APIRouter(
    prefix="/business-manager",
    tags=["Business Manager Dashboard"]
)

@router.get("/status")
def get_dashboard_status():
    """
    Temporary endpoint to verify the Business Manager module is connected.
    """
    return {
        "status": "success", 
        "module": "business_manager",
        "message": "Business Manager routing is active."
    }