import os
from dotenv import load_dotenv
load_dotenv()

from langgraph.graph import StateGraph, START, END
from langgraph.prebuilt import ToolNode

from ai_app.schemas.business_manager.bm_schemas import AgentState

from ai_app.tools.business_manager.bm_tools import (
    create_factory_production_draft, check_inventory_and_draft_orders,
    bulk_approve_requests, invite_team_member,
    check_supplier_status, dispatch_low_stock_alert
)

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_cohere import ChatCohere

tools = [
    create_factory_production_draft,
    check_inventory_and_draft_orders,
    bulk_approve_requests,
    invite_team_member,
    check_supplier_status,
    dispatch_low_stock_alert,
]

primary_llm = ChatGroq(model="llama-3.3-70b-versatile", temperature=0)
fallback_groq = ChatGroq(model="llama-3.1-8b-instant", temperature=0)
fallback_google = ChatGoogleGenerativeAI(model="gemini-1.5-flash", temperature=0)
fallback_cohere = ChatCohere(model="command-r-08-2024", temperature=0)

models_to_try = [
    ("GOOGLE (Gemini)", fallback_google.bind_tools(tools)),
    ("GROQ (Llama 70B)", primary_llm.bind_tools(tools)),
    ("COHERE (Command R)", fallback_cohere.bind_tools(tools)),
    ("GROQ (Llama 8B)", fallback_groq.bind_tools(tools)),
]


def run_agent(state: AgentState):
    messages = state["messages"]
    for name, model in models_to_try:
        try:
            print(f"⏳ Attempting to run with {name}...")
            return {"messages": [model.invoke(messages)]}
        except Exception as e:
            print(f"⚠️ {name} FAILED. Reason: {str(e)[:150]}...")
            continue
    raise Exception("All AI models failed.")


def should_continue(state: AgentState):
    return "tools" if state["messages"][-1].tool_calls else "__end__"


workflow = StateGraph(AgentState)
workflow.add_node("agent", run_agent)
workflow.add_node("tools", ToolNode(tools))
workflow.add_edge(START, "agent")
workflow.add_conditional_edges("agent", should_continue, ["tools", "__end__"])
workflow.add_edge("tools", "agent")

korvex_copilot = workflow.compile()
