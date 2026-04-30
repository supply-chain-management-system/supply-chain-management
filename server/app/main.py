from app.db.database import engine, Base
from app.models.auth import user

from app.api.v1.routes import authentication as auth

from app.api.v1.routes.business_manager import dashboard as bm_dashboard


from fastapi import FastAPI

app = FastAPI(
    title="FastAPI App",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)

Base.metadata.create_all(bind=engine)

app.include_router(auth.router, prefix="/api/v1")

app.include_router(bm_dashboard.router, prefix="/api/v1")



@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
