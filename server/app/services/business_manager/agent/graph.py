import os
from dotenv import load_dotenv

# 1. FORCE LOAD ENV VARS FIRST
load_dotenv()

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode
from app.services.business_manager.agent.state import AgentState

# Import LangChain LLM Connectors
from langchain_groq import ChatGroq 
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_cohere import ChatCohere

# Import all your tools
from app.services.business_manager.agent.tools import (
    create_factory_production_draft,
    check_inventory_and_draft_orders,
    bulk_approve_requests,
    invite_team_member,
    check_supplier_status,
    dispatch_low_stock_alert  
)

tools = [
    create_factory_production_draft,
    check_inventory_and_draft_orders,
    bulk_approve_requests,
    invite_team_member,
    check_supplier_status,
    dispatch_low_stock_alert  
]

# ==========================================
# MULTI-CLOUD AI INITIALIZATION
# ==========================================
primary_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)

# 2. FALLBACK 1: Groq (Llama 3.1 8B) 
fallback_groq = ChatGroq(model="llama-3.1-8b-instant", temperature=0)

# 3. FALLBACK 2: Google (Gemini) 
fallback_google = ChatGoogleGenerativeAI(model="gemini-1.5-flash-latest", temperature=0)

# 4. FALLBACK 3: Cohere (Command R)
fallback_cohere = ChatCohere(model="command-r", temperature=0)

# Bind tools to every single model
primary_with_tools = primary_llm.bind_tools(tools)
groq_backup_with_tools = fallback_groq.bind_tools(tools)
google_with_tools = fallback_google.bind_tools(tools)
cohere_with_tools = fallback_cohere.bind_tools(tools)

# ==========================================
# MANUAL ENTERPRISE FALLBACK LOOP
# ==========================================

def run_agent(state: AgentState):
    messages = state["messages"]
    
    # We define the order of the models we want to try
    # Notice Gemini is now above the 8B model!
    models_to_try = [
        ("GOOGLE (Gemini)", google_with_tools), 
        ("GROQ (Llama 70B)", primary_with_tools), 
        ("GROQ (Llama 8B)", groq_backup_with_tools), 
        ("COHERE (Command R)", cohere_with_tools)  
    ]
    
    # Loop through them one by one
    for name, model in models_to_try:
        try:
            print(f"⏳ Attempting to run with {name}...")
            response = model.invoke(messages)
            print(f"🚀 SUCCESS: Request handled by -> {name}")
            return {"messages": [response]}
            
        except Exception as e:
            # THIS IS THE MOST IMPORTANT LINE: It prints the exact crash reason!
            print(f"⚠️ {name} FAILED. Reason: {str(e)[:300]}...") 
            continue 

    # If the loop finishes and ALL models failed, we raise a final error to trigger the UI fallback
    raise Exception("All AI models in the fallback matrix failed. Complete API blackout.")


def should_continue(state: AgentState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "__end__"

workflow = StateGraph(AgentState)
workflow.add_node("agent", run_agent)
workflow.add_node("tools", ToolNode(tools))
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", "__end__"])
workflow.add_edge("tools", "agent")

korvex_copilot = workflow.compile()