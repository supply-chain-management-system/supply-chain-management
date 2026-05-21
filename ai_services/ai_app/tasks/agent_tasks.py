import asyncio
from ai_app.core.celery_config import ai_celery_app
from ai_app.workflows.center_ai.agent import agent_executor
from langchain_core.messages import HumanMessage

# 🎯 Matches the string identifier called by send_task exactly!
@ai_celery_app.task(name="ai_app.tasks.run_central_agent")
def run_central_agent_task(user_input: str, session_id: str, tenant_schema: str, user_role: str):
    config = {
        "configurable": {
            "thread_id": session_id,
            "tenant_schema": tenant_schema,
            "user_role": user_role
        }
    }
    input_data = {"messages": [HumanMessage(content=user_input)]}
    
    response = asyncio.run(agent_executor.ainvoke(input_data, config=config))
    return response["messages"][-1].content