from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RoomCreate(BaseModel):
    name: str
    type: str = "group"  # group or direct

class RoomUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None

class InviteUsers(BaseModel):
    user_ids: List[int]

class RoomOut(BaseModel):
    id: str
    name: str
    type: str
    company_id: Optional[int] = None
    created_by: Optional[int] = None
    created_at: str
    description: Optional[str] = None
    participant_ids: Optional[List[int]] = None

class MessageOut(BaseModel):
    id: str
    room_id: str
    sender_id: int
    sender_name: str
    sender_email: str
    content: str
    message_type: str
    timestamp: str
    edited: bool = False

class NotificationOut(BaseModel):
    id: str
    user_id: int
    type: str
    title: str
    content: str
    room_id: str
    room_name: str
    invited_by_name: str
    created_at: str
    is_read: bool
    status: str = "pending"

class NotificationCreate(BaseModel):
    user_id: int
    room_id: str
    room_name: str
    invited_by_name: str

