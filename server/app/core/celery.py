from celery import Celery

from app.services.ai import documentation_service

celery_app = Celery(
    "server",
    broker="redis://redis:6379/0",
    backend="redis://redis:6379/0",
    include=[
        "app.services.ai.documentation_service",
        "app.services.ai.task",
        "app.services.subscriptions.tasks"
    ]
  
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="Asia/Kolkata",
    enable_utc=True,
)





