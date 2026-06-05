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

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

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

class LMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shift: Optional[str] = None
    route: Optional[str] = None
    logistics_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class InviteRequest(BaseModel):
    email: EmailStr

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
    
    query = db.query(LogisticsManager).filter(LogisticsManager.role == "logistics_manager")
    
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
    query = db.query(LogisticsManager).filter(LogisticsManager.role == "logistics_manager")
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
        role="logistics_manager",
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

@router.put("/{manager_id}", response_model=LMCardResponse)
def update_logistics_manager(
    manager_id: int,
    data: LMUpdateSchema,
    db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    manager = db.query(LogisticsManager).filter(LogisticsManager.id == manager_id).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Logistics Manager not found")

    if data.email and data.email != manager.email:
        existing = db.query(LogisticsManager).filter(LogisticsManager.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    for key, value in data.model_dump(exclude_unset=True).items():
        if key == "logistics_id":
            manager.hub_id = value
        else:
            setattr(manager, key, value)

    if data.route:
        manager.department = data.route

    try:
        db.commit()
        db.refresh(manager)
        return manager
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==========================================
# GET — Group Members
# ==========================================

@router.get("/{group_id}/members", response_model=List[LMCardResponse])
def get_group_members(group_id: int, db: Session = Depends(get_tenant_db)):
    """Return all invited members that belong to this logistics manager group card."""
    # 1. Fetch main group card itself
    group_card = db.query(LogisticsManager).filter(
        LogisticsManager.id == group_id,
        LogisticsManager.role == "logistics_manager"
    ).first()
    
    members = []
    
    # 2. Add main manager if not placeholder
    if group_card and group_card.email and group_card.email != "group@placeholder.com":
        user = db.query(User).filter(User.email == group_card.email).first()
        group_card.is_active = True if user else False
        group_card.is_used = True if user else False
        if user:
            group_card.name = user.name
        members.append(group_card)
        
    # 3. Fetch invited members
    invited_members = db.query(LogisticsManager).filter(
        LogisticsManager.hub_id == group_id,
        LogisticsManager.role == "logistics_manager_member"
    ).all()
    
    for m in invited_members:
        user = db.query(User).filter(User.email == m.email).first()
        if user:
            m.is_active = True
            m.is_used = True
            m.name = user.name
        else:
            m.is_active = False
            m.is_used = False
        members.append(m)
            
    return members


# ==========================================
# POST — Invite a New Member to a Group
# ==========================================

@router.post("/{group_id}/invite")
async def invite_to_group(
    group_id: int,
    payload: InviteRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_tenant_db),
    pub_db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    group = db.query(LogisticsManager).filter(
        LogisticsManager.id == group_id,
        LogisticsManager.role == "logistics_manager"
    ).first()
    if not group:
        raise HTTPException(status_code=404, detail="Logistics manager group card not found")

    # Check if the email already exists in public users table
    existing_user = pub_db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400,
            detail=f"The email {payload.email} is already registered to a user."
        )

    # Check if member already exists in tenant table
    existing_member = db.query(LogisticsManager).filter(
        LogisticsManager.email == payload.email,
        LogisticsManager.hub_id == group_id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=400,
            detail=f"Invite already sent to {payload.email} for this card."
        )

    # Add the member to the tenant table
    new_member = LogisticsManager(
        name=payload.email.split("@")[0],
        email=payload.email,
        role="logistics_manager_member",
        hub_id=group_id,
        business_id=group.business_id,
        shift=group.shift,
        route=group.route,
        department=group.route,
        is_active=False,
        is_used=False
    )
    db.add(new_member)
    db.commit()

    # Create Invitation in public database
    event_id = str(uuid.uuid4())
    from app.models.auth.user import Invitation, RoleEnum
    
    # Resolve the business owner's email
    from app.models.company.company import Company
    company = pub_db.query(Company).filter(Company.id == current_user.company_id).first()
    business_owner_email = company.owner_email if company else current_user.email
    
    invitation = Invitation(
        id=event_id,
        invited_email=payload.email,
        company_id=current_user.company_id,
        business_id=str(group.business_id),
        role=RoleEnum.logistics_manager,
        category="manager_card",
        category_id=str(group_id),
        invited_by=current_user.email,
        owner_email=business_owner_email,
        accepted=False
    )
    pub_db.add(invitation)
    pub_db.commit()

    # Dispatch n8n notification if webhook is configured
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    invite_link = f"{FRONTEND_URL}/invite/accept/{event_id}"
    
    if N8N_WEBHOOK_URL:
        from app.services.auth.rolebased import build_recipients
        from app.schemas.auth.company import InviteRequest as PubInviteRequest
        try:
            pub_payload = PubInviteRequest(
                business_id=group.business_id,
                role="logistics_manager",
                email=payload.email,
                manager_card_id=group_id,
                manager_card_name=group.name
            )
            recipients = build_recipients(current_user, pub_payload, business_owner_email)
            
            n8n_data = {
                "event_id": invitation.id,
                "event_type": "invite_created",
                "company_id": invitation.company_id,
                "business_id": invitation.business_id,
                "role": invitation.role.value,
                "invited_email": invitation.invited_email,
                "created_by": invitation.invited_by,
                "owner_email": invitation.owner_email,
                "invite_link": invite_link,
                "invite_recipient": recipients["invite_recipient"],
                "notification_recipients": recipients["notification_recipients"],
                "category": invitation.category,
                "category_id": invitation.category_id,
                "manager_card_id": group_id,
                "manager_card_name": group.name
            }
            background_tasks.add_task(dispatch_n8n_invite, n8n_data)
        except Exception as ex:
            print(f"Error building recipients for n8n: {ex}")

    return {"status": "success", "message": f"Invite sent to {payload.email}"}