from fastapi import APIRouter, Depends, HTTPException, Request, status
from app.schemas.auth import user
from sqlalchemy.orm import Session

from app.schemas.auth.user import UserCreate, UserLogin
from app.services.auth.user_crud import create_user, get_user_by_email
from app.api.deps import get_db
from app.core.security import create_refresh_token, verify_password, create_access_token
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password,
)

from jose import jwt, JWTError

router = APIRouter()


@router.post(
    "/signup",
    summary="Register a new user",
    description="Creates a new user account.",
    response_description="The created user object",
)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    return create_user(
        db,
        name=user.name,
        email=user.email,
        password=hashed_password,
    )


@router.post(
    "/login",
    summary="User Login",
    description="Logs in a user and returns a JWT access token.",
)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)
    print(f"Login attempt for email: {user.email}, User found: {db_user is not None}")
    print(
        verify_password(user.password, db_user.password)
        if db_user
        else "No user to verify"
    )
    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=400, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})
    refresh_token = create_refresh_token({"sub": db_user.email})
    return {
        "access_token": token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


@router.post(
    "/refresh",
    summary="Create access token with refresh token",
    description="Uses a refresh token to create a new access token.",
)
def refresh_token(request: Request):
    auth_header = request.headers.get("Authorization")

    if not auth_header:
        raise HTTPException(status_code=401, detail="Missing token")

    token = auth_header.split(" ")[1]

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")

        new_access_token = create_access_token({"sub": payload["sub"]})

        return {"access_token": new_access_token, "token_type": "bearer"}

    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
