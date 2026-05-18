from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.db.deps import get_tenant_db


router = APIRouter(prefix='/factory', tags=['factory et pipelines'])
@router.get("/production-report")
def get_production_report(db: Session = Depends(get_tenant_db)):
  
    query = "SELECT * FROM production_report ORDER BY production_date DESC"
    
    result = db.execute(query)
    
   
    return [dict(row) for row in result.mappings()]