from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query
from app.core.connection_manager import manager
from app.core.security import get_ws_user
from app.services.message_service import MessageService
from app.services.broker import broker
from app.db.database import db
from bson import ObjectId
import json

router = APIRouter()

@router.websocket("/ws/chat/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str, token: str = Query(None)):
    user = None
    try:
        # Check token parameter, or check the cookie 'access_token'
        if not token:
            token = websocket.cookies.get("access_token")
        
        if not token:
            # Check headers just in case clients can pass them (e.g. CLI tools)
            auth_header = websocket.headers.get("authorization")
            if auth_header and auth_header.startswith("Bearer "):
                token = auth_header.split(" ")[1]
 
        if not token:
            await websocket.close(code=4001, reason="Authentication token missing")
            return
            
        user = await get_ws_user(token)
    except Exception as e:
        await websocket.close(code=4002, reason=f"Authentication failed: {str(e)}")
        return
 
    # Accept the connection and register client
    await manager.connect(room_id, websocket)
    
    # Broadcast a system message that the user has joined the chat room
    await MessageService.save_message(
        room_id=room_id,
        sender={"id": 0, "name": "System", "email": "system@korvex.com"},
        content=f"{user['name']} has joined the chat.",
        msg_type="system"
    )
 
    try:
        while True:
            data = await websocket.receive_text()
            try:
                # Expecting JSON payloads
                payload = json.loads(data)
                msg_type = payload.get("type", "message")
                
                if msg_type == "typing":
                    # Broadcast typing status to room (without database persistence)
                    broadcast_payload = {
                        "type": "typing",
                        "sender_id": user["id"],
                        "sender_name": user["name"],
                        "is_typing": payload.get("is_typing", False)
                    }
                    await broker.publish(room_id, broadcast_payload)
                    
                elif msg_type == "reaction":
                    message_id = payload.get("message_id")
                    emoji = payload.get("emoji")
                    action = payload.get("action", "add") # add or remove
                    
                    if message_id and emoji:
                        # Update reaction in MongoDB
                        db_msg = await db.messages.find_one({"_id": ObjectId(message_id)})
                        if db_msg:
                            reactions = db_msg.get("reactions", {})
                            user_list = reactions.get(emoji, [])
                            
                            # Cast user["id"] to string or int for serialization consistency
                            uid = str(user["id"])
                            if action == "add":
                                if uid not in user_list:
                                    user_list.append(uid)
                            elif action == "remove":
                                if uid in user_list:
                                    user_list.remove(uid)
                                    
                            if not user_list:
                                reactions.pop(emoji, None)
                            else:
                                reactions[emoji] = user_list
                                
                            await db.messages.update_one(
                                {"_id": ObjectId(message_id)},
                                {"$set": {"reactions": reactions}}
                            )
                            
                            # Broadcast reaction update to room
                            broadcast_payload = {
                                "type": "reaction_update",
                                "message_id": message_id,
                                "reactions": reactions
                            }
                            await broker.publish(room_id, broadcast_payload)
                            
                elif msg_type == "edit":
                    message_id = payload.get("message_id")
                    content = payload.get("content")
                    if message_id and content:
                        await MessageService.edit_message(
                            message_id=message_id,
                            new_content=content,
                            sender_id=user["id"]
                        )
                else:
                    # Normal message
                    content = payload.get("content")
                    if content:
                        await MessageService.save_message(
                            room_id=room_id,
                            sender=user,
                            content=content,
                            msg_type="text"
                        )
            except json.JSONDecodeError:
                # Fallback to saving raw string if json parsing fails
                if data:
                    await MessageService.save_message(
                        room_id=room_id,
                        sender=user,
                        content=data,
                        msg_type="text"
                    )
            except Exception as e:
                print(f"Error handling websocket message: {e}")
    except WebSocketDisconnect:
        manager.disconnect(room_id, websocket)
        # Notify room of user departure
        await MessageService.save_message(
            room_id=room_id,
            sender={"id": 0, "name": "System", "email": "system@korvex.com"},
            content=f"{user['name']} left the chat.",
            msg_type="system"
        )

