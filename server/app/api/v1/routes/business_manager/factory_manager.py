from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx
import os

from app.db.deps import get_db, get_tenant_db
from app.models.business_manager.team import FactoryManager
from app.models.auth.user import User, RoleEnum
from app.services.auth.dependancy import get_current_user
from app.models.sub_managers.factory_manager.production import Production, Production_status

N8N_WEBHOOK_URL = os.getenv("N8N_WEBHOOK_URL")

router = APIRouter(
    prefix="/business-manager/factory-managers",
    tags=["BM — Factory Manager Control"]
)

# ==========================================
# SCHEMAS
# ==========================================

class FMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: str        # Day | Night | Swing
    department: str   # Assembly | Quality Control | Logistics
    factory_id: Optional[int] = 1
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None
    
    # Card Fields
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"

class FMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shift: Optional[str] = None
    department: Optional[str] = None
    factory_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None

class FMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    department: str
    role: str
    is_used: bool     # False = invite pending, True = FM registered
    business_id: Optional[int] = 1
    
    business_card_id: Optional[int]
    size: Optional[str]
    tagline: Optional[str]
    description: Optional[str]
    color: Optional[str]

    class Config:
        from_attributes = True

class InviteRequest(BaseModel):
    email: EmailStr

# ==========================================
# HELPER: n8n Webhook Dispatch
# ==========================================
async def dispatch_n8n_invite(payload: dict):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(N8N_WEBHOOK_URL, json=payload)
    except Exception as e:
        print(f"⚠️ n8n dispatch failed: {e}")

# ==========================================
# GET — All FM cards (Paginated Grid)
# ==========================================
@router.get("/", response_model=List[FMCardResponse])
def get_factory_managers(
    factory_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_tenant_db)
):
    skip = (page - 1) * size
    query = db.query(FactoryManager).filter(FactoryManager.role == "factory_manager")
    
    if factory_id:
        query = query.filter(FactoryManager.factory_id == factory_id)

    managers = query.order_by(FactoryManager.id.desc()).offset(skip).limit(size).all()
    return managers

# ==========================================
# GET — Total count for pagination
# ==========================================
@router.get("/count")
def get_factory_manager_count(
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_tenant_db)
):
    query = db.query(FactoryManager).filter(FactoryManager.role == "factory_manager")
    if factory_id:
        query = query.filter(FactoryManager.factory_id == factory_id)
    return {"total": query.count()}

