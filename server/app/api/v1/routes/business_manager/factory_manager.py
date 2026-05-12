from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx

from app.db.deps import get_db
# 🚀 Replaced InviteToken with your new TeamManager model
from app.models.business_manager.team import TeamManager
from app.models.auth.user import User  # Hook to check registration
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
    business_id: Optional[int] = 1 # 🚀 Added business_id handling

class FMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    department: str
    role: str
    is_used: bool     # False = invite pending, True = FM registered

    class Config:
        from_attributes = True


# ==========================================
# HELPER: n8n Webhook Dispatch
# ==========================================
async def dispatch_n8n_invite(payload: dict):
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post("http://127.0.0.1:5678/webhook/invite-user", json=payload)
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
    db: Session = Depends(get_db)
):
    """
    Fetches the manager cards stored in TeamManager.
    """
    skip = (page - 1) * size
    
    # Filter by the specific role so WHM/Logistics don't show up here!
    query = db.query(TeamManager).filter(TeamManager.role == "factory_manager")
    
    if factory_id:
        query = query.filter(TeamManager.entity_id == factory_id)

    # Order by newest first
    managers = query.order_by(TeamManager.id.desc()).offset(skip).limit(size).all()
    return managers


# ==========================================
# GET — Total count for pagination
# ==========================================

@router.get("/count")
def get_factory_manager_count(
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(TeamManager).filter(TeamManager.role == "factory_manager")
    if factory_id:
        query = query.filter(TeamManager.entity_id == factory_id)
    return {"total": query.count()}


# ==========================================
# POST — Create card + send invite email
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=FMCardResponse)
async def create_factory_manager(data: FMCreateSchema, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """
    Saves TeamManager record and dispatches n8n webhook in background.
    """
    # 1. Check for duplicates
    existing = db.query(TeamManager).filter(TeamManager.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A manager with email {data.email} already exists."
        )

    # 2. Save the new card to the TeamManager table
    new_fm = TeamManager(
        name=data.name,
        email=data.email,
        phone=data.phone,
        shift=data.shift,
        department=data.department,
        entity_id=data.factory_id,
        business_id=data.business_id,
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

    # 3. Generate invite link and dispatch n8n webhook
    token = str(uuid.uuid4())
    invite_link = (
        f"http://localhost:5173/register"
        f"?token={token}&role=factory_manager&tid={data.factory_id or 1}&bid={data.business_id or 1}"
    )

    webhook_payload = {
        "name": data.name,
        "email": data.email,
        "role": "factory_manager",
        "business_id": data.business_id,
        "token": token,
        "invite_link": invite_link,
    }

    # Pass the HTTP call to a background task so the React UI returns instantly
    background_tasks.add_task(dispatch_n8n_invite, webhook_payload)

    return new_fm


# ==========================================
# GET — Live Analytics for one manager
# ==========================================

@router.get("/{manager_id}/analytics")
def get_manager_analytics(manager_id: int, db: Session = Depends(get_db)):
    """
    Connects to the Production table to calculate real efficiency.
    """
    manager_card = db.query(TeamManager).filter(
        TeamManager.id == manager_id,
        TeamManager.role == "factory_manager"
    ).first()

    if not manager_card:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    user = db.query(User).filter(User.email == manager_card.email).first()
    
    efficiency = 0
    batches_count = 0
    completed_count = 0
    reliability = "Pending Registration"

    if user:
        # Check if the UI needs to be updated to show they registered
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

        completed_count = db.query(Production).filter(
            Production.created_by == user.id,
            Production.status == Production_status.COMPLETED
        ).count()

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
    }


# ==========================================
# DELETE — Remove a manager card
# ==========================================

@router.delete("/{manager_id}", status_code=status.HTTP_200_OK)
def remove_factory_manager(manager_id: int, db: Session = Depends(get_db)):
    manager = db.query(TeamManager).filter(
        TeamManager.id == manager_id,
        TeamManager.role == "factory_manager"
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found.")

    db.delete(manager)
    db.commit()
    return {"status": "success", "message": f"Manager {manager_id} removed."}