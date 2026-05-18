from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx
import os

from app.db.deps import get_db, get_tenant_db
from app.models.business_manager.team import SupplyManager
from app.models.auth.user import User, RoleEnum
from app.services.auth.dependancy import get_current_user

router = APIRouter(
    prefix="/business-manager/supply-managers",
    tags=["BM — Supply Manager Control"]
)

# ==========================================
# SCHEMAS
# ==========================================

class SMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    category: str     # Electronics | Raw Material | Hydraulics | Plastics | Chemicals | Packaging | Textiles | Machinery
    region: str       # Domestic | International | Asia-Pacific | Europe | Americas
    department: str = "Procurement"
    supplier_id: Optional[int] = None
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None

    # Card Fields
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"

class SMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    category: str
    region: str
    department: str
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
        print(f"⚠️ n8n SM dispatch failed: {e}")


# ==========================================
# GET — All SM Cards (Paginated Grid)
# ==========================================

@router.get("/", response_model=List[SMCardResponse])
def get_supply_managers(
    supplier_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_tenant_db)
):
    skip = (page - 1) * size
    
    query = db.query(SupplyManager)
    
    if supplier_id:
        query = query.filter(SupplyManager.supplier_id == supplier_id)

    managers = query.order_by(SupplyManager.id.desc()).offset(skip).limit(size).all()
    return managers


# ==========================================
# GET — Total count for frontend pagination
# ==========================================

@router.get("/count")
def get_supply_manager_count(
    supplier_id: Optional[int] = Query(None),
    db: Session = Depends(get_tenant_db)
):
    query = db.query(SupplyManager)
    if supplier_id:
        query = query.filter(SupplyManager.supplier_id == supplier_id)
    return {"total": query.count()}


# ==========================================
# POST — Create card + send invite email
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=SMCardResponse)
async def create_supply_manager(
    data: SMCreateSchema, 
    db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(SupplyManager).filter(SupplyManager.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Manager with email {data.email} already exists."
        )

    # Map incoming fields to model columns
    new_sm = SupplyManager(
        name=data.name,
        email=data.email,
        phone=data.phone,
        category=data.category,
        region=data.region,
        department=data.department,
        supplier_id=data.supplier_id, 
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
        db.add(new_sm)
        db.commit()
        db.refresh(new_sm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")



    return new_sm


# ==========================================
# GET — SM Analytics
# ==========================================

@router.get("/{manager_id}/analytics")
def get_supply_manager_analytics(manager_id: int, db: Session = Depends(get_tenant_db)):
    """
    Analytics for the Supply Manager Control Tower.
    """
    card = db.query(SupplyManager).filter(
        SupplyManager.id == manager_id
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Manager not found.")

    # Check if registered
    user = db.query(User).filter(User.email == card.email).first()
    
    # Initialize defaults for unregistered managers
    total_suppliers_managed = 0
    on_time_delivery = 0
    quality_score = 0
    active_contracts = 0
    avg_lead_time_days = 0
    reliability = "Pending Setup"

    if user:
        # Update is_active and is_used status automatically if they have registered
        if not card.is_active:
            card.is_active = True
            card.is_used = True
            db.commit()

        # User is registered! 
        # Mocked real data
        total_suppliers_managed = 12
        on_time_delivery = 98.4
        quality_score = 99.1
        active_contracts = 8
        avg_lead_time_days = 14
        reliability = "Excellent"

    return {
        "manager_id": card.id,
        "name": card.name,
        "category": card.category,
        "is_registered": bool(user),
        "total_suppliers_managed": total_suppliers_managed,
        "on_time_delivery": on_time_delivery,
        "quality_score": quality_score,
        "active_contracts": active_contracts,
        "avg_lead_time_days": avg_lead_time_days,
        "reliability": reliability
    }


# ==========================================
# DELETE — Remove SM Card
# ==========================================

@router.delete("/{manager_id}", status_code=status.HTTP_200_OK)
def remove_supply_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    manager = db.query(SupplyManager).filter(
        SupplyManager.id == manager_id
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    db.delete(manager)
    db.commit()
    return {"status": "success", "message": f"Supply Manager {manager_id} removed."}
