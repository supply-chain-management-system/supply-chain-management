from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy.orm import Session

from app.db.deps import get_db
from app.schemas.subscriptions.subscription_plan import (
    SubscriptionPlanResponse,
    PaymentResponse,
    PaymentRequest,
    WebhookResponsePayload,
    TransactionStatusResponse
)
from app.services.subscriptions.subscription_service import (
    get_subscription_plans,
    generate_phonepe_payment,
    verify_phonepe_checksum,
    process_webhook_callback,
    check_and_update_transaction_status
)


router = APIRouter(prefix="/subscriptions", tags=["Subscriptions"])


@router.get("/plans", response_model=list[SubscriptionPlanResponse])
def list_subscription_plans(db: Session = Depends(get_db)):
    return get_subscription_plans(db)

@router.post("/create-payment", response_model=PaymentResponse)
def create_payment(request: PaymentRequest, db: Session = Depends(get_db)):
    return generate_phonepe_payment(db=db, plan_slug=request.plan_slug, user_id=request.user_id)

@router.post("/webhook")
def phonepe_webhook(
    payload: WebhookResponsePayload,
    x_verify: str = Header(None, alias="X-VERIFY"),
    db: Session = Depends(get_db)
):
    if not x_verify:
        raise HTTPException(status_code=401, detail="Missing X-VERIFY header")
        
    is_valid = verify_phonepe_checksum(payload.response, x_verify)
    if not is_valid:
        raise HTTPException(status_code=401, detail="Invalid signature checksum")
        
    success = process_webhook_callback(db, payload.response)
    if not success:
        raise HTTPException(status_code=400, detail="Webhook processing failed")
        
    return {"status": "SUCCESS"}

@router.get("/status/{txn_id}", response_model=TransactionStatusResponse)
def get_transaction_status(txn_id: str, db: Session = Depends(get_db)):
    txn = check_and_update_transaction_status(db, txn_id)
    return {
        "transaction_id": txn.merchant_transaction_id,
        "status": txn.status,
        "plan_slug": txn.plan_slug,
        "success": txn.status == "SUCCESS"
    }
