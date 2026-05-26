from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field


class SubscriptionPlanResponse(BaseModel):
    id: int
    slug: str
    name: str
    audience: str
    price_label: Optional[str] = None
    monthly_price: Optional[int] = None
    yearly_price: Optional[int] = None
    period: Optional[str] = None
    billing_note: Optional[str] = None
    icon_key: str
    cta: str
    href: str
    is_popular: bool
    display_order: int
    features: list[str] = Field(default_factory=list)
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
