from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from langchain_core.messages import HumanMessage, SystemMessage

from app.services.business_manager.agent.graph import korvex_copilot

router = APIRouter(
    prefix="/business-manager/copilot",
    tags=["Korvex AI Co-Pilot"]
)

class CommandRequest(BaseModel):
    prompt: str
    user_id: int = 1 # Hardcoded MVP context

class CommandResponse(BaseModel):
    response: str

@router.post("/command", response_model=CommandResponse)
async def handle_command(request: CommandRequest):
    try:
        # 1. Give the AI context about who is talking to it
        system_msg = SystemMessage(
            content=f"""You are the Korvex Copilot, an expert supply chain AI. The current user ID is {request.user_id}.
            
            CRITICAL INSTRUCTIONS:
            1. If asked to check inventory, use the tool. If asked to dispatch an alert, use the tool.
            2. Once you receive the data from a tool, DO NOT call that same tool again.
            3. After your tools have run, immediately reply to the user with a final summary and STOP."""
        )
        user_msg = HumanMessage(content=request.prompt)

        # 2. Run the LangGraph with a KILL SWITCH
        result = korvex_copilot.invoke(
            {
                "messages": [system_msg, user_msg], 
                "user_id": request.user_id
            },
            config={"recursion_limit": 7} # <-- This prevents infinite tool-calling loops!
        )

        # 3. Extract the final text response from the graph's message history
        final_text = result["messages"][-1].content
        
        return CommandResponse(response=final_text)
        
    except Exception as e:
        error_msg = str(e).lower()
        print(f"🚨 Agent Error Caught: {error_msg}")
        
        # 4. Enterprise Error Handling: Catch the crash and return a polite UI message
        if "rate limit" in error_msg or "429" in error_msg or "tokens" in error_msg:
            fallback_text = "I am currently experiencing unusually high traffic and my backup circuits are resting. Please give me a minute or two to cool down before trying again!"
        elif "recursion" in error_msg:
            fallback_text = "I had to abort that request because it was taking too many steps to calculate. Could you try asking me in a simpler way?"
        else:
            fallback_text = "I encountered an unexpected glitch in my system while trying to process that. Please try your request again."
            
        # We return a 200 OK with the fallback text so the React UI stays perfectly stable
        return CommandResponse(response=fallback_text)