from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ai_app.core.celery_config import ai_celery_app  # 🚀 Import the celery client instead!

router = APIRouter()

class CentralChatRequest(BaseModel):
    user_input: str
    tenant_schema: str  
    user_role: str      

@router.post("/copilot/chat/{session_id}")
async def chat_with_central_agent(session_id: str, request: CentralChatRequest):
    try:
        # 🎯 BYPASS CIRCULAR IMPORTS: Call the task strictly by its unique string namespace!
        task = ai_celery_app.send_task(
            "ai_app.tasks.run_central_agent",
            kwargs={
                "user_input": request.user_input,
                "session_id": session_id,
                "tenant_schema": request.tenant_schema,
                "user_role": request.user_role
            }
        )
        
        # Return immediate feedback parameters to Swagger UI
        return {
            "status": "queued",
            "task_id": task.id,
            "message": "The AI agent has started processing in the background."
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to queue agent task: {str(e)}")