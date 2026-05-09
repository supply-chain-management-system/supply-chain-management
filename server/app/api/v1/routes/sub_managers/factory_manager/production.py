from fastapi import APIRouter,Depends
from app.schemas.sub_managers.factory_manager.production import production_create,productget

from sqlalchemy.orm  import session

from app.db.deps import get_db
from app.models.sub_managers.factory_manager.production import Production
from app.models.auth.user import User

router = APIRouter(prefix='/factory', tags=['factory'])


@router.post('/product_create')
def create_product(data: production_create, db: session = Depends(get_db)):
    new_product = Production(
        product_name=data.product_name,
        target_qty=data.target_qty,
        factory_id=data.factory_id,
        created_by=data.created_by

    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {'message': 'product creates succefully', 'data': new_product}


@router.get('/products', response_model=list[productget])
def get_product(db: session = Depends(get_db)):
    products = db.query(Production).all()
    return products


@router.get('/user')
def get_user(db: session = Depends(get_db)):
    user = db.query(User).filter(User.role == 'factory_manager').all()
    return user
