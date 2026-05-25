from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.routes import chat_rooms, messages, user_sync
from app.api.v1.websockets import connection
from app.services.broker import broker
from app.db.database import ping_mongo

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: connect to Redis pub/sub broker
    await broker.connect()
    # Ping MongoDB
    mongo_status = await ping_mongo()
    print(f"MongoDB connection: {'ONLINE' if mongo_status else 'OFFLINE'}")
    yield
    # Shutdown: disconnect broker
    await broker.disconnect()

app = FastAPI(
    title="Korvex Chat Microservice",
    description="Real-time messaging microservice built on FastAPI, MongoDB, and Redis Pub/Sub.",
    version="1.0.0",
    docs_url="/api/v1/chat-docs",
    openapi_url="/api/v1/chat-openapi.json",
    redoc_url=None,
    lifespan=lifespan
)

# CORS Middleware config
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust as needed for production environments
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include REST routes under /api/v1/chat
app.include_router(chat_rooms.router, prefix="/api/v1/chat", tags=["Rooms"])
app.include_router(messages.router, prefix="/api/v1/chat", tags=["Messages"])
app.include_router(user_sync.router, prefix="/api/v1/chat", tags=["Users"])

# Include WebSocket routes (handles its own prefix internally)
app.include_router(connection.router, tags=["WebSockets"])

@app.get("/health", tags=["System"])
async def health_check():
    mongo_status = await ping_mongo()
    return {
        "status": "online",
        "service": "chat_microservice",
        "mongo_connected": mongo_status
    }
