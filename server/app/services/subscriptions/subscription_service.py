from sqlalchemy.orm import Session

from app.models.subscriptions.subscription_plan import SubscriptionPlan


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
