from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr
from typing import Optional, List
import uuid
import httpx

from app.db.deps import get_db
from app.models.company_auth.managers import InviteToken

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
# GET — All FM cards (no pagination limit,
#        frontend handles the 3x3 grid)
# ==========================================

@router.get("/", response_model=List[FMCardResponse])
def get_factory_managers(
    factory_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(9, ge=1, le=50),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    query = db.query(InviteToken).filter(
        InviteToken.role == "Factory Manager"
    )
    if factory_id:
        query = query.filter(InviteToken.factory_id == factory_id)

    managers = query.order_by(InviteToken.created_at.desc()).offset(skip).limit(size).all()
    return managers


# ==========================================
# GET — Total count for frontend pagination
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
    1. Check for duplicate email
    2. Save InviteToken record (card is created immediately)
    3. Fire n8n webhook with token + role + card data for email
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
        extra_data={},   # reserved for future FM-specific fields
    )

    try:
        db.add(new_fm)
        db.commit()
        db.refresh(new_fm)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")

    # --- Fire n8n (non-blocking, won't crash if n8n is offline) ---
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
        print(f"⚠️  n8n dispatch skipped: {e}")

    return new_fm


# ==========================================
# GET — Analytics for one manager (mocked
#        until teammate wires Production table)
# ==========================================

@router.get("/{manager_id}/analytics")
def get_manager_analytics(manager_id: int, db: Session = Depends(get_db)):
    manager = db.query(InviteToken).filter(
        InviteToken.id == manager_id,
        InviteToken.role == "Factory Manager"
    ).first()

    if not manager:
        raise HTTPException(status_code=404, detail="Manager not found.")

    return {
        "manager_id": manager.id,
        "name": manager.name,
        "shift": manager.shift,
        "department": manager.department,
        # --- Mocked until Production table is wired ---
        "efficiency_score": 85,
        "batches_completed": 40,
        "avg_cycle_time": "4.5h",
        "safety_incidents": 0,
        "on_time_rate": "91%",
        "reliability": "High",
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