from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, EmailStr
from typing import Optional, List

from app.db.deps import get_db
from app.models.business_manager.domain import Supplier # The model you just added
# Assume Inventory exists from previous steps
from app.models.business_manager.domain import Inventory 

router = APIRouter(
    prefix="/business-manager/suppliers",
    tags=["BM — Suppliers & Procurement"]
)

# ==========================================
# SCHEMAS
# ==========================================

class SupplierCreateSchema(BaseModel):
    name: str
    category: str
    contact_email: EmailStr
    phone: Optional[str] = None
    lead_time_days: int

class SupplierResponse(BaseModel):
    id: int
    name: str
    category: str
    contact_email: str
    phone: Optional[str]
    lead_time_days: int
    rating: float
    is_active: bool

    class Config:
        from_attributes = True


# ==========================================
# GET — All Suppliers (Paginated Grid/List)
# ==========================================

@router.get("/", response_model=List[SupplierResponse])
def get_suppliers(
    category: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    skip = (page - 1) * size
    query = db.query(Supplier)
    
    if category:
        query = query.filter(Supplier.category == category)

    suppliers = query.order_by(Supplier.rating.desc()).offset(skip).limit(size).all()
    return suppliers


# ==========================================
# GET — Total count for frontend pagination
# ==========================================

@router.get("/count")
def get_supplier_count(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Supplier)
    if category:
        query = query.filter(Supplier.category == category)
    return {"total": query.count()}


# ==========================================
# POST — Onboard a New Supplier
# ==========================================

@router.post("/", status_code=status.HTTP_201_CREATED, response_model=SupplierResponse)
def create_supplier(data: SupplierCreateSchema, db: Session = Depends(get_db)):
    existing = db.query(Supplier).filter(Supplier.name == data.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"A supplier named {data.name} already exists."
        )

    new_supplier = Supplier(
        name=data.name,
        category=data.category,
        contact_email=data.contact_email,
        phone=data.phone,
        lead_time_days=data.lead_time_days,
        rating=5.0, # Start with perfect rating, adjusted by analytics later
        is_active=True
    )

    try:
        db.add(new_supplier)
        db.commit()
        db.refresh(new_supplier)
        return new_supplier
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")


# ==========================================
# GET — Supplier Analytics (Procurement KPIs)
# ==========================================

@router.get("/{supplier_id}/analytics")
def get_supplier_analytics(supplier_id: int, db: Session = Depends(get_db)):
    """
    Analytics for Vendor Performance.
    Ready to hook into 'PurchaseOrders' or 'InboundShipments' when built.
    """
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    
    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    # In a fully wired system, you would query PurchaseOrders linked to this supplier.
    # For now, we generate robust logic-based metrics based on their base data.
    
    return {
        "supplier_id": supplier.id,
        "name": supplier.name,
        "category": supplier.category,
        "lead_time": f"{supplier.lead_time_days} Days",
        "current_rating": f"{supplier.rating} / 5.0",
        
        # Mocked Operational Metrics (Hook these to DB later)
        "on_time_delivery_rate": "98.5%" if supplier.rating > 4.5 else "82.0%",
        "active_purchase_orders": 3 if supplier.is_active else 0,
        "defect_rate": "0.4%" if supplier.rating > 4.0 else "3.2%",
        "reliability_status": "Preferred Vendor" if supplier.rating >= 4.5 else "Under Review"
    }


# ==========================================
# DELETE — Remove / Blacklist a Supplier
# ==========================================

@router.delete("/{supplier_id}", status_code=status.HTTP_200_OK)
def remove_supplier(supplier_id: int, db: Session = Depends(get_db)):
    supplier = db.query(Supplier).filter(Supplier.id == supplier_id).first()

    if not supplier:
        raise HTTPException(status_code=404, detail="Supplier not found.")

    db.delete(supplier)
    db.commit()
    return {"status": "success", "message": f"Supplier {supplier.name} removed from registry."}