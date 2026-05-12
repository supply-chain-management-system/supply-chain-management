import os
from dotenv import load_dotenv

# Load the local .env file
load_dotenv()

if not os.getenv("DATABASE_URL"):
    print("🚨 CRITICAL: Could not find DATABASE_URL in the local .env file!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_app.api.v1.routes.business_manager import bm_routes
from ai_app.api.v1.routes.warehouse_manager.routes import router

# ==========================================
# SWAGGER DOCUMENTATION METADATA
# ==========================================
tags_metadata = [
    {
        "name": "BM — AI Copilot",
        "description": "Endpoints for interacting with the LangGraph-powered supply chain assistant. Features multi-cloud fallback (Groq, Gemini, Cohere).",
    },
    {
        "name": "System",
        "description": "Microservice health and telemetry checks.",
    }
]

app = FastAPI(
    title="Korvex AI Microservice",
    description="Dedicated LLM orchestration service for the NexusGrid Supply Chain platform.",
    version="2.0.0",
    openapi_tags=tags_metadata,
    docs_url="/docs",       # Swagger UI will live here
    redoc_url="/redoc",     # ReDoc will live here
)

# ==========================================
# MIDDLEWARE
# ==========================================
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ==========================================
# ROUTES
# ==========================================
app.include_router(bm_routes.router, prefix="/api/v1")
app.include_router(router.router, prefix="/api/v1")


@app.get("/health", tags=["System"])
def health_check():
    """
    Ping this endpoint to verify the AI Microservice is online.
    """
    return {
        "status": "online", 
        "service": "ai_microservice",
        "models_active": ["Groq", "Gemini", "Cohere"]
    }