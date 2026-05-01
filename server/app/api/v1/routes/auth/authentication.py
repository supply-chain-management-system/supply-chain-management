from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
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
from app.services.auth.jwt_services import login_user, refresh_access_token
from jose import jwt, JWTError

router = APIRouter(tags=["authentication"])


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account",
)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    new_user = create_user(
        db,
        name=user.name,
        email=user.email,
        password=hashed_password,
    )

    return {
        "message": "User created successfully",
        "user": {"id": new_user.id, "email": new_user.email, "name": new_user.name},
    }


@router.post(
    "/login",
    status_code=status.HTTP_200_OK,
    summary="User Login",
    description="Logs in user and sets tokens in cookies",
)
def login(user: UserLogin, response: Response, db: Session = Depends(get_db)):
    data = login_user(db, user.email, user.password, response)
    return data


@router.post(
    "/refresh",
    status_code=status.HTTP_200_OK,
    summary="Refresh Access Token",
    description="Generates new access token using refresh token from cookies",
)
def refresh(request: Request, response: Response):
    return refresh_access_token(request, response)
