import requests
from app.db.database import SessionLocal
from app.models.sub_managers.factory_manager.production import Production
from sqlalchemy import text

import os
AI_SERVICE_URL = os.getenv("AI_SERVICE_URL", "http://ai-service:8001").rstrip("/") + "/api/v1/factory/generate-production-doc"

def generate_production_doc_task_logic(production_id: int,schema_name: str):
    db = SessionLocal()
    try:
        if schema_name:
            db.execute(text(f"SET search_path TO {schema_name}, public"))

        production = db.query(Production).filter(Production.id == production_id).first()
        if not production:
            return "production not found"

        # Fetch team members
        from app.models.sub_managers.factory_manager.teams import Productionteam, Worker
        team_members = db.query(Productionteam, Worker).join(
            Worker, Worker.id == Productionteam.worker_id
        ).filter(Productionteam.production_id == production_id).all()
        team_data = [
            {"name": w.name, "role": pt.role.value if hasattr(pt.role, 'value') else pt.role}
            for pt, w in team_members
        ]

        # Fetch assigned machinery
        from app.models.sub_managers.factory_manager.factory_machinery import MachineAssignment, Machine
        machinery = db.query(MachineAssignment, Machine).join(
            Machine, Machine.id == MachineAssignment.machine_id
        ).filter(MachineAssignment.production_id == production_id).all()
        machinery_data = [
            {
                "machine_code": m.machine_code,
                "name": m.name,
                "efficiency": m.efficiency,
                "location": m.location
            }
            for ma, m in machinery
        ]

        # Fetch materials consumed
        from app.models.sub_managers.factory_manager.factory_material import Factory_MaterialTransaction, Factory_Material
        materials = db.query(Factory_MaterialTransaction, Factory_Material).join(
            Factory_Material, Factory_Material.id == Factory_MaterialTransaction.material_id
        ).filter(Factory_MaterialTransaction.production_id == production_id).all()
        materials_data = [
            {"material_name": fm.name, "quantity": fmt.quantity, "unit": fm.unit}
            for fmt, fm in materials
        ]

        data = {
            "production_id": production.id,
            "production_name": production.product_name,
            "target_qty": production.target_qty,
            "output_qty": production.output_qty,
            "scrap_qty": production.scrap_qty,
            "priority": production.priority,
            "notes": production.notes,
            "factory_id": production.factory_id,
            "created_at": str(production.created_at),
            "assigned_team": team_data,
            "assigned_machinery": machinery_data,
            "consumed_materials": materials_data
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