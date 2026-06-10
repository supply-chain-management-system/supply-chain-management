from fastapi import HTTPException, Response, status
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from fastapi.responses import JSONResponse
from app.services.auth.user_crud import get_user_by_email
from app.core.security import (
    verify_password,
    create_access_token,
    create_refresh_token,
)
import os
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv()
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


def login_user(db: Session, email: str, password: str, response: Response):
    db_user = get_user_by_email(db, email)

    if not db_user or not verify_password(password, db_user.password):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email or password"
        )
    if not db_user.is_verified:
        return JSONResponse(
            status_code=status.HTTP_403_FORBIDDEN,
            content={
                "detail": "Email not verified",
                "user": {
                    "email": db_user.email,
                    "is_verified": False,
                },
            },
        )

    if not getattr(db_user, "is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="User account is inactive"
        )

    access_token = create_access_token(
        {"sub": db_user.email, "role": db_user.role.name if db_user.role else None}
    )

    refresh_token = create_refresh_token({"sub": db_user.email})

    response.set_cookie(
        key="access_token",
        value=access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 30,
    )
    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=60 * 60 * 24 * 7,
    )

    company = db_user.company

    from app.models.subscriptions.user_subscription import CompanySubscription
    active_plan = "free"
    if db_user.company_id:
        sub = db.query(CompanySubscription).filter(
            CompanySubscription.company_id == db_user.company_id,
            CompanySubscription.status == "ACTIVE"
        ).first()
        if sub:
            active_plan = sub.plan_slug

    return {
        "message": "Login successful",
        "user": {
            "email": db_user.email,
            "name": db_user.name,
            "role": db_user.role.name if db_user.role else None,
            "company_id": db_user.company_id,
            "is_verified": db_user.is_verified,
            "company_name": db_user.company.name if db_user.company else None,
            "public_id": db_user.company.public_id if db_user.company else None,
            "company_verified": (
                db_user.company.is_verified if db_user.company else False
            ),
            "active_plan": active_plan,
        },
    }


def refresh_access_token(request, response: Response):
    token = request.cookies.get("refresh_token")

    if not token:
        raise HTTPException(status_code=401, detail="Missing refresh token")

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])

        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token")

        new_access_token = create_access_token({"sub": payload["sub"]})

        response.set_cookie(
            key="access_token",
            value=new_access_token,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=60 * 30,
        )

        return {"message": "Token refreshed"}

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid refresh token")


def create_reset_token(email: str):
    payload = {"sub": email, "exp": datetime.utcnow() + timedelta(minutes=15)}

    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)
