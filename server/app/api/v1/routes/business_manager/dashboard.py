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
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Product, Rack, Inventory_ware
from app.models.sub_managers.request import MaterialRequest
from app.models.sub_managers.factory_manager.production import Factory, Production, Production_status
from app.models.sub_managers.logistics_manager.domain import Shipment, LogisticsActivity
from app.models.auth.user import User
from app.models.company.company import Company
from app.db.database import SessionLocal

router = APIRouter(prefix="/business-manager", tags=["Business Manager Dashboard"])
requests_router = APIRouter(prefix="/business-manager", tags=["Requests Management"])

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
    # Supplier fields
    name: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: Optional[int] = 7
    # Warehouse — Restock
    product_name: Optional[str] = None
    qty: Optional[int] = None
    threshold: Optional[int] = None
    # Warehouse — Add Product (new)
    product_type: Optional[str] = "finished_good"
    product_cost: Optional[float] = 0.0
    product_price: Optional[float] = 0.0
    product_weight: Optional[float] = 1.0
    # Warehouse — Add Rack (new)
    rack_name: Optional[str] = None
    rack_zone: Optional[str] = None
    rack_rows: Optional[int] = 5
    rack_max_weight: Optional[float] = 5000.0
    # Factory fields
    department: Optional[str] = None
    shift: Optional[str] = None
    target_output: Optional[int] = None
    # Logistics — Transfer Request
    route: Optional[str] = None
    sku: Optional[str] = None
    ship_qty: Optional[int] = None
    # Logistics — Add Vehicle (new)
    fleet_id: Optional[str] = None
    vehicle_type: Optional[str] = "Truck"
    vehicle_capacity: Optional[float] = 5000.0
    driver_name: Optional[str] = None
    stop_warehouse_name: Optional[str] = "Main Warehouse"

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

@requests_router.get("/requests")
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

@requests_router.post("/requests", status_code=status.HTTP_201_CREATED)
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
                # Supplier fields
                "supplier_name": payload.name,
                "contact_email": payload.contact_email,
                "phone": payload.phone,
                "lead_time_days": payload.lead_time_days,
                # Warehouse — Restock
                "product_name": payload.product_name,
                "qty": payload.qty,
                "threshold": payload.threshold,
                # Warehouse — Add Product
                "product_type": payload.product_type,
                "product_cost": payload.product_cost,
                "product_price": payload.product_price,
                "product_weight": payload.product_weight,
                # Warehouse — Add Rack
                "rack_name": payload.rack_name,
                "rack_zone": payload.rack_zone,
                "rack_rows": payload.rack_rows,
                "rack_max_weight": payload.rack_max_weight,
                # Factory
                "department": payload.department,
                "shift": payload.shift,
                "target_output": payload.target_output,
                # Logistics — Transfer
                "route": payload.route,
                "sku": payload.sku,
                "ship_qty": payload.ship_qty,
                # Logistics — Add Vehicle
                "fleet_id": payload.fleet_id,
                "vehicle_type": payload.vehicle_type,
                "vehicle_capacity": payload.vehicle_capacity,
                "driver_name": payload.driver_name,
                "stop_warehouse_name": payload.stop_warehouse_name,
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