# ==========================================
# POST — Create card + send invite email
# ==========================================
@router.post("/", status_code=status.HTTP_201_CREATED, response_model=FMCardResponse)
async def create_factory_manager(
    data: FMCreateSchema, 
    db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    existing = db.query(FactoryManager).filter(FactoryManager.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A manager with email {data.email} already exists."
        )

    new_fm = FactoryManager(
        name=data.name,
        email=data.email,
        phone=data.phone,
        shift=data.shift,
        department=data.department,
        factory_id=data.factory_id,
        business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size,
        tagline=data.tagline,
        description=data.description,
        color=data.color,
        role="factory_manager", 
        is_used=False
    )

    try:
        db.add(new_fm)
        db.commit()
        db.refresh(new_fm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


    return new_fm

# ==========================================
# DELETE — Remove a manager card
# ==========================================
@router.delete("/{manager_id}", status_code=status.HTTP_200_OK)
def remove_factory_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    # 1. Find the parent "Group Card"
    group_card = db.query(FactoryManager).filter(
        FactoryManager.id == manager_id,
        FactoryManager.role == "factory_manager"
    ).first()

    if not group_card:
        raise HTTPException(status_code=404, detail="Group card not found.")

    try:
        db.query(FactoryManager).filter(
            FactoryManager.factory_id == manager_id,
            FactoryManager.role == "factory_manager_member"
        ).delete(synchronize_session=False)

        db.delete(group_card)
        
        db.commit()
        return {"status": "success", "message": f"Group {manager_id} and its members removed."}
        
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Delete failed: {str(e)}")

@router.put("/{manager_id}", response_model=FMCardResponse)
def update_factory_manager(
    manager_id: int,
    data: FMUpdateSchema,
    db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):
    manager = db.query(FactoryManager).filter(
        FactoryManager.id == manager_id,
        FactoryManager.role == "factory_manager"
    ).first()
    if not manager:
        raise HTTPException(status_code=404, detail="Factory Manager not found")

    if data.email and data.email != manager.email:
        existing = db.query(FactoryManager).filter(FactoryManager.email == data.email).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")

    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(manager, key, value)

    try:
        db.commit()
        db.refresh(manager)
        return manager
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")
# ==========================================
# GET — Live Analytics for one manager
# ==========================================
@router.get("/{manager_id}/analytics")
def get_manager_analytics(manager_id: int, db: Session = Depends(get_tenant_db)):
    manager_card = db.query(FactoryManager).filter(
        FactoryManager.id == manager_id,
        FactoryManager.role == "factory_manager"
    ).first()

    if not manager_card:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    user = db.query(User).filter(User.email == manager_card.email).first()
    
    efficiency = 0
    batches_count = 0
    completed_count = 0
    reliability = "Pending Registration"
    recent_batches = []
    quality_score = None
    incidents = None

    if user:
        if not manager_card.is_used:
            manager_card.is_used = True
            db.commit()

        stats = db.query(
            func.sum(Production.output_qty).label("total_out"),
            func.sum(Production.target_qty).label("total_target"),
            func.count(Production.id).label("batch_count")
        ).filter(Production.created_by == user.id).first()

        if stats and stats.total_target and stats.total_target > 0:
            efficiency = (stats.total_out / stats.total_target) * 100
            batches_count = stats.batch_count
            reliability = "High" if efficiency > 85 else "Standard"
            quality_score = 98.5
            incidents = 0

        completed_count = db.query(Production).filter(
            Production.created_by == user.id,
            Production.status == Production_status.COMPLETED
        ).count()

        recent_production = db.query(Production).filter(
            Production.created_by == user.id
        ).order_by(Production.id.desc()).limit(3).all()

        for prod in recent_production:
            recent_batches.append({
                "batch_id": f"Batch #{prod.id}",
                "completed_at": "Today", 
                "status": prod.status.value
            })

    return {
        "manager_id": manager_card.id,
        "name": manager_card.name,
        "shift": manager_card.shift,
        "department": manager_card.department,
        "is_registered": True if user else False,
        "efficiency_score": round(efficiency, 1),
        "batches_completed": completed_count,
        "total_batches": batches_count,
        "avg_cycle_time": "4.5h" if user else "N/A",
        "reliability": reliability,
        "recent_batches": recent_batches,
        "quality_score": quality_score,
        "incidents": incidents
    }

# ==========================================
# GET — Group Members
# ==========================================
@router.get("/{group_id}/members", response_model=List[FMCardResponse])
def get_group_members(group_id: int, db: Session = Depends(get_tenant_db)):
    # 1. Fetch main group card itself
    group_card = db.query(FactoryManager).filter(
        FactoryManager.id == group_id,
        FactoryManager.role == "factory_manager"
    ).first()
    
    members = []
    
    # 2. Add main manager if not placeholder
    if group_card and group_card.email and group_card.email != "group@placeholder.com":
        user = db.query(User).filter(User.email == group_card.email).first()
        group_card.is_used = True if user else False
        if user:
            group_card.name = user.name
        members.append(group_card)
        
    # 3. Fetch invited members
    invited_members = db.query(FactoryManager).filter(
        FactoryManager.factory_id == group_id,
        FactoryManager.role == "factory_manager_member" 
    ).all()
    
    for m in invited_members:
        user = db.query(User).filter(User.email == m.email).first()
        if user:
            m.is_used = True
            m.name = user.name
        else:
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
    group = db.query(FactoryManager).filter(FactoryManager.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group card not found")

    # Check if the email already exists in public users table
    existing_user = pub_db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail=f"The email {payload.email} is already registered to a user."
        )

    # Check if member already exists in tenant table
    existing_member = db.query(FactoryManager).filter(
        FactoryManager.email == payload.email,
        FactoryManager.factory_id == group_id
    ).first()
    if existing_member:
        raise HTTPException(
            status_code=400,
            detail=f"Invite already sent to {payload.email} for this card."
        )

    # Add the member to the tenant table
    new_member = FactoryManager(
        name=payload.email.split('@')[0], 
        email=payload.email,
        role="factory_manager_member",
        factory_id=group_id, 
        business_id=group.business_id,
        shift=group.shift,
        department=group.department,
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
        role=RoleEnum.factory_manager,
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
                role="factory_manager",
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