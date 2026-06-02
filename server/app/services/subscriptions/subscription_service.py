from sqlalchemy.orm import Session

from app.models.subscriptions.subscription_plan import SubscriptionPlan

import base64
import hashlib
import json
import time
import requests
from fastapi import HTTPException


DEFAULT_SUBSCRIPTION_PLANS = [
    {
        "slug": "free",
        "name": "Free",
        "audience": "For testing your workflow",
        "price_label": "Free",
        "monthly_price": None,
        "yearly_price": None,
        "period": "",
        "billing_note": "No credit card required",
        "icon_key": "warehouse",
        "cta": "Get Started",
        "href": "/signup",
        "is_popular": False,
        "display_order": 1,
        "features": [
            "1 Business",
            "1 Warehouse",
            "1 Factory",
            "1 Supplier",
            "1 Logistics",
            "1 employee in each module",
        ],
    },
    {
        "slug": "starter",
        "name": "Starter",
        "audience": "For small growing teams",
        "price_label": None,
        "monthly_price": 199,
        "yearly_price": 1990,
        "period": None,
        "billing_note": None,
        "icon_key": "boxes",
        "cta": "Upgrade Now",
        "href": "/pricing",
        "is_popular": False,
        "display_order": 2,
        "features": [
            "1 Business",
            "2 Warehouses",
            "2 Factories",
            "2 Suppliers",
            "2 Logistics",
            "5 employees in each module",
        ],
    },
    {
        "slug": "premium",
        "name": "Premium",
        "audience": "For serious operations",
        "price_label": None,
        "monthly_price": 999,
        "yearly_price": 9990,
        "period": None,
        "billing_note": None,
        "icon_key": "bar-chart",
        "cta": "Start Premium",
        "href": "/pricing",
        "is_popular": True,
        "display_order": 3,
        "features": [
            "3 Businesses",
            "5 Warehouses",
            "5 Factories",
            "5 Suppliers",
            "5 Logistics",
            "10 employees in each module",
            "Priority Support",
        ],
    },
    {
        "slug": "custom",
        "name": "Custom",
        "audience": "For large enterprises",
        "price_label": "Custom",
        "monthly_price": None,
        "yearly_price": None,
        "period": "Pricing",
        "billing_note": "Tailored to your company",
        "icon_key": "network",
        "cta": "Contact Sales",
        "href": "/contact-sales",
        "is_popular": False,
        "display_order": 4,
        "features": [
            "Customize all module limits",
            "Customize employees in each module",
            "Unlimited workflow options",
            "Advanced role management",
            "API Access",
            "Dedicated Support",
        ],
    },
]


def seed_subscription_plans(db: Session) -> None:
    for plan_data in DEFAULT_SUBSCRIPTION_PLANS:
        plan = (
            db.query(SubscriptionPlan)
            .filter(SubscriptionPlan.slug == plan_data["slug"])
            .first()
        )

        if plan is None:
            db.add(SubscriptionPlan(**plan_data))

    db.commit()


def get_subscription_plans(db: Session) -> list[SubscriptionPlan]:
    return (
        db.query(SubscriptionPlan)
        .order_by(SubscriptionPlan.display_order.asc())
        .all()
    )



import os
from datetime import datetime, timedelta
from app.models.subscriptions.user_subscription import PaymentTransaction, CompanySubscription
from app.models.auth.user import User

# PhonePe Sandbox / Production Credentials
PHONEPE_MERCHANT_ID = os.getenv("PHONEPE_MERCHANT_ID", "PGTESTPAYUAT86")
PHONEPE_SALT_KEY = os.getenv("PHONEPE_SALT_KEY", "96434309-7796-489d-8924-ab56988a6076")
PHONEPE_SALT_INDEX = os.getenv("PHONEPE_SALT_INDEX", "1")
PHONEPE_UAT_URL = os.getenv("PHONEPE_UAT_URL", "https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay")
PHONEPE_CALLBACK_URL = os.getenv("PHONEPE_CALLBACK_URL", "https://your-ngrok-url.app/webhook")

