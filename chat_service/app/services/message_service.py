from datetime import datetime
from bson import ObjectId
from app.db.database import db
from app.services.broker import broker

class MessageService:
    @staticmethod
    async def save_message(room_id: str, sender: dict, content: str, msg_type: str = "text") -> dict:
        message_doc = {
            "room_id": room_id,
            "sender_id": sender["id"],
            "sender_name": sender["name"],
            "sender_email": sender["email"],
            "content": content,
            "message_type": msg_type,
            "timestamp": datetime.utcnow().isoformat()
        }
        result = await db.messages.insert_one(message_doc)
        message_doc["id"] = str(result.inserted_id)
        if "_id" in message_doc:
            del message_doc["_id"]
            
        # Publish to Redis Pub/Sub so all instances broadcast to active users
        await broker.publish(room_id, message_doc)
        return message_doc

    @staticmethod
    async def get_messages(room_id: str, limit: int = 50, skip: int = 0) -> list:
        cursor = db.messages.find({"room_id": room_id}).sort("timestamp", -1).skip(skip).limit(limit)
        messages = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            messages.append(doc)
        # Reverse to return chronologically ordered history
        messages.reverse()
        return messages

    @staticmethod
    async def create_room(name: str, room_type: str, company_id: int = None, created_by: int = None) -> dict:
        # Avoid duplicate room creation for same company and name
        if company_id:
            existing = await db.rooms.find_one({"name": name, "company_id": company_id})
            if existing:
                existing["id"] = str(existing["_id"])
                del existing["_id"]
                return existing
        else:
            existing = await db.rooms.find_one({"name": name, "company_id": None})
            if existing:
                existing["id"] = str(existing["_id"])
                del existing["_id"]
                return existing
                
        # Initialize participant_ids list
        participant_ids = []
        if created_by:
            participant_ids.append(created_by)
            
        # If direct message room, parse user IDs from name e.g. direct_DM_A_B
        if room_type == "direct":
            parts = name.split("_")
            for p in parts:
                if p.isdigit():
                    uid = int(p)
                    if uid not in participant_ids:
                        participant_ids.append(uid)

        room_doc = {
            "name": name,
            "type": room_type,
            "company_id": company_id,
            "created_by": created_by,
            "created_at": datetime.utcnow().isoformat(),
            "description": "",
            "participant_ids": participant_ids
        }
        
        # General Chat is public to all company users
        if name.lower() == "general chat":
            room_doc["participant_ids"] = []
            
        result = await db.rooms.insert_one(room_doc)
        room_doc["id"] = str(result.inserted_id)
        if "_id" in room_doc:
            del room_doc["_id"]
        return room_doc

    @staticmethod
    async def get_rooms(company_id: int = None, user_id: int = None) -> list:
        # Query global rooms and rooms scoped to the company
        or_conditions = [{"company_id": None}]
        if company_id is not None:
            or_conditions.append({"company_id": company_id})
            
        query = {"$or": or_conditions}
        
        # Membership-based visibility matching:
        # User can only view:
        # - Rooms where participant_ids does not exist or is empty (public rooms like general chat)
        # - Rooms where the user is an active participant in participant_ids
        if user_id is not None:
            query = {
                "$and": [
                    {"$or": or_conditions},
                    {
                        "$or": [
                            {"participant_ids": {"$exists": False}},
                            {"participant_ids": {"$size": 0}},
                            {"participant_ids": user_id}
                        ]
                    }
                ]
            }
            
        cursor = db.rooms.find(query).sort("created_at", -1)
        rooms = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            del doc["_id"]
            doc["description"] = doc.get("description", "")
            doc["participant_ids"] = doc.get("participant_ids", [])
            rooms.append(doc)
        return rooms

    @staticmethod
    async def get_room(room_id: str) -> dict:
        try:
            doc = await db.rooms.find_one({"_id": ObjectId(room_id)})
            if doc:
                doc["id"] = str(doc["_id"])
                del doc["_id"]
                doc["description"] = doc.get("description", "")
                doc["participant_ids"] = doc.get("participant_ids", [])
                return doc
        except Exception:
            pass
        return None

    @staticmethod
    async def update_room(room_id: str, name: str = None, description: str = None) -> dict:
        update_fields = {}
        if name is not None:
            update_fields["name"] = name
        if description is not None:
            update_fields["description"] = description
            
        if update_fields:
            await db.rooms.update_one({"_id": ObjectId(room_id)}, {"$set": update_fields})
            
        return await MessageService.get_room(room_id)

    @staticmethod
    async def delete_room(room_id: str):
        # Delete room document
        await db.rooms.delete_one({"_id": ObjectId(room_id)})
        # Cascade delete all room messages
        await db.messages.delete_many({"room_id": room_id})

    @staticmethod
    async def invite_users_to_room(room_id: str, user_ids: list) -> dict:
        await db.rooms.update_one(
            {"_id": ObjectId(room_id)},
            {"$addToSet": {"participant_ids": {"$each": user_ids}}}
        )
        return await MessageService.get_room(room_id)
