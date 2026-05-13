

from fastapi import APIRouter,Depends,HTTPException
from app.schemas.sub_managers.factory_manager.production import productget,production_create,production_update

from sqlalchemy.orm  import session


from app.db.deps import get_db,get_tenant_db
from app.models.sub_managers.factory_manager.production import Production
from app.models.auth.user import User
from app.services.ai.task import generate_production_doc_task
from fastapi import Request

router = APIRouter(prefix='/factory', tags=['factory'])


@router.post('/product_create')
def create_product(data: production_create, db: session = Depends(get_tenant_db)):
    new_product = Production(
        product_name=data.product_name,
        target_qty=data.target_qty,
        factory_id=data.factory_id,
       

    )

    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return {'message': 'product creates succefully', 'data': new_product}


@router.get('/products', response_model=list[productget])
def get_product(db: session = Depends(get_tenant_db)):
    products = db.query(Production).all()
    print(products,'haao')
    return products


@router.get('/user')
def get_user(db: session = Depends(get_tenant_db)):
    user = db.query(User).filter(User.role == 'factory_manager').all()
    return user




@router.put('/products/{product_id}')
def update_product(product_id: int,data: production_create,db: session = Depends(get_tenant_db)):
    product = db.query(Production).filter(
        Production.id == product_id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    product.product_name = data.product_name
    product.target_qty = data.target_qty
    product.factory_id = data.factory_id
    product.created_by = data.created_by

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully",
        "data": product
    }


@router.patch('/products/{product_id}/complete')
def complete_product(product_id: int,request: Request,db: session = Depends(get_tenant_db)):
    product = db.query(Production).filter(
        Production.id == product_id
    ).first()
    schema_name = getattr(request.state, "schema", "public")
    print(schema_name,'schema_name')  

    if not product:
        raise HTTPException(
            status_code=404,
            detail="Product not found"
        )

    product.status = "completed"

    db.commit()
    db.refresh(product)

    generate_production_doc_task.delay(product_id,schema_name)

    return {
        "message": "Production completed successfully",
        "data": product
    }