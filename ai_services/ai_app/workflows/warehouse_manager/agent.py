from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.prebuilt import create_react_agent
from langgraph.checkpoint.memory import MemorySaver
from ai_app.tools.warehouse_manager.tools import get_stock_level
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_cohere import ChatCohere
from langgraph.prebuilt import create_react_agent

llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
memory = MemorySaver()
groq_model = ChatGroq(model="llama-3.3-70b-versatile")
openai_model = ChatOpenAI(model="gpt-4o-mini")
cohere_model = ChatCohere(model="command-r-plus")

smart_llm = groq_model.with_fallbacks([
    openai_model,
    cohere_model
])
tools = [get_stock_level]

agent_executor = create_react_agent(
    model=smart_llm,
    tools=tools,
    checkpointer=memory
)