def execute_approval_side_effects(db: Session, req: Approval):
    # 0a. Warehouse — Add New Product
    if req.type == "Add Product":
        import uuid
        product_name = req.payload.get("product_name", "Unknown Product")
        product_sku = req.payload.get("sku") or f"SKU-{uuid.uuid4().hex[:6].upper()}"
        existing = db.query(Product).filter(Product.name == product_name).first()
        if existing:
            return f"Product '{product_name}' already exists in catalog."
        product = Product(
            name=product_name,
            sku=product_sku,
            type=req.payload.get("product_type", "finished_good"),
            cost=float(req.payload.get("product_cost") or 0.0),
            price=float(req.payload.get("product_price") or 0.0),
            weight=float(req.payload.get("product_weight") or 1.0),
            min_stock_level=int(req.payload.get("threshold") or 10)
        )
        db.add(product)
        db.flush()
        # Also create an empty inventory_ware entry for it
        wh = db.query(Warehouse).first()
        rack = db.query(Rack).first()
        if wh and rack:
            inv = Inventory_ware(
                product_id=product.id,
                rack_id=rack.id,
                quantity=0,
                status="available"
            )
            db.add(inv)
            db.flush()
        return f"Approved! Product '{product_name}' (SKU: {product_sku}) added to warehouse catalog."

    # 0b. Warehouse — Add New Rack
    elif req.type == "Add Rack":
        rack_name = req.payload.get("rack_name", "New Rack")
        wh = db.query(Warehouse).first()
        if not wh:
            wh = Warehouse(name="Korvex Main Warehouse", location="Default")
            db.add(wh)
            db.flush()
        new_rack = Rack(
            name=rack_name,
            warehouse_id=wh.id,
            zone=req.payload.get("rack_zone") or "General",
            rows=int(req.payload.get("rack_rows") or 5),
            max_weight=float(req.payload.get("rack_max_weight") or 5000.0)
        )
        db.add(new_rack)
        db.flush()
        return f"Approved! Rack '{rack_name}' added to warehouse."

    # 0c. Logistics — Add Vehicle
    elif req.type == "Add Vehicle":
        import uuid
        from app.models.sub_managers.logistics_manager.domain import Vehicle
        fleet_id = req.payload.get("fleet_id") or f"FLT-{uuid.uuid4().hex[:6].upper()}"
        existing_v = db.query(Vehicle).filter(Vehicle.fleet_id == fleet_id).first()
        if existing_v:
            return f"Vehicle '{fleet_id}' already exists in fleet."
        new_vehicle = Vehicle(
            fleet_id=fleet_id,
            route=req.payload.get("route") or "Domestic",
            vehicle_type=req.payload.get("vehicle_type") or "Truck",
            capacity_kg=float(req.payload.get("vehicle_capacity") or 5000.0),
            driver_name=req.payload.get("driver_name") or "Unassigned",
            stop_warehouse_name=req.payload.get("stop_warehouse_name") or "Main Warehouse",
            fuel_level=100.0,
            status="Idle"
        )
        db.add(new_vehicle)
        db.flush()
        activity = LogisticsActivity(
            event_text=f"Vehicle {fleet_id} ({req.payload.get('vehicle_type', 'Truck')}) added to fleet via BM request.",
            status_type="success"
        )
        db.add(activity)
        db.flush()
        return f"Approved! Vehicle '{fleet_id}' added to logistics fleet."

    # 1. Supplier Manager Onboarding
    elif req.type in ["Supplier Request", "Supplier Onboarding Request"]:
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
            db.flush()
            return f"Approved! Supplier '{supplier_name}' successfully onboarded."
        else:
            return f"Approved! Supplier '{supplier_name}' is already onboarded."
            
    # 2. Warehouse Manager Restock Request
    elif req.type == "Restock Request" or req.payload.get("role") == "warehouse_manager":
        product_name = req.payload.get("product_name")
        qty = req.payload.get("qty")
        threshold = req.payload.get("threshold") or 50
        
        if not product_name:
            desc = req.payload.get("alert_message", "")
            try:
                import re
                prod_match = re.search(r"Product:\s*([^,]+)", desc)
                qty_match = re.search(r"Replenish Quantity:\s*(\d+)", desc)
                thresh_match = re.search(r"Threshold:\s*(\d+)", desc)
                if prod_match:
                    product_name = prod_match.group(1).strip()
                if qty_match:
                    qty = int(qty_match.group(1))
                if thresh_match:
                    threshold = int(thresh_match.group(1))
            except Exception:
                pass
        
        if not product_name:
            product_name = "Unknown Product"
        if qty is None:
            qty = 100
            
        product = db.query(Product).filter(Product.name == product_name).first()
        if not product:
            import uuid
            sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
            product = Product(name=product_name, sku=sku, min_stock_level=threshold)
            db.add(product)
            db.flush()
            
        wh = db.query(Warehouse).first()
        wh_id = wh.id if wh else None
        if not wh:
            wh = Warehouse(name="Korvex Main Warehouse", location="Default")
            db.add(wh)
            db.flush()
            wh_id = wh.id
            
        rack = db.query(Rack).filter(Rack.warehouse_id == wh_id).first()
        rack_id = rack.id if rack else None
        if not rack:
            rack = Rack(name="Rack A1", warehouse_id=wh_id)
            db.add(rack)
            db.flush()
            rack_id = rack.id
            
        inventory = db.query(Inventory_ware).filter(
            Inventory_ware.product_id == product.id,
            Inventory_ware.rack_id == rack_id
        ).first()
        if not inventory:
            inventory = Inventory_ware(
                product_id=product.id,
                rack_id=rack_id,
                quantity=0
            )
            db.add(inventory)
            db.flush()
            
        inventory.quantity += qty
        return f"Approved! Restocked {qty} of '{product_name}' in warehouse."

    # 3. Factory Manager — Production Run or Stock Adjustment
    elif req.type in ["Stock Adjustment", "Production Run"] or req.payload.get("role") == "factory_manager":
        dept = req.payload.get("department", "Assembly")
        shift = req.payload.get("shift", "Day Shift")
        target_qty = req.payload.get("target_output")
        
        if target_qty is None:
            desc = req.payload.get("alert_message", "")
            try:
                import re
                qty_match = re.search(r"Target Output:\s*(\d+)", desc)
                if qty_match:
                    target_qty = int(qty_match.group(1))
            except Exception:
                pass
        
        if target_qty is None:
            target_qty = 100
            
        fact = db.query(Factory).first()
        fact_id = fact.id if fact else None
        if not fact:
            fact = Factory(name="Main Factory Sector B")
            db.add(fact)
            db.flush()
            fact_id = fact.id
            
        new_production = Production(
            product_name=f"Directives - {dept} ({shift})",
            target_qty=target_qty,
            output_qty=0,
            status=Production_status.PENDING,
            factory_id=fact_id,
            priority=req.payload.get("priority", "medium"),
            notes=req.payload.get("alert_message", "")
        )
        db.add(new_production)
        db.flush()
        return f"Approved! Production directive of {target_qty} units sent to Factory."

    # 4. Logistics Manager Transfer Request
    elif req.type == "Transfer Request" or req.payload.get("role") == "logistics_manager":
        route = req.payload.get("route", "Domestic")
        sku = req.payload.get("sku", "SKU-GENERIC")
        ship_qty = req.payload.get("ship_qty")
        
        if ship_qty is None:
            desc = req.payload.get("alert_message", "")
            try:
                import re
                qty_match = re.search(r"Dispatch Quantity:\s*(\d+)", desc)
                if qty_match:
                    ship_qty = int(qty_match.group(1))
            except Exception:
                pass
        if ship_qty is None:
            ship_qty = 250
            
        import uuid
        tracking_number = f"TRK-{uuid.uuid4().hex[:8].upper()}"
        
        new_shipment = Shipment(
            tracking_number=tracking_number,
            destination=route,
            driver_name="Assigned Driver",
            weight_kg=float(ship_qty),
            status="Pending",
            eta=datetime.utcnow(),
            on_time=True
        )
        db.add(new_shipment)
        db.flush()
        
        activity = LogisticsActivity(
            event_text=f"Shipment {tracking_number} to {route} created via BM Transfer Request approval.",
            status_type="success"
        )
        db.add(activity)
        db.flush()
        return f"Approved! Shipment {tracking_number} dispatched to {route}."
        
    # 5. Fallback Material Request
    else:
        product_name = req.payload.get("product_name", "Unknown Product")
        wh = db.query(Warehouse).first()
        wh_id = wh.id if wh else 1
        fact = db.query(Factory).first()
        fact_id = fact.id if fact else 1
        
        product = db.query(Product).filter(Product.name == product_name).first()
        if not product:
            import uuid
            sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
            product = Product(name=product_name, sku=sku)
            db.add(product)
            db.flush()
            
        new_material_request = MaterialRequest(
            product_id=product.id,
            sender_type="warehouse",
            sender_id=wh_id,
            receiver_type="factory",
            receiver_id=fact_id,
            quantity=100,
            status="pending"
        )
        db.add(new_material_request)
        db.flush()
        return f"Approved! {product_name} request created in Warehouse system."