def generate_phonepe_payment(db: Session, plan_slug: str, user_id: str):
    plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.slug == plan_slug).first()
    
    if not plan:
        raise HTTPException(status_code=404, detail="Subscription plan not found.")
        
    if not plan.monthly_price:
        raise HTTPException(status_code=400, detail="This is a free or custom plan. No payment required.")

    amount_in_paise = int(plan.monthly_price * 100)
    transaction_id = f"TXN_{int(time.time())}"

    payload = {
        "merchantId": PHONEPE_MERCHANT_ID,
        "merchantTransactionId": transaction_id,
        "merchantUserId": user_id,
        "amount": amount_in_paise,
        "redirectUrl": "http://localhost:5173/payment-success",
        "redirectMode": "REDIRECT",
        "callbackUrl": PHONEPE_CALLBACK_URL,
        "paymentInstrument": {
            "type": "PAY_PAGE"
        }
    }

    payload_json = json.dumps(payload)
    base64_payload = base64.b64encode(payload_json.encode('utf-8')).decode('utf-8')
    
    string_to_hash = base64_payload + "/pg/v1/pay" + PHONEPE_SALT_KEY
    sha256_hash = hashlib.sha256(string_to_hash.encode('utf-8')).hexdigest()
    checksum = f"{sha256_hash}###{PHONEPE_SALT_INDEX}"

    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": checksum
    }
    
    # Create the pending transaction log in our database first
    db_txn = PaymentTransaction(
        user_id=user_id,
        plan_slug=plan_slug,
        merchant_transaction_id=transaction_id,
        amount=amount_in_paise,
        status="PENDING"
    )
    db.add(db_txn)
    db.commit()

    response = requests.post(PHONEPE_UAT_URL, json={"request": base64_payload}, headers=headers)
    response_data = response.json()

    if response_data.get("success"):
        return {
            "success": True,
            "payment_url": response_data["data"]["instrumentResponse"]["redirectInfo"]["url"],
            "transaction_id": transaction_id
        }
    else:
        raise HTTPException(status_code=400, detail=response_data.get("message", "Payment initialization failed."))

def verify_phonepe_checksum(base64_response: str, x_verify_header: str) -> bool:
    if not x_verify_header:
        return False
    try:
        parts = x_verify_header.split("###")
        if len(parts) != 2:
            return False
        received_hash, salt_index = parts
        
        string_to_hash = base64_response + PHONEPE_SALT_KEY
        sha256_hash = hashlib.sha256(string_to_hash.encode('utf-8')).hexdigest()
        
        return received_hash.lower() == sha256_hash.lower()
    except Exception:
        return False

def process_webhook_callback(db: Session, base64_response: str) -> bool:
    try:
        decoded_payload = base64.b64decode(base64_response).decode('utf-8')
        payload_data = json.loads(decoded_payload)
    except Exception:
        return False

    success = payload_data.get("success", False)
    code = payload_data.get("code")
    data = payload_data.get("data", {})
    merchant_transaction_id = data.get("merchantTransactionId")
    phonepe_transaction_id = data.get("transactionId")
    amount = data.get("amount")
    
    if not merchant_transaction_id:
        return False
        
    txn = db.query(PaymentTransaction).filter(PaymentTransaction.merchant_transaction_id == merchant_transaction_id).first()
    if not txn:
        return False
        
    txn.phonepe_transaction_id = phonepe_transaction_id
    txn.status = "SUCCESS" if success else "FAILED"
    txn.updated_at = datetime.utcnow()
    
    if success:
        try:
            user = db.query(User).filter(User.id == int(txn.user_id)).first()
        except ValueError:
            user = None
            
        if user and user.company_id:
            sub = db.query(CompanySubscription).filter(CompanySubscription.company_id == user.company_id).first()
            plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.slug == txn.plan_slug).first()
            
            is_yearly = False
            if plan and plan.yearly_price:
                if amount == int(plan.yearly_price * 100):
                    is_yearly = True
            
            duration_days = 365 if is_yearly else 30
            end_date = datetime.utcnow() + timedelta(days=duration_days)
            
            if sub:
                sub.plan_slug = txn.plan_slug
                sub.status = "ACTIVE"
                sub.billing_cycle = "yearly" if is_yearly else "monthly"
                sub.start_date = datetime.utcnow()
                sub.end_date = end_date
                sub.updated_at = datetime.utcnow()
            else:
                sub = CompanySubscription(
                    company_id=user.company_id,
                    plan_slug=txn.plan_slug,
                    status="ACTIVE",
                    billing_cycle="yearly" if is_yearly else "monthly",
                    start_date=datetime.utcnow(),
                    end_date=end_date
                )
                db.add(sub)
    db.commit()
    return True

