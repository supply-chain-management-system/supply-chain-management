from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx
import os

from app.db.deps import get_db, get_tenant_db
from app.models.business_manager.team import LogisticsManager
from app.models.auth.user import User, RoleEnum
from app.services.auth.dependancy import get_current_user
from app.models.sub_managers.logistics_manager.domain import Vehicle, Shipment

router = APIRouter(
    prefix="/business-manager/logistics-managers",
    tags=["BM — Logistics Manager Control"]
)

# ==========================================
# SCHEMAS
# ==========================================

class LMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: str        # Day | Night | Swing
    route: str        # Local | Regional | Long Haul | Last Mile | Cross-Border
    logistics_id: Optional[int] = 1   # Hub / logistics unit ID
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None

    # Card Fields
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"

class LMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    route: str        # Direct route field
    department: str   # Keep for backward compat with frontend
    is_active: bool   # Controls the "Active / Invite Sent" pulsing dot
    
    business_card_id: Optional[int]
    size: Optional[str]
    tagline: Optional[str]
    description: Optional[str]
    color: Optional[str]

    class Config:
        from_attributes = True


# ==========================================
# HELPER: n8n Webhook Dispatch
# ==========================================
async def dispatch_n8n_invite(payload: dict):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(N8N_WEBHOOK_URL, json=payload)
    except Exception as e:
        print(f"⚠️ n8n LM dispatch failed: {e}")


# ==========================================
# GET — All LM Cards (Paginated Grid)
# ==========================================

@router.get("/", response_model=List[LMCardResponse])
def get_logistics_managers(
    logistics_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_tenant_db)
):
    skip = (page - 1) * size
    
    query = db.query(LogisticsManager)
    
    if logistics_id:
        query = query.filter(LogisticsManager.hub_id == logistics_id)

    managers = query.order_by(LogisticsManager.id.desc()).offset(skip).limit(size).all()
    return managers


# ==========================================
# GET — Total count for frontend pagination
# ==========================================

@router.get("/count")
def get_logistics_manager_count(
    logistics_id: Optional[int] = Query(None),
    db: Session = Depends(get_tenant_db)
):
    query = db.query(LogisticsManager)
    if logistics_id:
        query = query.filter(LogisticsManager.hub_id == logistics_id)
    return {"total": query.count()}


# ==========================================
# POST — Create card + send invite email
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=LMCardResponse)
async def create_logistics_manager(
    data: LMCreateSchema, 
    db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(LogisticsManager).filter(LogisticsManager.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Manager with email {data.email} already exists."
        )

    # Map incoming fields to model columns
    new_lm = LogisticsManager(
        name=data.name,
        email=data.email,
        phone=data.phone,
        shift=data.shift,
        route=data.route,
        department=data.route,        # Keep department in sync for frontend compat
        hub_id=data.logistics_id, 
        business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size,
        tagline=data.tagline,
        description=data.description,
        color=data.color,
        is_active=False,
        is_used=False
    )

    try:
        db.add(new_lm)
        db.commit()
        db.refresh(new_lm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



    return new_lm


# ==========================================
# GET — LM Analytics (Fleet & Delivery)
# ==========================================

@router.get("/{manager_id}/analytics")
def get_logistics_manager_analytics(manager_id: int, db: Session = Depends(get_tenant_db)):
    """
    Analytics for the Logistics Control Tower. 
    Ready to hook into 'Shipment' or 'Fleet' tables when teammates build them.
    """
    card = db.query(LogisticsManager).filter(
        LogisticsManager.id == manager_id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Manager not found.")

    # Check if registered
    user = db.query(User).filter(User.email == card.email).first()
    
    # Initialize defaults for unregistered managers
    total_deliveries = 0
    on_time_rate = 0.0
    fleet_utilization = 0.0
    pending_shipments = 0
    avg_transit_days = 0.0
    reliability = "Pending Setup"

    if user:
        # Update is_active and is_used status automatically if they have registered
        if not card.is_active:
            card.is_active = True
            card.is_used = True
            db.commit()

        # User is registered! Calculate real analytics
        total_deliveries = db.query(Shipment).filter(Shipment.status == "Delivered").count()
        pending_shipments = db.query(Shipment).filter(Shipment.status.in_(["Pending", "In Transit"])).count()
        
        total_shipments = db.query(Shipment).count()
        delayed_shipments = db.query(Shipment).filter(Shipment.status == "Delayed").count()
        
        if total_shipments > 0:
            on_time_rate = round(((total_shipments - delayed_shipments) / total_shipments) * 100, 1)
        else:
            on_time_rate = 100.0
            
        total_vehicles = db.query(Vehicle).count()
        active_vehicles = db.query(Vehicle).filter(Vehicle.status == "Active").count()
        if total_vehicles > 0:
            fleet_utilization = round((active_vehicles / total_vehicles) * 100, 1)
        else:
            fleet_utilization = 0.0
            
        avg_transit_days = 2.5 # default/fallback
        
        if on_time_rate >= 95.0:
            reliability = "Excellent"
        elif on_time_rate >= 85.0:
            reliability = "Good"
        elif on_time_rate >= 70.0:
            reliability = "Average"
        else:
            reliability = "Needs Improvement"

    return {
        "manager_id": card.id,
        "name": card.name,
        "route": card.route,            # Direct route field now
        "is_registered": bool(user),
        "total_deliveries_managed": total_deliveries,
        "on_time_rate": on_time_rate,
        "fleet_utilization": fleet_utilization,
        "pending_shipments": pending_shipments,
        "avg_transit_days": avg_transit_days,
        "reliability": reliability
    }


# ==========================================
# DELETE — Remove LM Card
# ==========================================

@router.delete("/{manager_id}", status_code=status.HTTP_200_OK)
def remove_logistics_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    manager = db.query(LogisticsManager).filter(
        LogisticsManager.id == manager_id
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    db.delete(manager)
    db.commit()
    return {"status": "success", "message": f"Logistics Manager {manager_id} removed."}