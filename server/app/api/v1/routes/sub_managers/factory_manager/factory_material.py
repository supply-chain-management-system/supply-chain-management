from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.deps import get_tenant_db
from app.schemas.sub_managers.factory_manager.factory_material import (
    FactoryMaterialCreate,
    FactoryMaterialResponse,
    FactoryMaterialUpdate,
    FactoryMaterialDetailResponse,
    FactoryMaterialTransactionCreate,
    FactoryMaterialTransactionResponse,
)
from app.services.sub_managers.factory_manager import factory_material as fm_service
from app.models.sub_managers.factory_manager.factory_material import Factory_MaterialTransaction

router = APIRouter(prefix="/materials", tags=["Factory Materials"])

@router.post("/", response_model=FactoryMaterialResponse)
def create_material(material: FactoryMaterialCreate, db: Session = Depends(get_tenant_db)):
    return fm_service.create_material(db, material)

@router.get("/", response_model=list[FactoryMaterialResponse])
def get_materials(skip: int = 0, limit: int = 100, db: Session = Depends(get_tenant_db)):
    return fm_service.get_materials(db, skip, limit)

@router.get("/transactions/all", response_model=list[FactoryMaterialTransactionResponse])
def get_all_transactions(skip: int = 0, limit: int = 100, db: Session = Depends(get_tenant_db)):
    return db.query(Factory_MaterialTransaction).order_by(Factory_MaterialTransaction.timestamp.desc()).offset(skip).limit(limit).all()

@router.get("/{material_id}", response_model=FactoryMaterialDetailResponse)
def get_material(material_id: int, db: Session = Depends(get_tenant_db)):
    db_material = fm_service.get_material(db, material_id)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_material

@router.put("/{material_id}", response_model=FactoryMaterialResponse)
def update_material(material_id: int, material: FactoryMaterialUpdate, db: Session = Depends(get_tenant_db)):
    db_material = fm_service.update_material(db, material_id, material)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return db_material

@router.delete("/{material_id}")
def delete_material(material_id: int, db: Session = Depends(get_tenant_db)):
    db_material = fm_service.delete_material(db, material_id)
    if not db_material:
        raise HTTPException(status_code=404, detail="Material not found")
    return {"message": "Material deleted successfully"}

@router.post("/{material_id}/transaction", response_model=FactoryMaterialTransactionResponse)
def create_transaction(
    material_id: int,
    transaction: FactoryMaterialTransactionCreate,
    db: Session = Depends(get_tenant_db)
):
    return fm_service.create_transaction(db, material_id, transaction)
