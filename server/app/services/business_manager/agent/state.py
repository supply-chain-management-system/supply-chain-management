from typing import Annotated, Sequence, TypedDict
from langchain_core.messages import BaseMessage
from langgraph.graph.message import add_messages

class AgentState(TypedDict):
    # 'add_messages' ensures new messages are appended to the history, not overwritten
    messages: Annotated[Sequence[BaseMessage], add_messages]
    user_id: int