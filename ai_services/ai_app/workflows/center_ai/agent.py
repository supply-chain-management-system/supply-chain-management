import os
import contextlib
from langgraph.checkpoint.mongodb import MongoDBSaver 
from langgraph.prebuilt import create_react_agent

# --- Provider Integrations ---
from langchain_groq import ChatGroq
from langchain_openai import ChatOpenAI
from langchain_cohere import ChatCohere

# 🚀 IMPORT ALL PROVIDER ERROR CLASSES
from groq import GroqError
import openai  # 🎯 Used to catch OpenAI's quota/rate limit errors

# 📥 IMPORT THE SECURE TOOLS FROM YOUR CORRECTED TOOLS PATH
from ai_app.tools.center_ai.tools import query_business_database, search_corporate_knowledge_base

MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
central_tools = [query_business_database, search_corporate_knowledge_base]

CENTRAL_AI_PROMPT = (
    "You are the Korvex Centralized Enterprise Supervisor Copilot.\n"
    "You serve owners, warehouse managers, finance managers, and HR personnel.\n"
    "When a user asks a question, identify the 'target_table' they are requesting and pass "
    "it explicitly to your query tool.\n"
    "CRITICAL: When calling tools, you MUST output perfectly valid, well-formed JSON arguments."
)

# 1️⃣ Bind Base Models
groq_base = ChatGroq(model="llama-3.3-70b-versatile")
openai_base = ChatOpenAI(model="gpt-4o-mini")
cohere_base = ChatCohere(model="command-r-plus-08-2024")

# 2️⃣ Combine Prompts and Tools
groq_chain = groq_base.bind_tools(central_tools, system_prompt=CENTRAL_AI_PROMPT)
openai_chain = openai_base.bind_tools(central_tools, system_prompt=CENTRAL_AI_PROMPT)
cohere_chain = cohere_base.bind_tools(central_tools)

# 3️⃣ Build the Redundant Smart Chain (Now catching BOTH Groq and OpenAI errors)
smart_llm_chain = groq_chain.with_fallbacks(
    fallbacks=[openai_chain, cohere_chain],
    exceptions_to_handle=(GroqError, openai.OpenAIError)  # 🎯 Catch Groq limits AND OpenAI quota issues!
)

# 4️⃣ Global MongoDB Connection Checkpointer
_stack = contextlib.ExitStack()
memory = _stack.enter_context(MongoDBSaver.from_conn_string(MONGO_URL, db_name="korvex_ai_db"))

# 5️⃣ Export the master engine
agent_executor = create_react_agent(
    model=smart_llm_chain,
    tools=central_tools,
    checkpointer=memory
)