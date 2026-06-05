<<<<<<< HEAD

from requests import get

from app.db.database import engine, Base




from app.models.auth.user import User

from fastapi import FastAPI

from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base

from app.models.auth.user import User
from app.models.company_auth.managers import InviteToken
from app.models.subscriptions import SubscriptionPlan



from app.models.business_manager import domain
from app.models.business_manager.team import (     # noqa — register models with BaseTenant metadata
    FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
)
from app.models.supplier_manager import supplier, inventory as inv_model, order as order_model # noqa

from app.middlewares.comapny.company_middleware import TenantMiddleware

from app.api.v1.routes.auth import authentication as auth
from app.api.v1.routes.auth import company_auth

from app.api.v1.routes.business_manager import dashboard as bm_dashboard
from app.api.v1.routes.business_manager import team as bm_team
from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card
from app.api.v1.routes.business_manager import factory_manager as bm_factory
from app.api.v1.routes.business_manager import logistics_manager
from app.api.v1.routes.business_manager import warehouse_manager
from app.api.v1.routes.supplier_manager import suppliers as sm_suppliers
from app.api.v1.routes.supplier_manager import inventory as sm_inventory
from app.api.v1.routes.supplier_manager import orders as sm_orders
from app.api.v1.routes.business_manager import supply_manager
from app.api.v1.routes.owner_routes import S_center_ai

from app.api.v1.routes import profile as auth_profile



from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card



from app.api.v1.routes.sub_managers.warehouse_manager import api_warehouse
from app.api.v1.routes.sub_managers import request





from app.api.v1.routes.sub_managers.factory_manager import production, team,factory_machine, factory_material
from app.api.v1.routes.sub_managers.factory_manager import analytics    
from app.api.v1.routes.elt import production_elt, warehouse_elt, logistics_elt



from app.api.v1.routes.auth import company_auth
from app.api.v1.routes.subscriptions import subscriptions
from app.db.database import SessionLocal
from app.services.subscriptions import seed_subscription_plans


app = FastAPI(
    title="FastAPI App",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantMiddleware)

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_subscription_plans(db)

app.include_router(auth.router, prefix="/api/v1")

