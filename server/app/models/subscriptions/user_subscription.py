from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean
from sqlalchemy.sql import func
from app.db.database import Base

class PaymentTransaction(Base):
    __tablename__ = "payment_transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String(100), nullable=False)
    plan_slug = Column(String(50), nullable=False)
    merchant_transaction_id = Column(String(100), unique=True, index=True, nullable=False)
    phonepe_transaction_id = Column(String(100), nullable=True)
    amount = Column(Integer, nullable=False)  # in paise
    status = Column(String(50), default="PENDING", nullable=False)  # PENDING, SUCCESS, FAILED
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())


class CompanySubscription(Base):
    __tablename__ = "company_subscriptions"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, unique=True, index=True, nullable=False)
    plan_slug = Column(String(50), nullable=False)
    status = Column(String(50), default="ACTIVE", nullable=False)  # ACTIVE, EXPIRED, CANCELLED
    billing_cycle = Column(String(50), default="monthly", nullable=False)  # monthly, yearly
    start_date = Column(DateTime(timezone=True), server_default=func.now())
    end_date = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now(), server_default=func.now())
