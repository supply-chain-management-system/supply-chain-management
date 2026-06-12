import asyncio
from app.core.celery import celery_app
from app.db.database import SessionLocal
from app.services.subscriptions.subscription_service import check_and_expire_subscriptions

@celery_app.task(name="app.services.subscriptions.tasks.check_expired_subscriptions_task")
def check_expired_subscriptions_task():
    db = SessionLocal()
    try:
        results = asyncio.run(check_and_expire_subscriptions(db))
        return {
            "status": "success",
            "expired_count": len(results),
            "processed_companies": results
        }
    except Exception as e:
        print(f"Error running check_expired_subscriptions_task: {e}")
        return {"status": "error", "error": str(e)}
    finally:
        db.close()