app.include_router(auth_profile.router, prefix="/api/v1")
app.include_router(bm_dashboard.router, prefix="/api/v1")
app.include_router(admin_featuers.router, prefix="/api/v1")
app.include_router(bm_team.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1/company")
app.include_router(company_auth.router, prefix="/api/v1/company/auth")

app.include_router(bm_dashboard.router, prefix="/api/v1")
app.include_router(bm_team.router, prefix="/api/v1")
app.include_router(bm_factory.router, prefix="/api/v1")


app.include_router(production.router, prefix='/api/v1/production')
app.include_router(bm_factory.router, prefix="/api/v1")
app.include_router(logistics_manager.router, prefix="/api/v1")
app.include_router(warehouse_manager.router, prefix="/api/v1")
app.include_router(sm_suppliers.router, prefix="/api/v1")
app.include_router(sm_inventory.router, prefix="/api/v1/supplier-manager")
app.include_router(sm_orders.router, prefix="/api/v1/supplier-manager")
app.include_router(supply_manager.router, prefix="/api/v1")





app.include_router(factory_machine.router,prefix='/api/v1/factory_machine')
app.include_router(factory_material.router,prefix='/api/v1/factory_material')
app.include_router(analytics.router,prefix='/api/v1/factory_analytics')
app.include_router(production_elt.router,prefix='/api/v1/elt')
app.include_router(warehouse_elt.router,prefix='/api/v1/elt')
app.include_router(logistics_elt.router,prefix='/api/v1/elt')


 
app.include_router(admin_featuers.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1/company")


app.include_router(api_warehouse.router, prefix='/api/v1')


app.include_router(request.router, prefix='/api/v1')

from app.api.v1.routes.sub_managers import logistics_dashboard
app.include_router(logistics_dashboard.router, prefix='/api/v1')


app.include_router(team.router, prefix='/api/v1/factory_team')



app.include_router(business_card.router, prefix="/api/v1")
app.include_router(subscriptions.router, prefix="/api/v1")

app.include_router(production.router, prefix="/api/v1/production")
app.include_router(team.router, prefix="/api/v1/factory_team")

app.include_router(api_warehouse.router, prefix="/api/v1")
app.include_router(request.router, prefix="/api/v1")
app.include_router(S_center_ai.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
=======

from requests import get

from app.db.database import engine, Base




from app.models.auth.user import User

from fastapi import FastAPI, Depends
from app.services.auth.dependancy import require_role

from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base

from app.models.auth.user import User
from app.models.company_auth.managers import InviteToken
from app.models.subscriptions import SubscriptionPlan



from app.models.business_manager import domain
from app.models.business_manager.team import (     # noqa — register models with BaseTenant metadata
    FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
)
from app.models.supplier_manager import supplier, inventory as inv_model, order as order_model # noqa

from app.middlewares.comapny.company_middleware import TenantMiddleware

from app.api.v1.routes.auth import authentication as auth
from app.api.v1.routes.auth import company_auth

from app.api.v1.routes.business_manager import dashboard as bm_dashboard
from app.api.v1.routes.business_manager import team as bm_team
from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.admin import admin_control as admin_control_routes
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card
from app.api.v1.routes.business_manager import factory_manager as bm_factory
from app.api.v1.routes.business_manager import logistics_manager
from app.api.v1.routes.business_manager import warehouse_manager
from app.api.v1.routes.supplier_manager import suppliers as sm_suppliers
from app.api.v1.routes.supplier_manager import inventory as sm_inventory
from app.api.v1.routes.supplier_manager import orders as sm_orders
from app.api.v1.routes.business_manager import supply_manager
from app.api.v1.routes.owner_routes import S_center_ai

from app.api.v1.routes import profile as auth_profile



from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card



from app.api.v1.routes.sub_managers.warehouse_manager import api_warehouse
from app.api.v1.routes.sub_managers import request
from app.api.v1.routes.sub_managers.logistics_manager import logistics_dashboard





from app.api.v1.routes.sub_managers.factory_manager import production, team,factory_machine, factory_material
from app.api.v1.routes.sub_managers.factory_manager import analytics    
from app.api.v1.routes.elt import production_elt 



from app.api.v1.routes.auth import company_auth
from app.api.v1.routes.subscriptions import subscriptions
from app.db.database import SessionLocal
from app.services.subscriptions import seed_subscription_plans


app = FastAPI(
    title="FastAPI App",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantMiddleware)

Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_subscription_plans(db)


# ── Core Auth ───────────────────────────────────────────────────────────────
app.include_router(auth.router, prefix="/api/v1")
app.include_router(auth_profile.router, prefix="/api/v1")
app.include_router(company_auth.router, prefix="/api/v1/company/auth")
app.include_router(company.router, prefix="/api/v1/company")

# ── Admin ────────────────────────────────────────────────────────────────────
app.include_router(admin_featuers.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])
app.include_router(admin_control_routes.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])

# ── Business Manager ─────────────────────────────────────────────────────────
app.include_router(bm_dashboard.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(bm_dashboard.requests_router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager", "supply_manager", "warehouse_manager", "factory_manager", "logistics_manager"]))])
app.include_router(bm_team.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(bm_factory.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(logistics_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(warehouse_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(supply_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])

# ── Supplier Manager ─────────────────────────────────────────────────────────
app.include_router(sm_suppliers.router, prefix="/api/v1", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])
app.include_router(sm_inventory.router, prefix="/api/v1/supplier-manager", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])
app.include_router(sm_orders.router, prefix="/api/v1/supplier-manager", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])

# ── Factory Sub-Manager ──────────────────────────────────────────────────────
app.include_router(production.router, prefix="/api/v1/production", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(team.router, prefix="/api/v1/factory_team", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(factory_machine.router, prefix="/api/v1/factory_machine", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(factory_material.router, prefix="/api/v1/factory_material", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(analytics.router, prefix="/api/v1/factory_analytics", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(production_elt.router, prefix="/api/v1/elt", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])

# ── Warehouse Sub-Manager ────────────────────────────────────────────────────
app.include_router(api_warehouse.router, prefix="/api/v1", dependencies=[Depends(require_role(["warehouse_manager", "owner", "business_manager"]))])

# ── Logistics Sub-Manager ────────────────────────────────────────────────────
app.include_router(logistics_dashboard.router, prefix="/api/v1", dependencies=[Depends(require_role(["logistics_manager", "owner", "business_manager"]))])

# ── Shared / Other ───────────────────────────────────────────────────────────
app.include_router(request.router, prefix="/api/v1", dependencies=[Depends(require_role(["factory_manager", "warehouse_manager", "owner", "business_manager"]))])
app.include_router(business_card.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner", "business_manager"]))])
app.include_router(subscriptions.router, prefix="/api/v1")
app.include_router(S_center_ai.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
>>>>>>> development
