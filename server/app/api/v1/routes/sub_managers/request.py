from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from typing import List

from app.db.deps import get_db, get_tenant_db
from app.models.sub_managers.request import MaterialRequest
from app.models.sub_managers.factory_manager.production import Factory
from app.schemas.sub_managers.request import (
    MaterialRequestCreate,
    MaterialRequestOut,
)

router = APIRouter()


@router.post("/request", response_model=MaterialRequestOut, status_code=status.HTTP_201_CREATED)
def create_material_request(data: MaterialRequestCreate, db: Session = Depends(get_tenant_db)):
    try:
        new_request = MaterialRequest(
            product_id=data.product_id,
            sender_type=data.sender_type,
            sender_id=data.sender_id,
            receiver_type=data.receiver_type,
            receiver_id=data.receiver_id,
            quantity=data.quantity,
        )
        db.add(new_request)
        db.commit()
        db.refresh(new_request)
        return new_request
    except SQLAlchemyError as e:
        db.rollback()
        print(f"Error creating request: {str(e)}") 
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to create material request"
        )


@router.get("/request", response_model=List[MaterialRequestOut], status_code=status.HTTP_200_OK)
def get_material_requests(db: Session = Depends(get_tenant_db)):
    try:
        return db.query(MaterialRequest).all()
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Error fetching requests"
        )


@router.get("/factory_details", status_code=status.HTTP_200_OK)
def get_factory_info(db: Session = Depends(get_tenant_db)):
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


@router.patch("/request/{request_id}/status", response_model=MaterialRequestOut, status_code=status.HTTP_200_OK)
def update_material_request_status(request_id: int, request_status: str, db: Session = Depends(get_tenant_db)):
    try:
        req = db.query(MaterialRequest).filter(MaterialRequest.id == request_id).first()
        if not req:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Request not found")
        
        old_status = req.status
        req.status = request_status.lower()
        
        # If transitioning to approved, perform the physical stock transfer
        if req.status == "approved" and old_status != "approved":
            from app.models.sub_managers.warehouse_manager.warehouse import Product, Inventory_ware
            from app.models.sub_managers.factory_manager.factory_material import Factory_Material
            
            # Resolve product
            product = db.query(Product).filter(Product.id == req.product_id).first()
            if not product:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Product not found")
                
            # 1. Decrement Warehouse Inventory
            inventory = db.query(Inventory_ware).filter(
                Inventory_ware.product_id == product.id
            ).first()
            
            if not inventory or inventory.quantity < req.quantity:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Insufficient stock in warehouse for product '{product.name}'. Available: {inventory.quantity if inventory else 0}, requested: {req.quantity}"
                )
                
            inventory.quantity -= req.quantity
            
            # 2. Increment Factory Material Inventory
            fm_material = db.query(Factory_Material).filter(Factory_Material.name == product.name).first()
            if not fm_material:
                fm_material = Factory_Material(
                    name=product.name,
                    current_stock=0.0,
                    unit="units",
                    low_stock_threshold=10.0
                )
                db.add(fm_material)
                db.flush()
                
            fm_material.current_stock += req.quantity
            print(f"Material Dispatch Approved: Transferred {req.quantity} of '{product.name}' from Warehouse to Factory.")
            
        db.commit()
        db.refresh(req)
        return req
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update request: {str(e)}"
        )