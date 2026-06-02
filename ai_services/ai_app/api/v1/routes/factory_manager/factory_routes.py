from fastapi import APIRouter
from ai_app.tools.factory_manager.production_doc import generate_production_doc


router = APIRouter(prefix="/factory", tags=["Factory Manager - AI Tools"])

@router.post("/generate-production-doc")
def generate_doc(payload: dict):
    if not payload.get("production_name") or not payload.get("target_qty") or not payload.get("output_qty"):
        return {"status": "error", "message": "Production data is missing or incomplete..."}
    result = generate_production_doc(payload)
    return result