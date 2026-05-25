import json
import asyncio
import redis.asyncio as aioredis
from app.core.config import settings
from app.core.connection_manager import manager

class RedisBroker:
    def __init__(self):
        self.redis_client = None
        self.pubsub = None
        self.listen_task = None

    async def connect(self):
        try:
            self.redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
            self.pubsub = self.redis_client.pubsub()
            await self.pubsub.subscribe("chat_channel")
            self.listen_task = asyncio.create_task(self.listen())
            print("Connected to Redis Pub/Sub and subscribed to 'chat_channel'")
        except Exception as e:
            print(f"Failed to connect to Redis: {e}")

    async def publish(self, room_id: str, message: dict):
        if self.redis_client:
            payload = {
                "room_id": room_id,
                "message": message
            }
            await self.redis_client.publish("chat_channel", json.dumps(payload))

    async def listen(self):
        try:
            async for message in self.pubsub.listen():
                if message["type"] == "message":
                    try:
                        data = json.loads(message["data"])
                        room_id = data.get("room_id")
                        msg_payload = data.get("message")
                        if room_id and msg_payload:
                            await manager.broadcast_to_room(room_id, msg_payload)
                    except Exception as e:
                        print(f"Error handling broker message: {e}")
        except asyncio.CancelledError:
            pass
        except Exception as e:
            print(f"Redis Pub/Sub connection error: {e}")
            # Try to reconnect after a short delay
            await asyncio.sleep(5)
            await self.connect()

    async def disconnect(self):
        if self.listen_task:
            self.listen_task.cancel()
            try:
                await self.listen_task
            except asyncio.CancelledError:
                pass
        if self.pubsub:
            await self.pubsub.unsubscribe("chat_channel")
            await self.pubsub.close()
        if self.redis_client:
            await self.redis_client.close()

broker = RedisBroker()
