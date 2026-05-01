from fastapi import APIRouter,Depends
from app.schemas.factory_manager.production import production_create
from sqlalchemy.orm  import session
from app.api.deps import get_db
from app.models.factory_manager.production import Production


router=APIRouter(prefix='/factory' ,tags='factory')

@router.post('/product_create')

def create_product(data:production_create,db:session=Depends(get_db)):
    new_product=Production(
        product_name=data.product_name,
        target_qty=data.target_qty,
        factory_id=data.factory_id,
        created_by=data.created_by


    )

    db.add(new_product) 
    db.commit()
    db.refresh(new_product)
    return{
        'message':'product creates succefully',
        'data':new_product
    }
