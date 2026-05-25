import os
from dotenv import load_dotenv

# Load the local .env file
load_dotenv()

if not os.getenv("DATABASE_URL"):
    print("🚨 CRITICAL: Could not find DATABASE_URL in the local .env file!")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from ai_app.api.v1.routes.business_manager import bm_routes
from ai_app.api.v1.routes.factory_manager import factory_routes 

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
    docs_url="/api/v1/ai-docs",
    openapi_url="/api/v1/ai-openapi.json",
    redoc_url=None,
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
app.include_router(factory_routes.router, prefix="/api/v1")

@app.get("/health", tags=["System"])
async def health_check():
    """
    Ping this endpoint to verify the AI Microservice is online.
    """
    from ai_app.databases.database import ping_mongo, ping_qdrant
    mongo_status = await ping_mongo()
    qdrant_status = ping_qdrant()
    return {
        "status": "online", 
        "service": "ai_microservice",
        "models_active": ["Groq", "Gemini", "Cohere"],
        "mongo_connected": mongo_status,
        "qdrant_connected": qdrant_status
    }