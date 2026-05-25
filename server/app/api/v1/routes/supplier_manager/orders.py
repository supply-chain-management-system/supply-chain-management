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
    
    from app.models.supplier_manager.supplier import Supplier
    from app.models.supplier_manager.inventory import RawMaterialInventory

    old_status = order.status
    order.status = status
    
    # Auto-restock if transitioning to received
    if status == "received" and old_status != "received" and order.material_name and order.quantity:
        inv_item = db.query(RawMaterialInventory).filter(
            RawMaterialInventory.supplier_id == order.supplier_id,
            RawMaterialInventory.material_name == order.material_name
        ).first()
        
        if inv_item:
            inv_item.quantity += order.quantity
        else:
            supplier = db.query(Supplier).filter(Supplier.id == order.supplier_id).first()
            category = supplier.category if supplier else "General"
            
            new_inv = RawMaterialInventory(
                material_name=order.material_name,
                category=category,
                quantity=order.quantity,
                unit=order.unit or "units",
                min_threshold=10.0,
                supplier_id=order.supplier_id,
                business_id=order.business_id
            )
            db.add(new_inv)
            
    db.commit()
    db.refresh(order)
    return order

@router.put("/{order_id}", response_model=OrderOut)
def update_purchase_order(order_id: int, data: OrderCreate, db: Session = Depends(get_tenant_db)):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    for key, value in data.dict().items():
        setattr(order, key, value)
        
    db.commit()
    db.refresh(order)
    return order

@router.delete("/{order_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_purchase_order(order_id: int, db: Session = Depends(get_tenant_db)):
    order = db.query(PurchaseOrder).filter(PurchaseOrder.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")
    
    db.delete(order)
    db.commit()
    return None
