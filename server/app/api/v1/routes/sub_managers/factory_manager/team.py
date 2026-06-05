from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.deps import get_db,get_tenant_db

from app.schemas.sub_managers.factory_manager.factory_team import (
    worker_create,
    team_create,
    get_worker,
    worker_update,
)
from app.models.sub_managers.factory_manager.teams import Worker, Productionteam
from app.models.sub_managers.factory_manager.production import Production
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError


from collections import defaultdict

router = APIRouter(prefix='/factory', tags=['factory'])


@router.post('/create_worker')

def create_worker(data: worker_create, db: Session = Depends(get_tenant_db)):

    work=Worker(
        name=data.name,
        role=data.role,
        factory_id=data.factory_id,
        email=data.email,
        phone=data.phone,
        hourly_rate=data.hourly_rate
    )






    db.add(work)
    db.commit()
    db.refresh(work)
    return {'message': 'worker create succesfully', 'data': work}


@router.get('/get_worker', response_model=list[get_worker])
def get_available_workers(db: Session = Depends(get_tenant_db)):  
    assigned_worker_ids = db.query(Productionteam.worker_id).subquery()

  
    workers = db.query(Worker).filter(Worker.id.not_in(assigned_worker_ids)).all()

    print('Available workers:', workers)
    return workers


@router.post("/assign_team")
def assign_team(data: team_create, db: Session = Depends(get_tenant_db)):
    print('hai ak',data.production_id)

    production = (
        db.query(Production).filter(Production.id == data.production_id).first()
    )

    if not production:
        raise HTTPException(status_code=404, detail="production not found")

    assigned_members = []

    for worker_id in data.workers:

        worker = db.query(Worker).filter(Worker.id == worker_id).first()

        if not worker:
            raise HTTPException(status_code=404, detail=f"worker {worker_id} not found")

        existing = (
            db.query(Productionteam)
            .filter(
                Productionteam.production_id == data.production_id,
                Productionteam.worker_id == worker_id,
            )
            .first()
        )

        if existing:
            continue

        team_member = Productionteam(
            production_id=data.production_id, worker_id=worker_id, role=worker.role
        )

        db.add(team_member)
        assigned_members.append(worker_id)

    db.commit()

    return {
        "message": "team assigned successfully",
        "assigned_workers": assigned_members,
    }


@router.get("/all_team")
def get_all_production_teams(db: Session = Depends(get_tenant_db)):
  
    results = (
        db.query(
            Productionteam.id,
            Productionteam.production_id,
            Worker.name,
            Productionteam.role,
            Productionteam.worker_id,
            Worker.status,
            Worker.hourly_rate,
            Worker.email,
            Worker.phone
        )
        .join(Worker, Worker.id == Productionteam.worker_id)
        .order_by(Productionteam.production_id)
        .all()
    )
    print('results ansil', results)

    grouped = defaultdict(list)
    for row in results:
        
        grouped[row.production_id].append({
            "id": row.id,
            "name": row.name,
            "role": row.role,
            "worker_id": row.worker_id,
            'status': row.status,
            'hourly_rate': row.hourly_rate,
            'email': row.email,
            'phone': row.phone,
        })

    return grouped


@router.get('/find_wroker')
def worker_search(search: str = '', db: Session = Depends(get_tenant_db)):
    print('je', search)
    query = db.query(Worker)
    if search:
        query = query.filter(Worker.name.ilike(f"%{search}%"))
    print('seagc', query.all())
    return query.all()


@router.delete('/removemember/{mem_id}')
def remove_teammember(mem_id: int, db: Session = Depends(get_tenant_db)):
    print('deleie id', mem_id)
    try:
        query = db.query(Productionteam).filter(Productionteam.id == mem_id)
        print('jaoa')
        member = query.first()
        if not member:
            raise HTTPException(status_code=404, detail="worker not found")
        query.delete()
        db.commit()
        return {'message': 'worker remove succesfully'}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="database error while delete")


@router.delete('/delete_worker/{worker_id}')
def delete_worker(worker_id: int, db: Session = Depends(get_tenant_db)):
    try:
        # First remove from any production team to satisfy foreign keys
        db.query(Productionteam).filter(Productionteam.worker_id == worker_id).delete()
        
        # Then remove the worker
        worker = db.query(Worker).filter(Worker.id == worker_id).first()
        if not worker:
            raise HTTPException(status_code=404, detail="Worker not found")
        db.delete(worker)
        db.commit()
        return {'message': 'Worker deleted successfully'}
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while deleting worker")


@router.put('/update_worker/{worker_id}', response_model=get_worker)
def update_worker(worker_id: int, data: worker_update, db: Session = Depends(get_tenant_db)):
    worker = db.query(Worker).filter(Worker.id == worker_id).first()
    if not worker:
        raise HTTPException(status_code=404, detail="Worker not found")
    try:
        update_data = data.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(worker, key, value)
        db.commit()
        db.refresh(worker)
        return worker
    except SQLAlchemyError as e:
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error while updating worker")



