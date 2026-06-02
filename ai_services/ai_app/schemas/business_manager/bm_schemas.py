from pydantic import BaseModel
from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

# --- API Request/Response Schemas ---
class CommandRequest(BaseModel):
    prompt: str
    user_id: int = 1

class CommandResponse(BaseModel):
    response: str

# --- LangGraph State ---
class AgentState(TypedDict):
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int