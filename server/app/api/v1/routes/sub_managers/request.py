from fastapi import APIRouter, Depends,HTTPException,status
from sqlalchemy.orm import Session
<<<<<<< HEAD
from typing import List
from app.db.deps import get_db,get_tenant_db
=======
from app.db.deps import get_tenant_db
>>>>>>> development
from app.models.sub_managers.request import MaterialRequest
from app.models.sub_managers.factory_manager.production import Factory

from app.schemas.sub_managers.request import (
    MaterialRequestCreate,
    MaterialRequestOut,
    
)

router = APIRouter()


<<<<<<< HEAD
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
=======
@router.post("/request", response_model=MaterialRequestOut)
def create_material_request(
    data: MaterialRequestCreate,
    db: Session = Depends(get_tenant_db),
):
>>>>>>> development

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


<<<<<<< HEAD
=======
@router.get("/request", response_model=list[MaterialRequestOut])
def get_material_requests(
    db: Session = Depends(get_tenant_db)
):
    return db.query(MaterialRequest).all()

@router.get("/Factory_deatils" )

def get_comapny(db:Session=Depends(get_tenant_db)):
    return db.query(Factory).all()

>>>>>>> development

@router.get("/factory_details", status_code=status.HTTP_200_OK)
def get_factory_info(db: Session = Depends(get_tenant_db)):
    try:
        factories = db.query(Factory).all()
        return factories
    except SQLAlchemyError:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, 
            detail="Failed to retrieve factory data"
        )







