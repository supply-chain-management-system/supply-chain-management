import os
from motor.motor_asyncio import AsyncIOMotorClient

# Fallback to local mongo if not running in Docker
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017")
client = AsyncIOMotorClient(MONGO_URL)

# This database will store AI chat history and LangGraph state later
db = client.korvex_ai_db

async def ping_mongo():
    try:
        await db.command("ping")
        return True
    except Exception:
        return False