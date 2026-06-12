from fastapi import HTTPException
from sqlalchemy.orm import Session
from app.models.subscriptions.user_subscription import CompanySubscription
from app.models.owner_models.business_card import BusinessCard
from app.models.business_manager.team import FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
from app.models.sub_managers.factory_manager.teams import Worker

PLAN_LIMITS = {
    "free": {
        "businesses": 1,
        "warehouses": 1,
        "factories": 1,
        "suppliers": 1,
        "logistics": 1,
        "employees": 1
    },
    "starter": {
        "businesses": 1,
        "warehouses": 2,
        "factories": 2,
        "suppliers": 2,
        "logistics": 2,
        "employees": 5
    },
    "premium": {
        "businesses": 3,
        "warehouses": 5,
        "factories": 5,
        "suppliers": 5,
        "logistics": 5,
        "employees": 10
    },
    "custom": {
        "businesses": 100,
        "warehouses": 100,
        "factories": 100,
        "suppliers": 100,
        "logistics": 100,
        "employees": 100
    }
}

def get_company_plan(db_public: Session, company_id: int):
    sub = db_public.query(CompanySubscription).filter(
        CompanySubscription.company_id == company_id,
        CompanySubscription.status == "ACTIVE"
    ).first()
    if not sub:
        return "free"
    return sub.plan_slug

def check_business_limit(db_public: Session, db_tenant: Session, company_id: int):
    plan = get_company_plan(db_public, company_id)
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])["businesses"]
    
    current_count = db_tenant.query(BusinessCard).count()
    if current_count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Business limit reached. Your '{plan.capitalize()}' plan allows up to {limit} Business(es). Please upgrade your subscription."
        )

def check_manager_limit(db_public: Session, db_tenant: Session, company_id: int, manager_type: str):
    plan = get_company_plan(db_public, company_id)
    limits = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])
    
    if manager_type == "warehouse":
        limit = limits["warehouses"]
        current_count = db_tenant.query(WarehouseManager).count()
    elif manager_type == "factory":
        limit = limits["factories"]
        current_count = db_tenant.query(FactoryManager).count()
    elif manager_type == "supplier":
        limit = limits["suppliers"]
        current_count = db_tenant.query(SupplyManager).count()
    elif manager_type == "logistics":
        limit = limits["logistics"]
        current_count = db_tenant.query(LogisticsManager).count()
    else:
        return
        
    if current_count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"{manager_type.capitalize()} Manager limit reached. Your '{plan.capitalize()}' plan allows up to {limit} {manager_type.capitalize()} Manager(s). Please upgrade your subscription."
        )

def check_employee_limit(db_public: Session, db_tenant: Session, company_id: int, module: str = "factory"):
    plan = get_company_plan(db_public, company_id)
    limit = PLAN_LIMITS.get(plan, PLAN_LIMITS["free"])["employees"]
    
    if module == "factory":
        current_count = db_tenant.query(Worker).count()
    else:
        return
        
    if current_count >= limit:
        raise HTTPException(
            status_code=403,
            detail=f"Employee limit reached for {module.capitalize()}. Your '{plan.capitalize()}' plan allows up to {limit} employee(s) per module. Please upgrade your subscription."
        )

def get_tenant_session(db_public: Session, schema_name: str) -> Session:
    engine = db_public.get_bind()
    tenant_engine = engine.execution_options(schema_translate_map={None: schema_name})
    from sqlalchemy.orm import sessionmaker
    TenantSession = sessionmaker(bind=tenant_engine)
    return TenantSession()

def check_invite_limit(db_public: Session, company_id: int, schema_name: str, role_value: str):
    manager_type = None
    role_str = str(role_value).lower()
    if "warehouse" in role_str:
        manager_type = "warehouse"
    elif "factory" in role_str:
        manager_type = "factory"
    elif "logistics" in role_str:
        manager_type = "logistics"
    elif "supply" in role_str:
        manager_type = "supplier"
        
    if not manager_type:
        return
        
    tenant_db = get_tenant_session(db_public, schema_name)
    try:
        check_manager_limit(db_public, tenant_db, company_id, manager_type)
    finally:
        tenant_db.close()
