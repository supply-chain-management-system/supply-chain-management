from app.db.database import engine, Base

from app.models.auth import user




from app.models.auth.user import User
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.routes.business_manager import dashboard as bm_dashboard
from fastapi import FastAPI



from app.models.business_manager import domain

from app.api.v1.routes.auth import authentication as auth
from app.api.v1.routes.business_manager import team as bm_team
from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.business_manager import ai_agent as bm_ai


from app.api.v1.routes.factory_manager import production
from app.api.v1.routes.factory_manager import team



app = FastAPI(
    title="FastAPI App",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)
app.add_middleware(
    CORSMiddleware,

    allow_origins=["http://localhost:5173","http://127.0.0.1:5173"],
    
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/v1")
app.include_router(bm_dashboard.router, prefix="/api/v1")
app.include_router(admin_featuers.router, prefix="/api/v1")
app.include_router(bm_team.router, prefix="/api/v1")
app.include_router(company.router, prefix="/api/v1/company")
app.include_router(production.router,prefix='/api/v1/production')
app.include_router(team.router,prefix='/api/v1/factory_team')
app.include_router(bm_ai.router, prefix="/api/v1")



@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
