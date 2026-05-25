from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.subscriptions.subscription_plan import SubscriptionPlanResponse
from app.services.subscriptions.subscription_service import get_subscription_plans


router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.get("/plans", response_model=list[SubscriptionPlanResponse])
def list_subscription_plans(db: Session = Depends(get_db)):
    return get_subscription_plans(db)
