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
    members = db.query(FactoryManager).filter(
        FactoryManager.factory_id == group_id,
        FactoryManager.role == "factory_manager_member" 
    ).all()
    return members

# ==========================================
# POST — Invite a New Member to a Group
# ==========================================
@router.post("/{group_id}/invite")
async def invite_to_group(
    group_id: int, 
    payload: InviteRequest, 
    background_tasks: BackgroundTasks, 
    db: Session = Depends(get_tenant_db)
):
    group = db.query(FactoryManager).filter(FactoryManager.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Group card not found")

    # 🚀 THE FIX: Check if the email already exists before doing anything
    existing_user = db.query(FactoryManager).filter(FactoryManager.email == payload.email).first()
    if existing_user:
        raise HTTPException(
            status_code=400, 
            detail=f"The email {payload.email} is already registered to a manager."
        )

    token = str(uuid.uuid4())
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

    invite_link = f"http://localhost:5173/register?token={token}&role=factory_member"
    background_tasks.add_task(dispatch_n8n_invite, {
        "email": payload.email,
        "invite_link": invite_link,
        "group_name": group.name
    })

    return {"status": "success", "message": f"Invite sent to {payload.email}"}