def check_and_update_transaction_status(db: Session, merchant_transaction_id: str):
    txn = db.query(PaymentTransaction).filter(PaymentTransaction.merchant_transaction_id == merchant_transaction_id).first()
    if not txn:
        raise HTTPException(status_code=404, detail="Transaction not found.")
        
    if txn.status != "PENDING":
        return txn
        
    api_path = f"/pg/v1/status/{PHONEPE_MERCHANT_ID}/{merchant_transaction_id}"
    string_to_hash = api_path + PHONEPE_SALT_KEY
    sha256_hash = hashlib.sha256(string_to_hash.encode('utf-8')).hexdigest()
    checksum = f"{sha256_hash}###{PHONEPE_SALT_INDEX}"
    
    headers = {
        "Content-Type": "application/json",
        "X-VERIFY": checksum,
        "X-MERCHANT-ID": PHONEPE_MERCHANT_ID
    }
    
    base_url = PHONEPE_UAT_URL.split("/pg/v1/pay")[0]
    status_url = f"{base_url}/pg/v1/status/{PHONEPE_MERCHANT_ID}/{merchant_transaction_id}"
    
    try:
        response = requests.get(status_url, headers=headers)
        response_data = response.json()
    except Exception as e:
        print(f"Error querying PhonePe status API: {e}")
        return txn
        
    success = response_data.get("success", False)
    code = response_data.get("code")
    data = response_data.get("data", {})
    
    if code in ["PAYMENT_SUCCESS", "PAYMENT_ERROR", "PAYMENT_DECLINED"]:
        txn.phonepe_transaction_id = data.get("transactionId")
        txn.status = "SUCCESS" if code == "PAYMENT_SUCCESS" else "FAILED"
        txn.updated_at = datetime.utcnow()
        
        if txn.status == "SUCCESS":
            try:
                user = db.query(User).filter(User.id == int(txn.user_id)).first()
            except ValueError:
                user = None
                
            if user and user.company_id:
                sub = db.query(CompanySubscription).filter(CompanySubscription.company_id == user.company_id).first()
                plan = db.query(SubscriptionPlan).filter(SubscriptionPlan.slug == txn.plan_slug).first()
                amount = data.get("amount")
                
                is_yearly = False
                if plan and plan.yearly_price:
                    if amount == int(plan.yearly_price * 100):
                        is_yearly = True
                
                duration_days = 365 if is_yearly else 30
                end_date = datetime.utcnow() + timedelta(days=duration_days)
                
                if sub:
                    sub.plan_slug = txn.plan_slug
                    sub.status = "ACTIVE"
                    sub.billing_cycle = "yearly" if is_yearly else "monthly"
                    sub.start_date = datetime.utcnow()
                    sub.end_date = end_date
                    sub.updated_at = datetime.utcnow()
                else:
                    sub = CompanySubscription(
                        company_id=user.company_id,
                        plan_slug=txn.plan_slug,
                        status="ACTIVE",
                        billing_cycle="yearly" if is_yearly else "monthly",
                        start_date=datetime.utcnow(),
                        end_date=end_date
                    )
                    db.add(sub)
        db.commit()
        
    return txn