from fastapi import APIRouter,HTTPException
from ai_app.workflows.warehouse_manager.agent import agent_executor
from langchain_core.messages import HumanMessage # Import this
from pydantic import BaseModel

router = APIRouter()

class ChatRequest(BaseModel):
    user_input: str

@router.post("/chat/{session_id}")
async def chat_with_agent(session_id: str, request: ChatRequest):
    config = {"configurable": {"thread_id": session_id}}
    input_data = {"messages": [HumanMessage(content=request.user_input)]}
    
    try:
        response = agent_executor.invoke(input_data, config=config)
        return {"reply": response["messages"][-1].content}
    except Exception as e:
        print(f"TRACELOG ERROR: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent Error: {str(e)}")

@router.get("/chat/{session_id}")
async def get_chat_history(session_id: str):
    config = {"configurable": {"thread_id": session_id}}
    state = agent_executor.get_state(config)
    
    if not state or not state.values.get("messages"):
        return {"messages": []}
    
    
    formatted_messages = []
    for msg in state.values["messages"]:
        formatted_messages.append({
            "type": msg.type,
            "content": msg.content
        })
    
    return {"messages": formatted_messages}