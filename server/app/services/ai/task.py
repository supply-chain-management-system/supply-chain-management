from app.core.celery import celery_app
from app.services.ai.documentation_service import generate_production_doc_task_logic


@celery_app.task(name="app.services.ai.documentation_service.generate_production_doc_task")
def generate_production_doc_task(production_id: int,schema_name: str):
    return generate_production_doc_task_logic(production_id,schema_name)