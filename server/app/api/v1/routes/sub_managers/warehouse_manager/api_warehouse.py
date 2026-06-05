from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from sqlalchemy.exc import SQLAlchemyError 
from typing import List, Optional

from app.db.deps import get_db, get_tenant_db
from app.models.sub_managers.warehouse_manager.warehouse import Warehouse, Rack, Product, Inventory_ware, BillOfMaterials
from app.models.sub_managers.factory_manager.production import Factory
from app.schemas.sub_managers.warehouse_manager.ware_schemas import (
    WarehouseCreate, WarehouseOut, RackCreate, RackOut, 
    ProductCreate, ProductOut, InventoryOut, InventoryUpdate, FactoryOut,
    BillOfMaterialsCreate, BillOfMaterialsOut, ProductUpdate, RackUpdate, InventoryDirectUpdate
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
    warehouses = db.query(Warehouse).all()
    if not warehouses:
        default_wh = Warehouse(name="Korvex Main Warehouse", location="Default")
        db.add(default_wh)
        db.commit()
        db.refresh(default_wh)
        warehouses = [default_wh]
    return warehouses


@router.delete("/ware_house/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_warehouse(id: int, db: Session = Depends(get_tenant_db)):
    warehouse = db.query(Warehouse).filter(Warehouse.id == id).first()
    if not warehouse:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Warehouse not found")
    try:
        db.delete(warehouse)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete warehouse")
    return None


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
def get_products(type: Optional[str] = None, db: Session = Depends(get_tenant_db)):
    query = db.query(Product)
    if type:
        query = query.filter(Product.type == type)
    return query.all()


@router.delete("/ware_products/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(id: int, db: Session = Depends(get_tenant_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    try:
        # 1. Delete all inventory_ware records referencing this product (FK constraint)
        db.query(Inventory_ware).filter(Inventory_ware.product_id == id).delete(synchronize_session=False)
        # 2. Delete BOM entries where this product is the finished good or material
        from app.models.sub_managers.warehouse_manager.warehouse import BillOfMaterials
        db.query(BillOfMaterials).filter(
            (BillOfMaterials.finished_product_id == id) |
            (BillOfMaterials.material_product_id == id)
        ).delete(synchronize_session=False)
        # 3. Delete material requests referencing this product
        from app.models.sub_managers.request import MaterialRequest
        db.query(MaterialRequest).filter(MaterialRequest.product_id == id).delete(synchronize_session=False)
        # 4. Now safe to delete the product itself
        db.delete(product)
        db.commit()
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Could not delete product: {str(e)}")
    return None


@router.put("/ware_products/{id}", response_model=ProductOut, status_code=status.HTTP_200_OK)
def update_product(id: int, data: ProductUpdate, db: Session = Depends(get_tenant_db)):
    product = db.query(Product).filter(Product.id == id).first()
    if not product:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
    try:
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        db.commit()
        db.refresh(product)
        return product
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update product")


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
                quantity=0,
                batch_number=data.batch_number,
                expiry_date=data.expiry_date,
                status=data.status or "available"
            )
            db.add(inventory)
            db.flush() 

        if data.type == "IN":
            inventory.quantity += data.quantity
            if data.batch_number is not None:
                inventory.batch_number = data.batch_number
            if data.expiry_date is not None:
                inventory.expiry_date = data.expiry_date
            if data.status is not None:
                inventory.status = data.status
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
                "quantity": inv.quantity,
                "batch_number": inv.batch_number,
                "expiry_date": inv.expiry_date,
                "status": inv.status or "available"
            })
            
        return inventory_list

    except SQLAlchemyError as e:
        print(f"Error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to fetch inventory details"
        )


@router.delete("/inventory/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_inventory(id: int, db: Session = Depends(get_tenant_db)):
    inventory = db.query(Inventory_ware).filter(Inventory_ware.id == id).first()
    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    try:
        db.delete(inventory)
        db.commit()
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete inventory record")
    return None


@router.put("/inventory/{id}", response_model=InventoryOut, status_code=status.HTTP_200_OK)
def update_inventory_direct(id: int, data: InventoryDirectUpdate, db: Session = Depends(get_tenant_db)):
    inventory = db.query(Inventory_ware).filter(Inventory_ware.id == id).first()
    if not inventory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Inventory record not found")
    try:
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(inventory, key, value)
        db.commit()
        db.refresh(inventory)
        
        # Get product and rack names for response mapping
        product_name = db.query(Product.name).filter(Product.id == inventory.product_id).scalar()
        rack_name = db.query(Rack.name).filter(Rack.id == inventory.rack_id).scalar()
        
        return {
            "id": inventory.id,
            "product_id": inventory.product_id,
            "product_name": product_name,
            "rack_id": inventory.rack_id,
            "rack_name": rack_name,
            "quantity": inventory.quantity,
            "batch_number": inventory.batch_number,
            "expiry_date": inventory.expiry_date,
            "status": inventory.status or "available"
        }
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update inventory record")


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
                "warehouse_name": wh_name,
                "zone": rack.zone,
                "max_weight": rack.max_weight,
                "rows": rack.rows
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


@router.put("/racks/{id}", response_model=RackOut, status_code=status.HTTP_200_OK)
def update_rack(id: int, data: RackUpdate, db: Session = Depends(get_tenant_db)):
    rack = db.query(Rack).filter(Rack.id == id).first()
    if not rack:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Rack not found")
    try:
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(rack, key, value)
        db.commit()
        db.refresh(rack)
        return rack
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not update rack")


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
        factories = db.query(Factory).all()
        if not factories:
            default_factory = Factory(name="Main Factory Sector B")
            db.add(default_factory)
            db.commit()
            db.refresh(default_factory)
            factories = [default_factory]
        return factories
        
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to retrieve factory data"
        )


@router.post("/bill_of_materials", response_model=BillOfMaterialsOut, status_code=status.HTTP_201_CREATED)
def create_bill_of_materials(data: BillOfMaterialsCreate, db: Session = Depends(get_tenant_db)):
    try:
        # Verify finished product exists
        finished_product = db.query(Product).filter(Product.id == data.finished_product_id).first()
        if not finished_product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Finished product not found")
        
        # Verify material product exists
        material_product = db.query(Product).filter(Product.id == data.material_product_id).first()
        if not material_product:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Material product not found")

        bom = BillOfMaterials(**data.dict())
        db.add(bom)
        db.commit()
        db.refresh(bom)
        return bom
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create Bill of Materials entry")


@router.get("/bill_of_materials", response_model=List[BillOfMaterialsOut], status_code=status.HTTP_200_OK)
def get_bill_of_materials(finished_product_id: Optional[int] = None, db: Session = Depends(get_tenant_db)):
    query = db.query(BillOfMaterials)
    if finished_product_id:
        query = query.filter(BillOfMaterials.finished_product_id == finished_product_id)
    return query.all()


@router.delete("/bill_of_materials/{id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_bill_of_materials(id: int, db: Session = Depends(get_tenant_db)):
    try:
        bom = db.query(BillOfMaterials).filter(BillOfMaterials.id == id).first()
        if not bom:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="BOM item not found")
        db.delete(bom)
        db.commit()
        return None
    except SQLAlchemyError:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete BOM entry")