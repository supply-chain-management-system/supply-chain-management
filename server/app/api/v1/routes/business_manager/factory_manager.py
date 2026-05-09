from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx

from app.db.deps import get_db
from app.models.company_auth.managers import InviteToken
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

class FMCardResponse(BaseModel):
    id: int
    name: str
    email: str
    phone: Optional[str]
    shift: str
    department: str
    is_used: bool     # False = invite pending, True = FM registered

    class Config:
        from_attributes = True


# ==========================================
# GET — All FM cards (Paginated 3x3 Grid)
# ==========================================

@router.get("/", response_model=List[FMCardResponse])
def get_factory_managers(
    factory_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """
    Fetches the manager cards stored in InviteToken.
   
    """
    skip = (page - 1) * size
    query = db.query(InviteToken).filter(
        InviteToken.role == "Factory Manager"
    )
    if factory_id:
        query = query.filter(InviteToken.factory_id == factory_id)

    managers = query.order_by(InviteToken.created_at.desc()).offset(skip).limit(size).all()
    return managers


# ==========================================
# GET — Total count for pagination
# ==========================================

@router.get("/count")
def get_factory_manager_count(
    factory_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(InviteToken).filter(InviteToken.role == "Factory Manager")
    if factory_id:
        query = query.filter(InviteToken.factory_id == factory_id)
    return {"total": query.count()}


# ==========================================
# POST — Create card + send invite email
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=FMCardResponse)
async def create_factory_manager(data: FMCreateSchema, db: Session = Depends(get_db)):
    """
    Saves InviteToken record and dispatches n8n webhook.
   
    """
    existing = db.query(InviteToken).filter(InviteToken.email == data.email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A manager with email {data.email} already exists."
        )

    token = str(uuid.uuid4())

    new_fm = InviteToken(
        token=token,
        email=data.email,
        role="Factory Manager",
        name=data.name,
        phone=data.phone,
        shift=data.shift,
        department=data.department,
        factory_id=data.factory_id,
        extra_data={}, 
    )

    try:
        db.add(new_fm)
        db.commit()
        db.refresh(new_fm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    invite_link = (
        f"http://localhost:5173/register"
        f"?token={token}&role=Factory+Manager&tid={data.factory_id or 1}"
    )

    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            await client.post(
                "http://127.0.0.1:5678/webhook/invite-user",
                json={
                    **data.dict(),
                    "role": "Factory Manager",
                    "token": token,
                    "invite_link": invite_link,
                }
            )
    except Exception as e:
        print(f"⚠️ n8n dispatch skipped: {e}")

    return new_fm


# ==========================================
# GET — Live Analytics for one manager
# ==========================================

@router.get("/{manager_id}/analytics")
def get_manager_analytics(manager_id: int, db: Session = Depends(get_db)):
    """
    Connects to teammate's Production table to calculate real efficiency.
   
    """
    # 1. Retrieve the card to get the email
    manager_card = db.query(InviteToken).filter(
        InviteToken.id == manager_id,
        InviteToken.role == "Factory Manager"
    ).first()

    if not manager_card:
        raise HTTPException(status_code=404, detail="Manager card not found.")

    # 2. Check if the manager is registered (exists in User table)
    user = db.query(User).filter(User.email == manager_card.email).first()
    
    # 3. Initialize default stats
    efficiency = 0
    batches_count = 0
    completed_count = 0
    reliability = "Pending Registration"

    if user:
        # Query teammate's Production table using User.id hook
        #
        stats = db.query(
            func.sum(Production.output_qty).label("total_out"),
            func.sum(Production.target_qty).label("total_target"),
            func.count(Production.id).label("batch_count")
        ).filter(Production.created_by == user.id).first()

        if stats and stats.total_target and stats.total_target > 0:
            # Efficiency Calculation Formula:
            # $$\text{Efficiency} = \frac{\sum \text{output\_qty}}{\sum \text{target\_qty}} \times 100$$
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
    manager = db.query(InviteToken).filter(
        InviteToken.id == manager_id,
        InviteToken.role == "Factory Manager"
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found.")

    db.delete(manager)
    db.commit()
    return {"status": "success", "message": f"Manager {manager_id} removed."}