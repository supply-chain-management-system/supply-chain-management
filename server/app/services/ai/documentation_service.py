import requests
from app.db.database import SessionLocal
from app.models.sub_managers.factory_manager.production import Production
from sqlalchemy import text

AI_SERVICE_URL = "http://ai_service:8001/api/v1/factory/generate-production-doc"

def generate_production_doc_task_logic(production_id: int,schema_name: str):
    db = SessionLocal()
    try:
        if schema_name:
   
            db.execute(text(f"SET search_path TO {schema_name}, public"))
            

        production = db.query(Production).filter(Production.id == production_id).first()
        if not production:
            return "production not found"

        data = {
            "production_id": production.id,
            "production_name": production.product_name,
            "target_qty": production.target_qty,
            "output_qty": production.output_qty,
            "factory_id": production.factory_id,
            "created_at": str(production.created_at),
            
        }

  

        print(f"DEBUG: Sending data to AI service: {data}") 

        response = requests.post(AI_SERVICE_URL, json=data)
        result = response.json()
        
       
        if response.status_code == 200 and result.get("status") == "success":
            production.doc = result["report"]
            db.commit()
            return "success"
        else:
            error_detail = result.get("message", "Unknown error")
            print(f"DEBUG: AI Service failed with message: {error_detail}")
            return f"failed: {error_detail}"
    finally:
        db.close()