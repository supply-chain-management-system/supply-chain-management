from fastapi import APIRouter, Depends, Query
from typing import List
from app.core.security import get_current_user
from app.schemas.chat_schemas import MessageOut
from app.services.message_service import MessageService

router = APIRouter()

@router.get("/rooms/{room_id}/messages", response_model=List[MessageOut])
async def get_room_messages(
    room_id: str,
    limit: int = Query(50, ge=1, le=100),
    skip: int = Query(0, ge=0),
    current_user = Depends(get_current_user)
):
    messages = await MessageService.get_messages(room_id=room_id, limit=limit, skip=skip)
    return messages
