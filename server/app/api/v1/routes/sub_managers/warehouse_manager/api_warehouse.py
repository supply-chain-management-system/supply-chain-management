from fastapi import APIRouter,Depends
from sqlalchemy.orm  import session
from app.db.deps import get_tenant_db

from app.models.sub_managers.warehouse_manager.warehouse import Warehouse,Rack,Product,Inventory_ware

from app.schemas.sub_managers.warehouse_manager.ware_schemas import WarehouseCreate,WarehouseOut,RackCreate,RackOut,ProductCreate,ProductOut,InventoryOut,InventoryUpdate
from typing import List
from fastapi import HTTPException
router=APIRouter()

@router.post("/ware_house",response_model=WarehouseOut)
def create_warehouse(data:WarehouseCreate,db:session=Depends(get_tenant_db)):

    warehouse=Warehouse(**data.dict())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse

@router.get("/ware_house",response_model=List[WarehouseOut])
def get_warehouse(db:session=Depends(get_tenant_db)):

    warehouse=db.query(Warehouse).all()
    return warehouse


@router.post("/ware_products",response_model=ProductOut)
def create_warehouse(data:ProductCreate,db:session=Depends(get_tenant_db)):

    products=Product(**data.dict())
    db.add(products)
    db.commit()
    db.refresh(products)
    return products

@router.get("/ware_products",response_model=List[ProductOut])
def get_products(db:session=Depends(get_tenant_db)):

    products=db.query(Product).all()
    return products


@router.post("/inventory")
def update_inventory(data:InventoryUpdate, db:session = Depends(get_tenant_db)):
    
    inventory = db.query(Inventory_ware).filter(
        Inventory_ware.product_id == data.product_id,
        Inventory_ware.rack_id == data.rack_id
    ).first()

    if not inventory:
        inventory = Inventory_ware(
            product_id=data.product_id,
            rack_id=data.rack_id,
            quantity=0
        )
        db.add(inventory)
        db.commit()
        db.refresh(inventory)

    if data.type == "IN":
        inventory.quantity += data.quantity

    elif data.type == "OUT":
        if inventory.quantity < data.quantity:
            raise HTTPException(status_code=400, detail="Not enough stock")
        inventory.quantity -= data.quantity

    else:
        raise HTTPException(status_code=400, detail="Invalid type")

    db.commit()
    db.refresh(inventory)

    return {
        "message": "Stock updated",
        "product_id": inventory.product_id,
        "rack_id": inventory.rack_id,
        "quantity": inventory.quantity
    }
@router.get("/inventory")
def get_inventory(db: session = Depends(get_tenant_db)):
    return db.query(Inventory_ware).all()


@router.post("/racks",response_model=RackOut)
def create_rack(data: RackCreate, db: session = Depends(get_tenant_db)):
    rack = Rack(**data.dict())
    db.add(rack)
    db.commit()
    db.refresh(rack)
    return rack

@router.get("/racks",response_model=List[RackOut])
def get_racks(db: session = Depends(get_tenant_db)):
    return db.query(Rack).all()














