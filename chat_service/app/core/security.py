import httpx
from fastapi import Request, HTTPException, status
from jose import jwt, JWTError
from app.core.config import settings
from app.db.database import db

def verify_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("type") == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token cannot be used for access.",
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token.",
        )

async def fetch_user_from_main_server(token: str) -> dict:
    """
    Fetch user info from the main backend server using the access token.
    This dynamically registers / syncs user profiles in MongoDB.
    """
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            headers = {"Authorization": f"Bearer {token}"}
            cookies = {"access_token": token}
            response = await client.get(
                "http://fastapi:8000/api/v1/me", 
                headers=headers, 
                cookies=cookies
            )
            if response.status_code == 200:
                data = response.json()
                if "user" in data:
                    user_data = data["user"]
                    # Map properties to mongo schema
                    user_doc = {
                        "_id": user_data["id"],
                        "name": user_data["name"],
                        "email": user_data["email"],
                        "role": user_data["role"],
                        "company_id": user_data["company_id"],
                        "is_active": user_data.get("is_active", True)
                    }
                    # Upsert to MongoDB
                    await db.users.replace_one({"_id": user_doc["_id"]}, user_doc, upsert=True)
                    return user_doc
    except Exception as e:
        print(f"Error fetching user from main server: {e}")
    return None

async def get_current_user(request: Request):
    token = request.cookies.get("access_token")
    if not token:
        # Check header as fallback
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated. Access token missing.",
        )
    
    payload = verify_token(token)
    email = payload.get("sub")
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload: sub (email) is missing.",
        )
    
    # 1. Try to fetch from main server to ensure fresh profile info (role, company_id)
    user = await fetch_user_from_main_server(token)
    if not user:
        # 2. Fallback to cached MongoDB profile
        user = await db.users.find_one({"email": email})
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User profile could not be synchronized.",
        )
    
    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive.",
        )
    
    user["id"] = user["_id"]
    return user

async def get_ws_user(token: str) -> dict:
    if not token:
        raise ValueError("Token missing")
    payload = verify_token(token)
    email = payload.get("sub")
    if not email:
        raise ValueError("Invalid token payload: sub is missing")
        
    # 1. Try to fetch from main server to ensure fresh profile info
    user = await fetch_user_from_main_server(token)
    if not user:
        # 2. Fallback to cached MongoDB profile
        user = await db.users.find_one({"email": email})
        
    if not user:
        raise ValueError("User profile could not be synchronized.")
        
    if not user.get("is_active", True):
        raise ValueError("User inactive")
        
    user["id"] = user["_id"]
    return user

