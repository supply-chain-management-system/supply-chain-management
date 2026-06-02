from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Header
from typing import List, Optional
from datetime import datetime
import httpx
import logging
from app.core.security import get_current_user
from app.schemas.chat_schemas import RoomCreate, RoomOut, RoomUpdate, InviteUsers, NotificationOut, NotificationCreate
from app.services.message_service import MessageService
from app.db.database import db
from bson import ObjectId
from app.services.broker import broker
from app.core.config import settings

router = APIRouter()
logger = logging.getLogger("chat_rooms")

async def send_n8n_webhook(payload: dict):
    url = "http://n8n:5678/webhook/chat-invite"
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            response = await client.post(url, json=payload)
            if response.status_code >= 400:
                logger.warning(f"n8n webhook returned status code {response.status_code}")
            else:
                logger.info("Successfully sent invitation to n8n webhook")
    except Exception as e:
        logger.warning(f"Failed to connect to n8n webhook: {e}")

@router.post("/rooms", response_model=RoomOut)
async def create_room(room: RoomCreate, current_user = Depends(get_current_user)):
    company_id = current_user.get("company_id")
    new_room = await MessageService.create_room(
        name=room.name,
        room_type=room.type,
        company_id=company_id,
        created_by=current_user["id"]
    )
    return new_room

@router.get("/rooms", response_model=List[RoomOut])
async def list_rooms(current_user = Depends(get_current_user)):
    company_id = current_user.get("company_id")
    rooms = await MessageService.get_rooms(company_id=company_id, user_id=current_user["id"])
    
    # If no rooms are returned, bootstrap a default "General Chat" room
    if not rooms:
        default_room = await MessageService.create_room(
            name="General Chat",
            room_type="group",
            company_id=company_id,
            created_by=current_user["id"]
        )
        rooms = [default_room]
    return rooms

@router.patch("/rooms/{room_id}", response_model=RoomOut)
async def update_room(room_id: str, room_update: RoomUpdate, current_user = Depends(get_current_user)):
    room = await MessageService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    # Check permissions: only creator or admin can update details
    if room.get("created_by") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this group."
        )
        
    updated_room = await MessageService.update_room(room_id, room_update.name, room_update.description)
    
    # Broadcast system message
    sys_sender = {"id": 0, "name": "System", "email": "system@korvex.com"}
    change_msg = f"{current_user['name']} updated the group details."
    if room_update.name and room_update.name != room.get("name"):
        change_msg = f"{current_user['name']} changed the group name to '{room_update.name}'."
    
    await MessageService.save_message(
        room_id=room_id,
        sender=sys_sender,
        content=change_msg,
        msg_type="system"
    )
    
    return updated_room

@router.delete("/rooms/{room_id}")
async def delete_room(room_id: str, current_user = Depends(get_current_user)):
    room = await MessageService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    if room.get("type") == "direct":
        raise HTTPException(status_code=400, detail="Direct messaging rooms cannot be deleted.")
        
    # Check permissions: only creator or admin can delete room
    if room.get("created_by") != current_user["id"] and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this group."
        )
        
    await MessageService.delete_room(room_id)
    
    # Broadcast room deletion over Redis so all WS instances notify active clients
    await broker.publish(room_id, {"type": "room_deleted", "room_id": room_id})
    
    return {"message": "Room deleted successfully"}

@router.post("/rooms/{room_id}/invite", response_model=RoomOut)
async def invite_users(room_id: str, invite: InviteUsers, background_tasks: BackgroundTasks, current_user = Depends(get_current_user)):
    room = await MessageService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
        
    if room.get("type") == "direct":
        raise HTTPException(status_code=400, detail="Cannot invite members to a direct message room.")
        
    # Check membership check
    p_ids = room.get("participant_ids", [])
    if p_ids and current_user["id"] not in p_ids and current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a member of this group."
        )
        
    # Resolve invited users' names and emails
    invited_users_info = []
    invited_names = []
    async for u_doc in db.users.find({"_id": {"$in": invite.user_ids}}):
        name = u_doc.get("name", f"User {u_doc['_id']}")
        email = u_doc.get("email")
        invited_names.append(name)
        invited_users_info.append({
            "id": u_doc["_id"],
            "name": name,
            "email": email
        })
        
    if invited_names:
        invited_str = ", ".join(invited_names)
        sys_sender = {"id": 0, "name": "System", "email": "system@korvex.com"}
        await MessageService.save_message(
            room_id=room_id,
            sender=sys_sender,
            content=f"{current_user['name']} invited {invited_str} to the group.",
            msg_type="system"
        )
        
        # Trigger outbound webhook to n8n in background
        payload = {
            "room_id": room_id,
            "room_name": room.get("name"),
            "invited_by_id": current_user["id"],
            "invited_by_name": current_user["name"],
            "invitee_ids": invite.user_ids,
            "invited_names": invited_names,
            "invitees": invited_users_info
        }
        background_tasks.add_task(send_n8n_webhook, payload)
        
    return room

