from email.mime.text import MIMEText
import os
from urllib import response

from fastapi import APIRouter, Depends, HTTPException, Request, status, Response
from app.schemas.auth import user
from app.services.auth.dependancy import get_current_user
from sqlalchemy.orm import Session
from app.schemas.auth.user import (
    OTPVerifySchema,
    ResendOTPSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
)
from datetime import datetime, timedelta, timezone
from app.schemas.auth.user import UserCreate, UserLogin
from app.services.auth.user_crud import create_user, get_user_by_email
from app.db.deps import get_db, get_tenant_db
from app.core.security import create_refresh_token
from app.core.security import (
    create_access_token,
    hash_password,
)
from app.core.security import pwd_context
from app.services.auth.mail_service import send_reset_password_email
from app.models.auth.user import User
from app.services.auth.user_crud import get_or_create_user
from app.services.auth.google_auth import verify_google_token
from .otp import generate_otp
from app.services.auth.jwt_services import (
    login_user,
    refresh_access_token,
    create_reset_token,
)
import os
from dotenv import load_dotenv
from jose import jwt, JWTError
from app.services.email_service import send_verification_otp_email

router = APIRouter(tags=["authentication"])
load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"
FRONTEND_URL = os.getenv("FRONTEND_URL")


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
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="User Logout",
    description="Logs out user and clears tokens from cookies",
)
def logout(response: Response):
    response.delete_cookie(key="access_token")
    response.delete_cookie(key="refresh_token")
    # Explicitly force delete by setting max_age=0 and expires=0
    response.set_cookie(key="access_token", value="", max_age=0, expires=0, httponly=True)
    response.set_cookie(key="refresh_token", value="", max_age=0, expires=0, httponly=True)
    return {"message": "Logout successful"}



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
    print('hai iam ansil iam co,',access_token)

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


@router.post("/verify-otp")
async def verify_otp(data: OTPVerifySchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if user.otp_code != data.otp:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OTP"
        )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already verified"
        )

    if not user.otp_code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP not found"
        )

    if user.otp_expiry < datetime.utcnow():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="OTP expired"
        )

    user.is_verified = True
    user.otp_code = None
    user.otp_expiry = None

    db.commit()
    db.refresh(user)

    return {"success": True, "message": "OTP verified successfully"}


@router.post("/resend-otp")
async def resend_otp(data: ResendOTPSchema, db: Session = Depends(get_db)):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    if user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="User already verified"
        )

    otp = generate_otp()

    user.otp_code = otp
    user.otp_expiry = datetime.utcnow() + timedelta(minutes=5)

    db.commit()

    await send_verification_otp_email(user.email, user.name, otp=otp)
    print("NEW OTP:", otp)

    return {"success": True, "message": f"OTP sent to {user.email}"}


@router.post("/forgot-password")
async def forgot_password(
    data: ForgotPasswordSchema,
    db: Session = Depends(get_db),
):

    user = db.query(User).filter(User.email == data.email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    token = create_reset_token(user.email)

    reset_link = f"{FRONTEND_URL}/reset-password/{token}"

    await send_reset_password_email(
        email_to=user.email,
        user_name=user.name,
        reset_link=reset_link,
    )

    return {"message": "Password reset link sent successfully"}


@router.post("/reset-password")
def reset_password(
    data: ResetPasswordSchema,
    db: Session = Depends(get_db),
):

    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=400,
            detail="Passwords do not match",
        )

    try:
        payload = jwt.decode(
            data.token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
        )

        email = payload.get("sub")

        if not email:
            raise HTTPException(
                status_code=400,
                detail="Invalid token",
            )

    except JWTError:
        raise HTTPException(
            status_code=400,
            detail="Invalid or expired token",
        )

    user = db.query(User).filter(User.email == email).first()

    if not user:
        raise HTTPException(
            status_code=404,
            detail="User not found",
        )

    hashed_password = pwd_context.hash(data.password)

    user.password = hashed_password

    user.updated_at = datetime.utcnow()

    db.commit()

    return {"message": "Password reset successful"}


@router.get("/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):

    return {
        "user": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role.value if current_user.role else None,
            "company_id": current_user.company_id,
            "schema_name": current_user.company.schema_name if current_user.company else None,
            "company_verified": current_user.is_approved_company,
            "is_verified": current_user.is_verified,
            "is_active": current_user.is_active,
            "business_id": current_user.business_id,
        }
    }
