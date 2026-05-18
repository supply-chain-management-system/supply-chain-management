from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver

# --- LLM Provider Integrations ---
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_cohere import ChatCohere

# --- Your Custom Tools File ---
from ai_app.tools.warehouse_manager.tools import get_stock_level

# 1. Initialize memory and tools
memory = MemorySaver()
tools = [get_stock_level]

# 2. Define the strict tool instruction prompt text
AI_SYSTEM_PROMPT = (
    "You are a precise warehouse operations assistant.\n"
    "CRITICAL: When calling tools, you MUST output perfectly valid, well-formed JSON arguments.\n"
    "Ensure all parameter strings are closed properly and brackets are balanced. "
    "Double check your tool call syntax before executing."
)

# 3. Initialize base models
groq_model = ChatGroq(model="llama-3.3-70b-versatile")
openai_model = ChatOpenAI(model="gpt-4o-mini")
cohere_model = ChatCohere(model="command-r-plus")

# 4. Inject the system prompt instructions directly into the models natively
# This modifies the underlying model behavior directly, bypassing LangGraph configuration layers
groq_model = groq_model.bind(system_prompt=AI_SYSTEM_PROMPT)
openai_model = openai_model.bind(system_prompt=AI_SYSTEM_PROMPT)

# 5. Bind your database tool execution configurations
groq_with_tools = groq_model.bind_tools(tools)
openai_with_tools = openai_model.bind_tools(tools)
cohere_with_tools = cohere_model.bind_tools(tools)

# 6. Assemble the resilient multi-provider fallback sequence
smart_llm_chain = groq_with_tools.with_fallbacks([
    openai_with_tools,
    cohere_with_tools
])

# 7. Spin up the agent executor cleanly
# Removed state_modifier / messages_modifier entirely so it CANNOT throw a TypeError
agent_executor = create_react_agent(
    model=smart_llm_chain,
    tools=tools,
    checkpointer=memory
)