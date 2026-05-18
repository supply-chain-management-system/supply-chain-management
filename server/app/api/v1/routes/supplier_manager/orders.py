from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.deps import get_tenant_db
from app.models.supplier_manager.order import PurchaseOrder
from app.schemas.supplier_manager.order import OrderCreate, OrderOut

router = APIRouter(
    prefix="/orders",
    tags=["Supplier Manager — Purchase Orders"]
)

@router.get("/", response_model=List[OrderOut])
def get_orders(
    business_id: int = Query(1),
    db: Session = Depends(get_tenant_db)
):
    return db.query(PurchaseOrder).filter(PurchaseOrder.business_id == business_id).all()

@router.post("/", response_model=OrderOut, status_code=status.HTTP_201_CREATED)
def create_purchase_order(data: OrderCreate, db: Session = Depends(get_tenant_db)):
    new_order = PurchaseOrder(**data.dict())
    db.add(new_order)
    db.commit()
    db.refresh(new_order)
    return new_order

@router.put("/{order_id}/status", response_model=OrderOut)
def update_order_status(order_id: int, status: str, db: Session = Depends(get_tenant_db)):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    order.status = status
    db.commit()
    db.refresh(order)
    return order
