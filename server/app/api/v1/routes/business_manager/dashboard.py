from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

# Internal Imports
from app.db.deps import get_db
from app.models.business_manager.domain import Approval, Inventory
# Ensure this model is available in your warehouse domain
from app.models.warehouse.domain import WarehouseRequest 

router = APIRouter(prefix="/business-manager", tags=["Business Manager Dashboard"])

# ==========================================
# SCHEMAS
# ==========================================

class N8nRestockPayload(BaseModel):
    product_name: str
    current_qty: int
    threshold: int
    message: str

class RequestActionPayload(BaseModel):
    action: str  # "APPROVE" or "REJECT"

class AnalyticsResponse(BaseModel):
    inventory_value: str
    on_time_delivery: str
    active_shipments: int
    pending_approvals: int
    is_critical: bool

# ==========================================
# CORE ANALYTICS & STATUS
# ==========================================

@router.get("/status")
def get_dashboard_status():
    return {
        "status": "success",
        "module": "business_manager",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/analytics", response_model=AnalyticsResponse)
def get_control_tower_analytics(db: Session = Depends(get_db)):
    """Calculates real-time KPIs for the main dashboard cards."""
    try:
        # 1. Calculate Real Inventory Value (Mocking $50/unit unit price logic)
        inventory_items = db.query(Inventory).all()
        total_units = sum(item.qty for item in inventory_items)
        total_value = total_units * 50 

        # 2. Count Real Pending Approvals from DB
        pending_count = db.query(Approval).filter(
            Approval.status.in_(["pending", "PENDING_WHM_APPROVAL"])
        ).count()

        # 3. Mocked Logistics Data
        active_shipments = 12 
        delivery_rate = "94%"

        return {
            "inventory_value": f"${total_value:,}",
            "on_time_delivery": delivery_rate,
            "active_shipments": active_shipments,
            "pending_approvals": pending_count,
            "is_critical": total_units < 500
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics calculation error: {str(e)}")

# ==========================================
# INVENTORY & SUPPLIERS
# ==========================================

@router.get("/inventory")
def get_inventory(db: Session = Depends(get_db)):
    """Fetches real inventory stock levels."""
    db_items = db.query(Inventory).all()
    if not db_items:
        return [
            {"id": 1, "name": "Industrial Bearing Set", "sku_id": "SKU-A92", "qty": 450, "threshold": 100},
            {"id": 2, "name": "Lithium Cells", "sku_id": "SKU-TEST-01", "qty": 5, "threshold": 50}
        ]
    return db_items

@router.get("/suppliers")
def get_suppliers():
    """Mocked supplier directory."""
    return [
        {"id": "SUP-001", "name": "GlobalTech Electronics", "category": "Electronics", "rating": 4.8, "status": "Preferred"},
        {"id": "SUP-002", "name": "Apex MetalWorks Inc.", "category": "Raw Material", "rating": 4.2, "status": "Active"}
    ]

# ==========================================
# SYSTEM REQUESTS & ACTIONS
# ==========================================

@router.get("/requests")
def get_requests(db: Session = Depends(get_db)):
    """Fetches full history of requests mapped to UI-friendly statuses."""
    try:
        all_requests = db.query(Approval).order_by(Approval.created_at.desc()).all()
        
        formatted_requests = []
        for req in all_requests:
            payload_data = req.payload if req.payload else {}
            
            status_map = {
                "APPROVED": "approved",
                "REJECTED": "rejected",
                "PENDING_WHM_APPROVAL": "pending"
            }
            ui_status = status_map.get(req.status, "pending")

            formatted_requests.append({
                "id": req.id,
                "type": req.type,
                "requester_name": "AI Copilot" if req.requester_id == 0 else f"User {req.requester_id}",
                "role": "System Agent" if req.requester_id == 0 else "Manager",
                "description": payload_data.get("alert_message", "Action Required"),
                "status": ui_status,
                "created_at": req.created_at.isoformat() if req.created_at else None
            })
        return formatted_requests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/requests/{request_id}/action")
def process_request_action(request_id: int, payload: RequestActionPayload, db: Session = Depends(get_db)):
    """
    Workflow: 
    - APPROVE: Create a formal Warehouse Request, store in DB, and mark alert as Approved.
    - REJECT: Permanently delete the request record from the database.
    """
    req = db.query(Approval).filter(Approval.id == request_id).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    action_type = payload.action.upper()
    
    try:
        if action_type == "APPROVE":
            # 1. Update the original request status
            req.status = "APPROVED"
            
            # 2. Extract data from payload for the warehouse task
            product_name = req.payload.get("product_name", "Unknown Product")
            
            # 3. Create and store a new formal request for the warehouse team
            new_warehouse_task = WarehouseRequest(
                product_name=product_name,
                requested_qty=100,  # Standard replenishment batch
                priority="HIGH",
                status="PENDING_PICKUP",
                source_id=req.id    # Maintain traceability to the original alert
            )
            
            db.add(new_warehouse_task)
            db.commit()
            return {"status": "success", "message": f"Approved! {product_name} request created in Warehouse system."}

        elif action_type == "REJECT":
            # 3. Delete the record entirely as requested
            db.delete(req)
            db.commit()
            return {"status": "success", "message": "Request successfully rejected and removed from the system."}

        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REJECT.")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")
    
    
# ==========================================
# WEBHOOKS
# ==========================================

@router.post("/webhook/create-restock-request")
async def create_restock_request_from_n8n(data: N8nRestockPayload, db: Session = Depends(get_db)):
    """Automation endpoint for n8n to inject alerts into the Control Tower."""
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
            requester_id=0 
        )
        db.add(new_request)
        db.commit()
        return {"status": "success"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))