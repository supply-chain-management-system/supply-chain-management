import os
import contextlib
from langgraph.checkpoint.mongodb import MongoDBSaver 
from langgraph.prebuilt import create_react_agent

# --- LLM Provider Integrations & Custom Tools ---
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_cohere import ChatCohere
from ai_app.tools.warehouse_manager.tools import get_stock_level

# 1. Grab your environment URL string
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
tools = [get_stock_level]

# 2. Prompt & 3. Base Models
AI_SYSTEM_PROMPT = (
    "You are a precise warehouse operations assistant.\n"
    "CRITICAL: When calling tools, you MUST output perfectly valid, well-formed JSON arguments."
)

groq_model = ChatGroq(model="llama-3.3-70b-versatile")
openai_model = ChatOpenAI(model="gpt-4o-mini")
cohere_model = ChatCohere(model="command-r-plus")

# 4. Inject system prompts & 5. Bind tools
groq_model = groq_model.bind(system_prompt=AI_SYSTEM_PROMPT)
openai_model = openai_model.bind(system_prompt=AI_SYSTEM_PROMPT)

groq_with_tools = groq_model.bind_tools(tools)
openai_with_tools = openai_model.bind_tools(tools)
cohere_with_tools = cohere_model.bind_tools(tools)

# 6. Multi-provider fallback sequence
smart_llm_chain = groq_with_tools.with_fallbacks([
    openai_with_tools,
    cohere_with_tools
])

# 7. Use ExitStack to properly unpack the Mongo Context Manager globally
# This unpacks the _GeneratorContextManager safely so your app stays online!
_stack = contextlib.ExitStack()
memory = _stack.enter_context(MongoDBSaver.from_conn_string(MONGO_URL, db_name="korvex_ai_db"))

# 8. Spin up the agent executor using our cleanly extracted MongoDB Checkpointer
agent_executor = create_react_agent(
    model=smart_llm_chain,
    tools=tools,
    checkpointer=memory # <--- Receives the valid instance now!
)