@requests_router.put("/requests/{request_id}/action")
def process_request_action(request_id: int, payload: RequestActionPayload, db: Session = Depends(get_tenant_db)):
    """
    Workflow: 
    - APPROVE: Create/update appropriate system records based on request type and mark status as Approved.
    - REJECT: Permanently delete the request record from the database.
    """
    req = db.query(Approval).filter(Approval.id == request_id).first()
    
    if not req:
        raise HTTPException(status_code=404, detail="Request not found.")
        
    action_type = payload.action.upper()
    
    try:
        if action_type == "APPROVE":
            req.status = "APPROVED"
            msg = execute_approval_side_effects(db, req)
            db.commit()
            return {"status": "success", "message": msg}

        elif action_type == "REJECT":
            db.delete(req)
            db.commit()
            return {"status": "success", "message": "Request successfully rejected and removed from the system."}

        else:
            raise HTTPException(status_code=400, detail="Invalid action. Use APPROVE or REJECT.")

    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database operation failed: {str(e)}")

@requests_router.post("/approvals/bulk-approve")
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
             execute_approval_side_effects(db, req)
             count += 1
             
        db.commit()
        return {"status": "success", "approved_count": count}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@requests_router.post("/requests/bulk-action")
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
                execute_approval_side_effects(db, req)
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