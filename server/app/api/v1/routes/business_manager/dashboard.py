from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from datetime import datetime

# Internal Imports
from app.db.deps import get_db ,get_tenant_db
from app.models.business_manager.domain import Approval, Inventory
from app.models.supplier_manager.supplier import Supplier
# Ensure this model is available in your warehouse domain
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse 
from app.models.auth.user import User
from app.models.company.company import Company
from app.db.database import SessionLocal
router = APIRouter(prefix="/business-manager", tags=["Business Manager Dashboard"])

# ==========================================
# SCHEMAS
# ==========================================

class N8nRestockPayload(BaseModel):
    product_name: str
    current_qty: int
    threshold: int
    message: str
    user_id: Optional[int] = None

class RequestActionPayload(BaseModel):
    action: str  # "APPROVE" or "REJECT"

class BulkActionPayload(BaseModel):
    ids: List[int]
    action: str  # "APPROVE" or "REJECT"

class BulkApprovePayload(BaseModel):
    filter_type: str
    filter_value: str
    reviewer_id: int

class AnalyticsResponse(BaseModel):
    inventory_value: str
    on_time_delivery: str
    active_shipments: int
    pending_approvals: int
    is_critical: bool

class CreateRequestPayload(BaseModel):
    type: str  # e.g., "Supplier Request"
    description: str
    category: Optional[str] = None
    project: Optional[str] = None
    role: Optional[str] = "supply_manager"
    priority: Optional[str] = "standard"
    name: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: Optional[int] = 7

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
def get_control_tower_analytics(db: Session = Depends(get_tenant_db)):
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
def get_inventory(db: Session = Depends(get_tenant_db)):
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
def get_requests(role: Optional[str] = None, db: Session = Depends(get_tenant_db)):
    """Fetches full history of requests mapped to UI-friendly statuses."""
    try:
        all_requests = db.query(Approval).order_by(Approval.created_at.desc()).all()
        
        formatted_requests = []
        for req in all_requests:
            payload_data = req.payload if req.payload else {}
            
            status_map = {
                "APPROVED": "approved",
                "REJECTED": "rejected",
                "PENDING_WHM_APPROVAL": "pending",
                "pending": "pending"
            }
            ui_status = status_map.get(req.status, "pending")

            formatted_requests.append({
                "id": req.id,
                "type": req.type,
                "requester_name": "AI Copilot" if req.requester_id == 0 else f"User {req.requester_id}",
                "role": payload_data.get("role", "System Agent" if req.requester_id == 0 else "Manager"),
                "description": payload_data.get("alert_message", "Action Required"),
                "status": ui_status,
                "created_at": req.created_at.isoformat() if req.created_at else None,
                "priority": payload_data.get("priority", "standard"),
                "payload": payload_data
            })

        if role:
            formatted_requests = [r for r in formatted_requests if r["role"] == role]

        return formatted_requests
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requests", status_code=status.HTTP_201_CREATED)
def create_system_request(
    payload: CreateRequestPayload, 
    db: Session = Depends(get_tenant_db)
):
    """Allows Business Managers to submit dynamic onboarding or replenishment requests."""
    try:
        new_request = Approval(
            type=payload.type,
            payload={
                "alert_message": payload.description,
                "role": payload.role,
                "category": payload.category,
                "project": payload.project,
                "priority": payload.priority,
                "supplier_name": payload.name,
                "contact_email": payload.contact_email,
                "phone": payload.phone,
                "lead_time_days": payload.lead_time_days
            },
            status="pending",
            requester_id=1 # Business Manager
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return {"status": "success", "id": new_request.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/requests/{request_id}/action")
def process_request_action(request_id: int, payload: RequestActionPayload, db: Session = Depends(get_tenant_db)):
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
            
            # Check if this is a Supplier Onboarding Request
            if req.type == "Supplier Request" or req.type == "Supplier Onboarding Request":
                supplier_name = req.payload.get("supplier_name")
                category = req.payload.get("category") or "Raw Materials"
                email = req.payload.get("contact_email") or "info@supplier.com"
                phone = req.payload.get("phone")
                lead_time = int(req.payload.get("lead_time_days") or 7)
                business_id = int(req.payload.get("business_id") or 1)
                
                # Check for duplicates to prevent duplicate onboarding
                existing = db.query(Supplier).filter(
                    Supplier.name == supplier_name,
                    Supplier.business_id == business_id
                ).first()
                
                if not existing:
                    new_supplier = Supplier(
                        name=supplier_name,
                        category=category,
                        contact_email=email,
                        phone=phone,
                        lead_time_days=lead_time,
                        business_id=business_id,
                        rating=5.0,
                        is_active=True
                    )
                    db.add(new_supplier)
                    db.commit()
                    db.refresh(new_supplier)
                    return {"status": "success", "message": f"Approved! Supplier '{supplier_name}' successfully onboarded."}
                else:
                    db.commit()
                    return {"status": "success", "message": f"Approved! Supplier '{supplier_name}' is already onboarded."}
            
            # 2. Extract data from payload for the warehouse task
            product_name = req.payload.get("product_name", "Unknown Product")
            
            # 3. Create and store a new formal request for the warehouse team
            new_warehouse_task = Warehouse(
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

@router.post("/approvals/bulk-approve")
def bulk_approve_requests(payload: BulkApprovePayload, db: Session = Depends(get_tenant_db)):
    """Bulk approves pending requests based on a filter."""
    try:
        query = db.query(Approval).filter(Approval.status.in_(["pending", "PENDING_WHM_APPROVAL"]))
        
        if payload.filter_type == "type":
             query = query.filter(Approval.type == payload.filter_value)
             
        pending_requests = query.all()
        count = 0
        for req in pending_requests:
             req.status = "APPROVED"
             req.reviewer_id = payload.reviewer_id
             count += 1
             
        db.commit()
        return {"status": "success", "approved_count": count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/requests/bulk-action")
def bulk_process_requests(payload: BulkActionPayload, db: Session = Depends(get_tenant_db)):
    """Processes approval or rejection for a list of request IDs in bulk."""
    action_type = payload.action.upper()
    if action_type not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REJECT.")

    success_ids = []
    error_messages = []

    for request_id in payload.ids:
        req = db.query(Approval).filter(Approval.id == request_id).first()
        if not req:
            error_messages.append(f"Request {request_id} not found.")
            continue

        try:
            if action_type == "APPROVE":
                req.status = "APPROVED"
                
                if req.type in ["Supplier Request", "Supplier Onboarding Request"]:
                    supplier_name = req.payload.get("supplier_name")
                    category = req.payload.get("category") or "Raw Materials"
                    email = req.payload.get("contact_email") or "info@supplier.com"
                    phone = req.payload.get("phone")
                    lead_time = int(req.payload.get("lead_time_days") or 7)
                    business_id = int(req.payload.get("business_id") or 1)
                    
                    existing = db.query(Supplier).filter(
                        Supplier.name == supplier_name,
                        Supplier.business_id == business_id
                    ).first()
                    
                    if not existing:
                        new_supplier = Supplier(
                            name=supplier_name,
                            category=category,
                            contact_email=email,
                            phone=phone,
                            lead_time_days=lead_time,
                            business_id=business_id,
                            rating=5.0,
                            is_active=True
                        )
                        db.add(new_supplier)
                else:
                    product_name = req.payload.get("product_name", "Unknown Product")
                    new_warehouse_task = Warehouse(
                        product_name=product_name,
                        requested_qty=100,
                        priority="HIGH",
                        status="PENDING_PICKUP",
                        source_id=req.id
                    )
                    db.add(new_warehouse_task)
                
                success_ids.append(request_id)

            elif action_type == "REJECT":
                db.delete(req)
                success_ids.append(request_id)

        except Exception as e:
            error_messages.append(f"Request {request_id} failed: {str(e)}")

    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database commit failed: {str(e)}")

    return {
        "status": "success",
        "processed_ids": success_ids,
        "errors": error_messages
    }
    
    
# ==========================================
# WEBHOOKS
# ==========================================

@router.post("/webhook/create-restock-request")
async def create_restock_request_from_n8n(data: N8nRestockPayload, db: Session = Depends(get_db)):
    """Automation endpoint for n8n to inject alerts into the Control Tower."""
    try:
        user_id = data.user_id
        if not user_id:
            first_user = db.query(User).filter(User.company_id.isnot(None)).first()
            user_id = first_user.id if first_user else 2
            
        user = db.query(User).filter(User.id == user_id).first()
        if not user or not user.company_id:
            # Fallback directly to the first company in public database
            first_company = db.query(Company).first()
            if not first_company or not first_company.schema_name:
                raise HTTPException(status_code=400, detail="No active company schema found in the system.")
            schema = first_company.schema_name
        else:
            company = db.query(Company).filter(Company.id == user.company_id).first()
            if not company or not company.schema_name:
                raise HTTPException(status_code=400, detail="Company or company schema not found")
            schema = company.schema_name
            
        print(f"Webhook resolving schema: {schema} for user {user_id}")
        
        tenant_db = SessionLocal()
        tenant_db.bind = tenant_db.bind.execution_options(schema_translate_map={None: schema})
        
        try:
            new_request = Approval(
                type="Restock Request",
                payload={
                    "product_name": data.product_name,
                    "current_qty": data.current_qty,
                    "threshold": data.threshold,
                    "alert_message": data.message,
                    "role": "System Agent"
                },
                status="PENDING_WHM_APPROVAL",
                requester_id=0 
            )
            tenant_db.add(new_request)
            tenant_db.commit()
            tenant_db.refresh(new_request)
            return {"status": "success", "id": new_request.id}
        except Exception as e:
            tenant_db.rollback()
            raise e
        finally:
            tenant_db.close()
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))