@router.post("/notifications", response_model=NotificationOut)
async def create_notification(data: NotificationCreate, x_internal_token: Optional[str] = Header(None)):
    if not x_internal_token or x_internal_token != settings.SECRET_KEY:
        raise HTTPException(status_code=401, detail="Unauthorized internal request")
        
    if not data.room_id or not data.room_id.strip():
        raise HTTPException(status_code=400, detail="room_id cannot be empty")
    if not data.room_name or not data.room_name.strip():
        raise HTTPException(status_code=400, detail="room_name cannot be empty")
    if not data.invited_by_name or not data.invited_by_name.strip():
        raise HTTPException(status_code=400, detail="invited_by_name cannot be empty")
        
    notif_doc = {
        "user_id": data.user_id,
        "type": "invite",
        "title": "Group Invitation",
        "content": f"{data.invited_by_name} invited you to join the group '{data.room_name}'",
        "room_id": data.room_id,
        "room_name": data.room_name,
        "invited_by_name": data.invited_by_name,
        "created_at": datetime.utcnow().isoformat(),
        "is_read": False,
        "status": "pending"
    }
    result = await db.notifications.insert_one(notif_doc)
    notif_doc["id"] = str(result.inserted_id)
    if "_id" in notif_doc:
        del notif_doc["_id"]
    return notif_doc

@router.get("/notifications", response_model=List[NotificationOut])
async def list_notifications(current_user = Depends(get_current_user)):
    cursor = db.notifications.find({"user_id": current_user["id"]}).sort("created_at", -1)
    notifications = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        del doc["_id"]
        if "status" not in doc:
            doc["status"] = "pending"
        notifications.append(doc)
    return notifications

@router.post("/notifications/{notif_id}/read")
async def mark_notification_as_read(notif_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
    
    result = await db.notifications.update_one(
        {"_id": obj_id, "user_id": current_user["id"]},
        {"$set": {"is_read": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Notification marked as read"}

@router.post("/notifications/read-all")
async def mark_all_notifications_as_read(current_user = Depends(get_current_user)):
    await db.notifications.update_many(
        {"user_id": current_user["id"], "is_read": False},
        {"$set": {"is_read": True}}
    )
    return {"message": "All notifications marked as read"}

@router.post("/notifications/{notif_id}/accept", response_model=RoomOut)
async def accept_invitation(notif_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    notif = await db.notifications.find_one({"_id": obj_id, "user_id": current_user["id"]})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notif.get("status") != "pending":
        raise HTTPException(status_code=400, detail=f"Invitation already {notif.get('status')}")
        
    room_id = notif.get("room_id")
    room = await MessageService.get_room(room_id)
    if not room:
        raise HTTPException(status_code=404, detail="Group room no longer exists")
        
    # Mark notification as accepted and read
    await db.notifications.update_one(
        {"_id": obj_id},
        {"$set": {"status": "accepted", "is_read": True}}
    )
    
    # Add user to participant list
    updated_room = await MessageService.invite_users_to_room(room_id, [current_user["id"]])
    
    # Save system message in the room
    sys_sender = {"id": 0, "name": "System", "email": "system@korvex.com"}
    await MessageService.save_message(
        room_id=room_id,
        sender=sys_sender,
        content=f"{current_user['name']} accepted the invitation and joined the group.",
        msg_type="system"
    )
    
    # Broadcast to other room members over Pub/Sub
    await broker.publish(room_id, {"type": "user_joined", "room_id": room_id, "user_id": current_user["id"], "user_name": current_user["name"]})
    
    return updated_room

@router.post("/notifications/{notif_id}/decline")
async def decline_invitation(notif_id: str, current_user = Depends(get_current_user)):
    try:
        obj_id = ObjectId(notif_id)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid notification ID")
        
    notif = await db.notifications.find_one({"_id": obj_id, "user_id": current_user["id"]})
    if not notif:
        raise HTTPException(status_code=404, detail="Notification not found")
        
    if notif.get("status") != "pending":
        raise HTTPException(status_code=400, detail=f"Invitation already {notif.get('status')}")
        
    # Mark notification as declined and read
    await db.notifications.update_one(
        {"_id": obj_id},
        {"$set": {"status": "declined", "is_read": True}}
    )
    
    return {"message": "Invitation declined"}
