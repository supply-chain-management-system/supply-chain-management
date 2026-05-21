import os
from celery import Celery

# Setup Redis Broker URL
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")

# Create the master Celery application handle
ai_celery_app = Celery(
    "ai_services_app",
    broker=REDIS_URL,
    backend=REDIS_URL,
    include=["ai_app.tasks"]  # Tells Celery exactly where to look for jobs!
)

ai_celery_app.conf.update(
    task_track_started=True,
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
)