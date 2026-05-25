# Pass-through to keep FastAPI happy without causing import loops!
# Disguise the celery variable from agent_tasks as ai_celery_app!
# Notice we added .agent_tasks here!
from ai_app.tasks.agent_tasks import celery as ai_celery_app