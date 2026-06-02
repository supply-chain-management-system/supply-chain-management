

from fastapi import APIRouter,Depends,HTTPException
from app.schemas.sub_managers.factory_manager.production import productget,production_create,production_update,production_complete

from sqlalchemy.orm  import session


from app.db.deps import get_db,get_tenant_db
from app.models.sub_managers.factory_manager.production import Production
from app.models.auth.user import User
from app.services.ai.task import generate_production_doc_task
from fastapi import Request

router = APIRouter(prefix='/factory', tags=['factory'])


@router.post('/product_create')
def create_product(data: production_create, db: session = Depends(get_tenant_db)):

    print('hai aim ansil cre')
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
def update_product(product_id: int, data: production_update, db: session = Depends(get_tenant_db)):
    print('hai yu updare')
    product = db.query(Production).filter(Production.id == product_id).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")


    update_data = data.model_dump(exclude_unset=True) 
    for key, value in update_data.items():
        setattr(product, key, value)

    db.commit()
    db.refresh(product)

    return {
        "message": "Product updated successfully",
        "data": product
    }

@router.patch('/products/{product_id}/complete')
def complete_product(product_id: int,data: production_complete,request: Request,db: session = Depends(get_tenant_db)):
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

    product.output_qty = data.output_qty
    product.status = "completed"

    db.commit()
    db.refresh(product)

    generate_production_doc_task.delay(product_id,schema_name)

    return {
        "message": "Production completed successfully",
        "data": product
    }

@router.get('/productall/doc')
def get_product_doc(db: session = Depends(get_tenant_db)):
    produdt=db.query(Production).filter(Production.doc != None).all()
    return produdt      