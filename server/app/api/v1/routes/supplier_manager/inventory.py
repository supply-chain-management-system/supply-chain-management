from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.db.deps import get_tenant_db
from app.models.supplier_manager.inventory import RawMaterialInventory
from app.schemas.supplier_manager.inventory import InventoryCreate, InventoryOut

router = APIRouter(
    prefix="/inventory",
    tags=["Supplier Manager — Raw Materials Inventory"]
)

@router.get("/", response_model=List[InventoryOut])
def get_inventory(
    business_id: int = Query(1),
    db: Session = Depends(get_tenant_db)
):
    return db.query(RawMaterialInventory).filter(RawMaterialInventory.business_id == business_id).all()

@router.post("/", response_model=InventoryOut, status_code=status.HTTP_201_CREATED)
def add_inventory_item(data: InventoryCreate, db: Session = Depends(get_tenant_db)):
    new_item = RawMaterialInventory(**data.dict())
    db.add(new_item)
    db.commit()
    db.refresh(new_item)
    return new_item

@router.put("/{item_id}", response_model=InventoryOut)
def update_inventory_item(item_id: int, data: InventoryCreate, db: Session = Depends(get_tenant_db)):
    item = db.query(RawMaterialInventory).filter(RawMaterialInventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    
    for key, value in data.dict().items():
        setattr(item, key, value)
    
    db.commit()
    db.refresh(item)
    return item
