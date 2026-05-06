from urllib import response

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from app.schemas.auth import user
from sqlalchemy.orm import Session

from datetime import datetime, timedelta, timezone
from app.schemas.auth.user import UserCreate, UserLogin
from app.services.auth.user_crud import create_user, get_user_by_email
from app.db.deps import get_db, get_tenant_db
from app.core.security import create_refresh_token
from app.core.security import (
    create_access_token,
    hash_password,
)
from app.services.auth.user_crud import get_or_create_user
from app.services.auth.google_auth import verify_google_token
from .otp import generate_otp
from app.services.auth.jwt_services import login_user, refresh_access_token
from jose import jwt, JWTError
from app.services.email_service import send_verification_otp_email

router = APIRouter(tags=["authentication"])


@router.post(
    "/signup",
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
    description="Creates a new user account",
)
async def signup(user: UserCreate, db: Session = Depends(get_tenant_db)):
    existing_user = get_user_by_email(db, user.email)

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered"
        )

    hashed_password = hash_password(user.password)

    otp = generate_otp()
    new_user = create_user(
        db,
        name=user.name,
        email=user.email,
        password=hashed_password,
        otp_code=otp,
        otp_expiry=datetime.now(timezone.utc) + timedelta(minutes=3),
    )
    await send_verification_otp_email(new_user.email, new_user.name, otp=otp)
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
def login(user: UserLogin, response: Response, db: Session = Depends(get_tenant_db)):
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


@router.post(
    "/google",
    status_code=status.HTTP_200_OK,
    summary="Google Login",
    description="Login or register user using Google",
)
async def google_auth(
    request: Request, response: Response, db: Session = Depends(get_tenant_db)
):

    body = await request.json()
    token = body.get("code")

    if not token:
        raise HTTPException(status_code=400, detail="Token missing")

    idinfo = verify_google_token(code=token)

    if not idinfo:
        raise HTTPException(status_code=401, detail="Invalid Google token")

    email = idinfo.get("email")
    name = idinfo.get("name")
    google_id = idinfo.get("sub")

    if not email:
        raise HTTPException(status_code=400, detail="Email not available")

    user = get_user_by_email(db, email)

    if not user:
        user = create_user(
            db,
            name=name,
            email=email,
            password=None,
            otp_code=None,
            otp_expiry=None,
        )

    access_token = create_access_token({"sub": user.email, "user_id": user.id})

    refresh_token = create_refresh_token({"sub": user.email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 30,
        path="/",
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
        path="/",
    )

    return {
        "message": "Google login successful",
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "role": user.role.name if user.role else None,
            "company_id": user.company_id,
            "public_id": user.company.public_id if user.company else None,
            "company_name": user.company.name if user.company else None,
            "company_verified": (user.company.is_verified if user.company else False),
        },
    }
