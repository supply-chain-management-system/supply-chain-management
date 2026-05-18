from app.db.database import engine, Base

from app.models.auth import user


from app.models.auth.user import User
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.business_manager import dashboard as bm_dashboard
from fastapi import FastAPI


from app.models.company_auth.managers import InviteToken


from app.models.business_manager import domain
from app.models.business_manager.team import (     # noqa — register models with BaseTenant metadata
    FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
)

from app.api.v1.routes.auth import authentication as auth
from app.api.v1.routes.business_manager import team as bm_team
from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card
from app.api.v1.routes.business_manager import factory_manager as bm_factory
from app.middlewares.comapny.company_middleware import TenantMiddleware
from app.api.v1.routes.business_manager import logistics_manager
from app.api.v1.routes.business_manager import warehouse_manager
from app.api.v1.routes.business_manager import suppliers
from app.api.v1.routes.business_manager import supply_manager



from app.api.v1.routes.sub_managers.factory_manager import production, team




from app.api.v1.routes.sub_managers.warehouse_manager import api_warehouse
from app.api.v1.routes.sub_managers import request





from app.api.v1.routes.sub_managers.factory_manager import production, team,factory_machine



from app.api.v1.routes.auth import company_auth


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

print("error")
app.add_middleware(TenantMiddleware)
print("error2")
Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(bm_dashboard.router, prefix="/api/v1")
app.include_router(admin_featuers.router, prefix="/api/v1")
app.include_router(bm_team.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1/company")
app.include_router(company_auth.router, prefix="/api/v1/company/auth")


app.include_router(production.router, prefix='/api/v1/production')
app.include_router(bm_factory.router, prefix="/api/v1")
app.include_router(logistics_manager.router, prefix="/api/v1")
app.include_router(warehouse_manager.router, prefix="/api/v1")
app.include_router(suppliers.router, prefix="/api/v1")
app.include_router(supply_manager.router, prefix="/api/v1")





app.include_router(factory_machine.router,prefix='/api/v1/factory_machine')




app.include_router(api_warehouse.router, prefix='/api/v1')


app.include_router(request.router, prefix='/api/v1')


app.include_router(team.router, prefix='/api/v1/factory_team')


app.include_router(business_card.router, prefix="/api/v1")


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
