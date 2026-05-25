import os
from celery import Celery
from ai_app.workflows.center_ai.agent import agent_executor
from langchain_core.messages import HumanMessage

REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# 🚀 The magic variable name that Celery auto-discovers flawlessly
celery = Celery(
    "ai_services_app",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery.conf.update(
    task_track_started=True,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)

# 🚀 Bind the task directly to the 'celery' app
@celery.task(name="ai_app.tasks.run_central_agent")
def run_central_agent_task(user_input: str, session_id: str, tenant_schema: str, user_role: str):
    try:
        config = {
            "configurable": {
                "thread_id": session_id,
                "tenant_schema": tenant_schema,
                "user_role": user_role
            },
            "recursion_limit": 5  # 🛡️ STOPS INFINITE LOOPS! Protects your API credits.
        }
        
        input_data = {"messages": [HumanMessage(content=user_input)]}
        
        # 🚀 Fixed the typo here
        response = agent_executor.invoke(input_data, config=config)
        return response["messages"][-1].content

    except Exception as e:
        return f"Agent Processing Output: {str(e)}"