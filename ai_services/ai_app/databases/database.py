import os
from motor.motor_asyncio import AsyncIOMotorClient
from qdrant_client import QdrantClient

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

# Qdrant Vector DB client configuration
QDRANT_URL = os.getenv("QDRANT_URL", "http://qdrant:6333")
qdrant_client = QdrantClient(url=QDRANT_URL)

def ping_qdrant() -> bool:
    try:
        # Try getting collections list as a simple verification ping
        qdrant_client.get_collections()
        return True
    except Exception:
        return False