from sqlalchemy.orm import Session
from datetime import datetime
from fastapi import HTTPException
from app.models.sub_managers.factory_manager.factory_material import Factory_Material, Factory_MaterialTransaction
from app.schemas.sub_managers.factory_manager.factory_material import FactoryMaterialCreate, FactoryMaterialUpdate, FactoryMaterialTransactionCreate

def get_materials(db: Session, skip: int = 0, limit: int = 100):
    return db.query(Factory_Material).offset(skip).limit(limit).all()

def get_material(db: Session, material_id: int):
    return db.query(Factory_Material).filter(Factory_Material.id == material_id).first()

def create_material(db: Session, material: FactoryMaterialCreate):
    db_material = Factory_Material(
        name=material.name,
        unit=material.unit,
        low_stock_threshold=material.low_stock_threshold,
        current_stock=material.current_stock
    )
    db.add(db_material)
    db.commit()
    db.refresh(db_material)
    return db_material

def update_material(db: Session, material_id: int, material: FactoryMaterialUpdate):
    db_material = get_material(db, material_id)
    if not db_material:
        return None
    
    update_data = material.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_material, key, value)
        
    db.commit()
    db.refresh(db_material)
    return db_material

def delete_material(db: Session, material_id: int):
    db_material = get_material(db, material_id)
    if not db_material:
        return None
    db.delete(db_material)
    db.commit()
    return db_material

def create_transaction(db: Session, material_id: int, transaction: FactoryMaterialTransactionCreate):
    db_material = get_material(db, material_id)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
        
    if transaction.transaction_type == "RESTOCK":
        db_material.current_stock += transaction.quantity
        db_material.last_restocked = datetime.utcnow()
    elif transaction.transaction_type == "PRODUCTION_DISPATCH":
        if db_material.current_stock < transaction.quantity:
            raise HTTPException(
                status_code=400, 
                detail=f"Insufficient stock for material '{db_material.name}'. Current stock: {db_material.current_stock} {db_material.unit}, requested: {transaction.quantity} {db_material.unit}."
            )
        db_material.current_stock -= transaction.quantity
        
    db_transaction = Factory_MaterialTransaction(
        material_id=material_id,
        transaction_type=transaction.transaction_type.value if hasattr(transaction.transaction_type, 'value') else transaction.transaction_type,
        quantity=transaction.quantity,
        production_id=transaction.production_id,
        timestamp=datetime.utcnow()
    )
    
    db.add(db_transaction)
    db.commit()
    db.refresh(db_transaction)
    return db_transaction
