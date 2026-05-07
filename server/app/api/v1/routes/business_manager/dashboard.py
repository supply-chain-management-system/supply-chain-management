from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from app.services.auth.dependancy import require_role

# Import your database session and Approval model
from app.api.deps import get_db
# IMPORTANT: Verify this path points to your actual Approval model!
from app.models.business_manager.domain import Approval 

router = APIRouter(prefix="/business-manager", tags=["Business Manager Dashboard"])

@router.get("/status")
def get_dashboard_status(user=Depends(require_role(["Business Manager"]))):
    """Temporary endpoint to verify the Business Manager module is connected."""
    return {
        "status": "success",
        "module": "business_manager",
        "message": "Business Manager routing is active.",
    }

# ==========================================
# MOCK ENDPOINTS (Phase 1 - For UI Loading)
# ==========================================

@router.get("/inventory")
def get_inventory(user=Depends(require_role(["Business Manager"]))):
    return [
        {"id": 1, "name": "Industrial Bearing Set", "sku_id": "SKU-A92", "qty": 450, "threshold": 100},
        {"id": 2, "name": "Lithium Cells", "sku_id": "SKU-TEST-01", "qty": 5, "threshold": 50},
        {"id": 3, "name": "Control Board v2", "sku_id": "SKU-C77", "qty": 88, "threshold": 20}
    ]

@router.get("/suppliers")
def get_suppliers(user=Depends(require_role(["Business Manager"]))):
    return [
        {"id": "SUP-001", "name": "GlobalTech Electronics", "category": "Electronics", "rating": 4.8, "lead_time": "14 Days", "status": "Preferred"},
        {"id": "SUP-002", "name": "Apex MetalWorks Inc.", "category": "Raw Material", "rating": 4.2, "lead_time": "21 Days", "status": "Active"}
    ]

# ==========================================
# ENTERPRISE WORKFLOW ENDPOINTS (Phase 2)
# ==========================================

@router.get("/requests", tags=["System Requests"])
def get_requests(
    db: Session = Depends(get_db),
    user=Depends(require_role(["Business Manager"]))
):
    """
    Fetches all real pending requests from the database so the UI can render them.
    """
    try:
        # Fetch all pending requests ordered by newest first
        pending_requests = db.query(Approval).filter(
            Approval.status == "PENDING_WHM_APPROVAL"
        ).order_by(Approval.created_at.desc()).all()
        
        # Format them exactly how the React frontend expects them
        formatted_requests = []
        for req in pending_requests:
            # Safely extract payload data
            payload_data = req.payload if req.payload else {}
            alert_message = payload_data.get("alert_message", "Action Required")
            
            formatted_requests.append({
                "id": req.id,
                "type": req.type,
                "requester_name": "AI Copilot" if req.requester_id == 0 else f"User {req.requester_id}",
                "role": "System Agent" if req.requester_id == 0 else "Manager",
                "description": alert_message,
                "status": req.status,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })
            
        return formatted_requests
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database read error: {str(e)}")

# 1. Schemas for our new endpoints
class N8nRestockPayload(BaseModel):
    product_name: str
    current_qty: int
    threshold: int
    message: str

class RequestActionPayload(BaseModel):
    action: str  # Must be "APPROVE" or "REJECT"

# 2. Webhook for n8n to create a request in the database
@router.post("/webhook/create-restock-request", tags=["n8n Automation"])
async def create_restock_request_from_n8n(data: N8nRestockPayload, db: Session = Depends(get_db)):
    """
    Receives a trigger from n8n (AI-initiated) and generates an in-app 
    request for the Warehouse Manager.
    """
    try:
        new_request = Approval(
            type="Restock Request",
            payload={
                "product_name": data.product_name,
                "current_qty": data.current_qty,
                "threshold": data.threshold,
                "alert_message": data.message
            },
            status="PENDING_WHM_APPROVAL",
            # We use ID 0 to indicate this request came from the AI/System
            requester_id=0 
        )
        db.add(new_request)
        db.commit()
        return {"status": "success", "message": f"In-app restock request created for {data.product_name}."}
    
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# 3. Endpoint for React UI to Approve or Reject the request
@router.put("/requests/{request_id}/action", tags=["System Requests"])
def process_request_action(
    request_id: int, 
    payload: RequestActionPayload, 
    db: Session = Depends(get_db)
    # user=Depends(require_role(["Business Manager", "Warehouse Manager"])) # Turn this on later for security!
):
    """
    Called by the React frontend when a manager clicks Approve or Reject.
    """
    req = db.query(Approval).filter(Approval.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found in database.")
        
    action_type = payload.action.upper()
    if action_type == "APPROVE":
        req.status = "APPROVED"
        # TODO: Add logic here later to actually increase the inventory!
    elif action_type == "REJECT":
        req.status = "REJECTED"
    else:
        raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REJECT.")
        
    db.commit()
    return {"status": "success", "message": f"Request {request_id} has been {req.status}."}