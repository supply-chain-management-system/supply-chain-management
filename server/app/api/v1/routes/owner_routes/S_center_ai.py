from fastapi import APIRouter, Request, HTTPException
import httpx

router = APIRouter()


@router.post("/copilot/chat/{session_id}")
async def copilot_chat(
    session_id: str,
    request: Request,
    body: dict
):

    role = getattr(request.state, "role", None)
    schema = getattr(request.state, "schema", None)

    

    # Security check
    if not role or not schema:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    try:

        async with httpx.AsyncClient() as client:
            print("SENDING REQUEST TO AI SERVICE")
            response = await client.post(
                f"http://ai_service:8001/api/v1/internal/chat/{session_id}",
                json={
                    "user_input": body["user_input"],
                    "tenant_schema": schema,
                    "user_role": role
                }
            )

        return response.json()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    

@router.get("/copilot/history/{session_id}")
async def get_copilot_history(
    session_id: str,
    request: Request
):
    role = getattr(request.state, "role", None)
    schema = getattr(request.state, "schema", None)

    # 🔒 Keep security checks symmetric!
    if not role or not schema:
        raise HTTPException(
            status_code=401,
            detail="Unauthorized"
        )

    try:
        async with httpx.AsyncClient() as client:
            print("FETCHING HISTORY FROM INTERNAL AI SERVICE")
            response = await client.get(
                f"http://ai_service:8001/api/v1/internal/chat/history/{session_id}"
            )
        
        return response.json()

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )