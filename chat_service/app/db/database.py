from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = AsyncIOMotorClient(settings.MONGO_URL)
db = client[settings.MONGO_DB]

async def ping_mongo():
    try:
        # The ping command is cheap and checks if the server is available
        await db.command("ping")
        return True
    except Exception:
        return False
