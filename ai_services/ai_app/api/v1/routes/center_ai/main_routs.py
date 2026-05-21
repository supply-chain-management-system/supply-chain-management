from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage

# 📥 IMPORT THE COMPILED MASTER AGENT FROM FILE 2
from ai_app.workflows.center_ai.agent import agent_executor

router = APIRouter()

class CentralChatRequest(BaseModel):
    user_input: str
    tenant_schema: str  
    user_role: str      

@router.post("/copilot/chat/{session_id}")
async def chat_with_central_agent(session_id: str, request: CentralChatRequest):
    # Pack the incoming multi-tenant payload parameters into the passport configuration
    config = {
        "configurable": {
            "thread_id": session_id,
            "tenant_schema": request.tenant_schema, 
            "user_role": request.user_role          
        }
    }
    
    input_data = {"messages": [HumanMessage(content=request.user_input)]}
    
    try:
        response = await agent_executor.ainvoke(input_data, config=config)
        return {"reply": response["messages"][-1].content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Central Agent Error: {str(e)}")