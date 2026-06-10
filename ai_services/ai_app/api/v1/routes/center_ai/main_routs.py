from fastapi import APIRouter, HTTPException,status
from pydantic import BaseModel
from pymongo import MongoClient
import msgpack
from ai_app.core.celery_config import ai_celery_app
import os
router = APIRouter()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://mongodb:27017")
mongo_client = MongoClient(MONGO_URL)
db = mongo_client["korvex_ai_db"]


class CentralChatRequest(BaseModel):
    user_input: str
    tenant_schema: str
    user_role: str

@router.post("/internal/chat/{session_id}")
async def chat_with_central_agent(
    session_id: str,
    chat_request: CentralChatRequest,
):
    print("hello",chat_request.user_role)
    try:

        task = ai_celery_app.send_task(
            "ai_app.tasks.run_central_agent",
            kwargs={
                "user_input": chat_request.user_input,
                "session_id": session_id,
                "tenant_schema": chat_request.tenant_schema,
                "user_role": chat_request.user_role,
            },
            queue="ai_queue"
        )

        ai_reply = task.get(timeout=55)

        return {
            "reply": ai_reply
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.get("/internal/chat/history/{session_id}", status_code=status.HTTP_200_OK)
async def get_internal_agent_history(session_id: str):
    try:
        # 1. Grab the single most recent checkpoint
        checkpoints = db["checkpoints"].find(
            {"thread_id": session_id}
        ).sort("checkpoint_id", -1).limit(1)
        
        history_data = []
        
        for cp in checkpoints:
            checkpoint_field = cp.get("checkpoint")
            if not checkpoint_field:
                continue
                
            raw_bytes = checkpoint_field.bits if hasattr(checkpoint_field, "bits") else bytes(checkpoint_field)
            state_data = msgpack.loads(raw_bytes, strict_map_key=False)
            
            messages_list = state_data.get("channel_values", {}).get("messages", [])
            if not isinstance(messages_list, list):
                continue
            
            # 2. Brute-force loop through messages
            for msg in messages_list:
                content = ""
                sender_type = "human" # Default fallback
                
                # Filter out the hidden background system/tool outputs entirely
                raw_msg_str = str(msg).lower()
                if "toolmessage" in raw_msg_str or "systemmessage" in raw_msg_str:
                    continue
                
                # 3. Unpack LangChain's binary MessagePack ExtType (code 5)
                if hasattr(msg, "code") and msg.code == 5:
                    try:
                        inner_data = msgpack.loads(msg.data, strict_map_key=False)
                        
                        # inner_data is usually a list: ['langchain_core...', {'content': '...', ...}]
                        for item in inner_data:
                            # Figure out if it's AI or Human from the string signature
                            if isinstance(item, str):
                                if "human" in item.lower():
                                    sender_type = "human"
                                elif "ai" in item.lower():
                                    sender_type = "ai"
                                    
                            # Grab the actual text from the dictionary payload
                            if isinstance(item, dict):
                                content = item.get("content", "")
                    except Exception:
                        pass
                
                # Clean up the text
                if isinstance(content, str):
                    content = content.strip()
                else:
                    content = str(content).strip()
                
                # If the AI message is completely blank (because it tried to use a tool and crashed),
                # FORCE a placeholder string so it shows up in your React array!
                if sender_type == "ai" and not content:
                    content = "🔄 (Agent attempted to use tools or encountered an error)"
                
                # If a human message is somehow completely blank, skip it.
                if not content:
                    continue
                    
                history_data.append({
                    "type": sender_type,
                    "content": content
                })
                
        return {"history": history_data}
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Database extraction failed: {str(e)}"
        )