from fastapi import APIRouter
from langchain_core.messages import HumanMessage, SystemMessage


from ai_app.schemas.business_manager.bm_schemas import CommandRequest, CommandResponse
from ai_app.workflows.business_manager.bm_graph import korvex_copilot

router = APIRouter(prefix="/business-manager/copilot", tags=["BM — AI Copilot"])

@router.post("/command", response_model=CommandResponse)
async def handle_command(request: CommandRequest):
    try:
        system_msg = SystemMessage(
            content=f"You are the Korvex Copilot, an expert supply chain AI. User ID is {request.user_id}.\n1. If asked to check inventory/dispatch alert, use tools.\n2. Do NOT call the same tool twice.\n3. Reply with final summary and STOP."
        )
        user_msg = HumanMessage(content=request.prompt)

        result = korvex_copilot.invoke(
            {"messages": [system_msg, user_msg], "user_id": request.user_id},
            config={"recursion_limit": 7}
        )
        return CommandResponse(response=result["messages"][-1].content)
        
    except Exception as e:
        error_msg = str(e).lower()
        if "rate limit" in error_msg or "429" in error_msg or "tokens" in error_msg:
            fallback = "I am currently experiencing unusually high traffic. Please give me a minute to cool down!"
        elif "recursion" in error_msg:
            fallback = "I had to abort that request (too many steps). Could you ask simpler?"
        else:
            fallback = "I encountered an unexpected glitch in my system. Please try again."
        return CommandResponse(response=fallback)