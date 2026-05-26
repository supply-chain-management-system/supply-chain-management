from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError 
from typing import List

from app.db.deps import get_db, get_tenant_db
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Rack, Product, Inventory_ware
from app.models.sub_managers.factory_manager.production import Factory
from app.schemas.sub_managers.warehouse_manager.ware_schemas import (
    WarehouseCreate, WarehouseOut, RackCreate, RackOut, 
    ProductCreate, ProductOut, InventoryOut, InventoryUpdate, FactoryOut
)

router = APIRouter()

@router.post("/ware_house", response_model=WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(data: WarehouseCreate, db: Session = Depends(get_tenant_db)):
    try:
        warehouse = Warehouse(**data.dict())
        db.add(warehouse)
        db.commit()
        db.refresh(warehouse)
        return warehouse
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Database error occurred")


@router.get("/ware_house", response_model=List[WarehouseOut], status_code=status.HTTP_200_OK)
def get_warehouse(db: Session = Depends(get_tenant_db)):
    return db.query(Warehouse).all()


@router.post("/ware_products", response_model=ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(data: ProductCreate, db: Session = Depends(get_tenant_db)):
    try:
        new_product = Product(**data.dict())
        db.add(new_product)
        db.commit()
        db.refresh(new_product)
        return new_product
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create product")


@router.get("/ware_products", response_model=List[ProductOut], status_code=status.HTTP_200_OK)
def get_products(db: Session = Depends(get_tenant_db)):
    return db.query(Product).all()


@router.post("/inventory", status_code=status.HTTP_200_OK)
def update_inventory(data: InventoryUpdate, db: Session = Depends(get_tenant_db)):
    try:
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
            db.flush() 

        if data.type == "IN":
            inventory.quantity += data.quantity
        elif data.type == "OUT":
            if inventory.quantity < data.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST, 
                    detail="Insufficient stock levels"
                )
            inventory.quantity -= data.quantity
        else:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid operation type")

        db.commit()
        db.refresh(inventory)
        return {"message": "Stock updated", "quantity": inventory.quantity}

    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Stock update failed")


@router.get("/inventory", response_model=List[InventoryOut], status_code=status.HTTP_200_OK)
def get_inventory(db: Session = Depends(get_tenant_db)):
    try:
        # Join Inventory with Product and Rack to get their names
        results = db.query(
            Inventory_ware,
            Product.name.label("product_name"),
            Rack.name.label("rack_name")
        ).join(Product, Inventory_ware.product_id == Product.id)\
         .join(Rack, Inventory_ware.rack_id == Rack.id).all()

        # Format the data for the response
        inventory_list = []
        for inv, p_name, r_name in results:
            inventory_list.append({
                "id": inv.id,
                "product_id": inv.product_id,
                "product_name": p_name,
                "rack_id": inv.rack_id,
                "rack_name": r_name,
                "quantity": inv.quantity
            })
            
        return inventory_list

    except SQLAlchemyError as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch inventory details"
        )


@router.post("/racks", response_model=RackOut, status_code=status.HTTP_201_CREATED)
def create_rack(data: RackCreate, db: Session = Depends(get_tenant_db)):
    try:
        rack = Rack(**data.dict())
        db.add(rack)
        db.commit()
        db.refresh(rack)
        return rack
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Rack creation failed")


@router.get("/racks", response_model=List[dict], status_code=status.HTTP_200_OK)
def get_racks(db: Session = Depends(get_tenant_db)):
    try:
        # Join Rack with Warehouse to get the warehouse name
        results = db.query(
            Rack, 
            Warehouse.name.label("warehouse_name")
        ).join(Warehouse, Rack.warehouse_id == Warehouse.id).all()

        # Format the results into a clean list
        racks_list = []
        for rack, wh_name in results:
            racks_list.append({
                "id": rack.id,
                "name": rack.name,
                "warehouse_id": rack.warehouse_id,
                "warehouse_name": wh_name
            })
            
        return racks_list

    except SQLAlchemyError as e:
        print(f"Database Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to retrieve racks"
        )


@router.delete("/racks/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_rack(id: int, db: Session = Depends(get_tenant_db)):
    rack = db.query(Rack).filter(Rack.id == id).first()
    if not rack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rack not found")
    
    try:
        db.delete(rack)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Delete failed")
    return None


@router.get("/internal/stock/{product_name}", status_code=status.HTTP_200_OK)
def get_stock_proxy(product_name: str, db: Session = Depends(get_tenant_db)):
    try:
        # 1. Find the product by name to get its ID
        product = db.query(Product).filter(Product.name == product_name).first()
        
        if not product:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail=f"Product '{product_name}' not found"
            )
        
        # 2. Sum the quantity from Inventory_ware for this product_id
        # We use .scalar() to get the actual number back
        total_quantity = db.query(func.sum(Inventory_ware.quantity)).filter(
            Inventory_ware.product_id == product.id
        ).scalar()

        # If there are no rows in inventory_ware, scalar returns None, so we set to 0
        final_stock = total_quantity if total_quantity is not None else 0
        print(final_stock)
        return {
            "product_name": product.name, 
            "quantity": final_stock
        }

    except SQLAlchemyError as e:
        db.rollback()
        print(f"Database error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Internal server database error"
        )
    

@router.get("/Factory_deatils", response_model=List[FactoryOut], status_code=status.HTTP_200_OK)
def get_factory_details(db: Session = Depends(get_tenant_db)):
    try:
        return db.query(Factory).all()
        
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to retrieve factory data"
        )