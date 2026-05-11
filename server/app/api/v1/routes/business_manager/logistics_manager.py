from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx

from app.db.deps import get_db
from app.models.company_auth.managers import InviteToken
from app.models.auth.user import User, RoleEnum

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
    route_region: str # e.g., North Region, International, Local Delivery
    hub_id: Optional[int] = 1 # Similar to factory_id/warehouse_id

class LMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    department: str   # We map 'route_region' to 'department'
    is_used: bool     # Controls the "Active / Invite Sent" pulsing dot

    class Config:
        from_attributes = True


# ==========================================
# GET — All LM Cards (Paginated Grid)
# ==========================================

@router.get("/", response_model=List[LMCardResponse])
def get_logistics_managers(
    hub_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    query = db.query(InviteToken).filter(
        InviteToken.role == "logistics_manager"
    )
    if hub_id:
        query = query.filter(InviteToken.factory_id == hub_id) # Using factory_id as generic location ID

    managers = query.order_by(InviteToken.created_at.desc()).offset(skip).limit(size).all()
    
    # Check which managers have actually registered (is_used)
    registered_emails = {
        u.email for u in db.query(User.email).filter(User.role == RoleEnum.logistics_manager).all()
    }

    results = []
    for m in managers:
        results.append({
            "id": m.id,
            "name": m.name,
            "email": m.email,
            "phone": m.phone,
            "shift": m.shift,
            "department": getattr(m, 'department', 'General Transit'),
            "is_used": m.email in registered_emails
        })

    return results


# ==========================================
# GET — Total count for frontend pagination
# ==========================================

@router.get("/count")
def get_logistics_manager_count(
    hub_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(InviteToken).filter(InviteToken.role == "logistics_manager")
    if hub_id:
        query = query.filter(InviteToken.factory_id == hub_id)
    return {"total": query.count()}


# ==========================================
# POST — Create card + send invite email
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=LMCardResponse)
async def create_logistics_manager(data: LMCreateSchema, db: Session = Depends(get_db)):
    existing = db.query(InviteToken).filter(InviteToken.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Manager with email {data.email} already exists."
        )

    token = str(uuid.uuid4())

    new_lm = InviteToken(
        token=token,
        email=data.email,
        role="logistics_manager",
        name=data.name,
        phone=data.phone,
        shift=data.shift,
        department=data.route_region,  # Map the incoming 'route_region' to 'department' in DB
        factory_id=data.hub_id, 
        extra_data={"type": "logistics_specific"}, 
    )

    try:
        db.add(new_lm)
        db.commit()
        db.refresh(new_lm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    invite_link = (
        f"http://localhost:5173/register"
        f"?token={token}&role=logistics_manager&tid={data.hub_id or 1}"
    )

    # Fire n8n (Non-blocking)
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                "http://127.0.0.1:5678/webhook/invite-user",
                json={
                    **data.dict(),
                    "role": "Logistics Manager",
                    "token": token,
                    "invite_link": invite_link,
                }
            )
    except Exception as e:
        print(f"⚠️ n8n LM dispatch skipped: {e}")

    return {
        "id": new_lm.id,
        "name": new_lm.name,
        "email": new_lm.email,
        "phone": new_lm.phone,
        "shift": new_lm.shift,
        "department": new_lm.department,
        "is_used": False
    }


# ==========================================
# GET — LM Analytics (Fleet & Delivery)
# ==========================================

@router.get("/{manager_id}/analytics")
def get_logistics_manager_analytics(manager_id: int, db: Session = Depends(get_db)):
    """
    Analytics for the Logistics Control Tower. 
    Ready to hook into 'Shipment' or 'Fleet' tables when teammates build them.
    """
    card = db.query(InviteToken).filter(
        InviteToken.id == manager_id,
        InviteToken.role == "logistics_manager"
    ).first()
    
    if not card:
        raise HTTPException(status_code=404, detail="Manager not found.")

    # Check if registered
    user = db.query(User).filter(User.email == card.email).first()
    
    # Initialize defaults for unregistered managers
    active_shipments = 0
    on_time_delivery = "0%"
    fleet_status = "N/A"
    fuel_efficiency = "N/A"
    reliability = "Pending Setup"

    if user:
        # User is registered! 
        # (Replace these mocks with real db.query(Shipment) logic later)
        active_shipments = 24
        on_time_delivery = "96.4%"
        fleet_status = "8/10 Active"
        fuel_efficiency = "Optimal"
        reliability = "Excellent"

    return {
        "manager_id": card.id,
        "name": card.name,
        "route_region": card.department,
        "is_registered": bool(user),
        "active_shipments": active_shipments,
        "on_time_delivery": on_time_delivery,
        "fleet_status": fleet_status,
        "fuel_efficiency": fuel_efficiency,
        "reliability": reliability
    }


# ==========================================
# DELETE — Remove LM Card
# ==========================================

@router.delete("/{manager_id}", status_code=status.HTTP_200_OK)
def remove_logistics_manager(manager_id: int, db: Session = Depends(get_db)):
    manager = db.query(InviteToken).filter(
        InviteToken.id == manager_id,
        InviteToken.role == "logistics_manager"
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    db.delete(manager)
    db.commit()
    return {"status": "success", "message": f"Logistics Manager {manager_id} removed."}