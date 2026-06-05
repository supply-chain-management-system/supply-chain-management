

from fastapi import APIRouter,Depends,HTTPException
from app.schemas.sub_managers.factory_manager.production import productget,production_create,production_update,production_complete

from sqlalchemy.orm  import session


from app.db.deps import get_db,get_tenant_db
from app.models.sub_managers.factory_manager.production import Production, Factory
from app.models.auth.user import User
from app.services.ai.task import generate_production_doc_task
from app.services.auth.dependancy import get_current_user
from fastapi import Request

router = APIRouter(prefix='/factory', tags=['factory'])


@router.post('/product_create')
def create_product(
    data: production_create, 
    db: session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user)
):

    print('hai aim ansil cre')
    new_product = Production(
        product_name=data.product_name,
        target_qty=data.target_qty,
        factory_id=data.factory_id,
        created_by=current_user.id,
        priority=data.priority,
        notes=data.notes
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
    factories = db.query(Factory).all()
    if not factories:
        default_factory = Factory(name="Main Factory Sector B")
        db.add(default_factory)
        db.commit()
        db.refresh(default_factory)
        factories = [default_factory]
    return factories



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
    product.scrap_qty = data.scrap_qty
    product.notes = data.notes
    product.status = "completed"

    # Auto-transfer completed production quantity to warehouse inventory
    try:
        from app.models.sub_managers.warehouse_manager.warehouse import Product as WhProduct, Rack, Inventory_ware, Warehouse
        
        # 1. Resolve or create Product in warehouse domain
        wh_product = db.query(WhProduct).filter(WhProduct.name == product.product_name).first()
        if not wh_product:
            import uuid
            sku = f"SKU-{uuid.uuid4().hex[:6].upper()}"
            wh_product = WhProduct(name=product.product_name, sku=sku)
            db.add(wh_product)
            db.flush()
            
        # 2. Resolve or create default Warehouse & Rack
        wh = db.query(Warehouse).first()
        if not wh:
            wh = Warehouse(name="Korvex Main Warehouse", location="Default")
            db.add(wh)
            db.flush()
            
        rack = db.query(Rack).filter(Rack.warehouse_id == wh.id).first()
        if not rack:
            rack = Rack(name="Rack A1", warehouse_id=wh.id)
            db.add(rack)
            db.flush()
            
        # 3. Update or create inventory
        inventory = db.query(Inventory_ware).filter(
            Inventory_ware.product_id == wh_product.id,
            Inventory_ware.rack_id == rack.id
        ).first()
        if not inventory:
            inventory = Inventory_ware(
                product_id=wh_product.id,
                rack_id=rack.id,
                quantity=0
            )
            db.add(inventory)
            db.flush()
            
        inventory.quantity += data.output_qty
        print(f"Auto-transferred {data.output_qty} of '{product.product_name}' to Warehouse inventory.")
        
        # 4. Auto-consume raw materials based on BOM recipe
        from app.models.sub_managers.warehouse_manager.warehouse import BillOfMaterials
        from app.models.sub_managers.factory_manager.factory_material import Factory_Material, Factory_MaterialTransaction
        
        boms = db.query(BillOfMaterials).filter(BillOfMaterials.finished_product_id == wh_product.id).all()
        for bom in boms:
            mat_product = db.query(WhProduct).filter(WhProduct.id == bom.material_product_id).first()
            if mat_product:
                fm_material = db.query(Factory_Material).filter(Factory_Material.name == mat_product.name).first()
                if fm_material:
                    consumed_qty = data.output_qty * bom.quantity_required
                    fm_material.current_stock = max(0.0, fm_material.current_stock - consumed_qty)
                    
                    # Log consumption transaction
                    from datetime import datetime
                    tx = Factory_MaterialTransaction(
                        material_id=fm_material.id,
                        transaction_type="PRODUCTION_DISPATCH",
                        quantity=consumed_qty,
                        production_id=product.id,
                        timestamp=datetime.utcnow()
                    )
                    db.add(tx)
                    db.flush()
                    print(f"BOM Consumption: Deducted {consumed_qty} of '{fm_material.name}' from Factory stock.")
    except Exception as ie:
        print(f"Error auto-transferring completed production output to warehouse inventory: {str(ie)}")

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


@router.delete('/products/{product_id}', status_code=204)
def delete_product_job(product_id: int, db: session = Depends(get_tenant_db)):
    product = db.query(Production).filter(Production.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Production job not found")
    try:
        from app.models.sub_managers.factory_manager.teams import Productionteam
        db.query(Productionteam).filter(Productionteam.production_id == product_id).delete()
        
        db.delete(product)
        db.commit()
        return None
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Database error: {str(e)}")