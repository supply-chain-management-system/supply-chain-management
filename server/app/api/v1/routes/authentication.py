from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.schemas.auth.user import UserCreate, UserLogin
from app.services.auth.user_crud import create_user, get_user_by_email
from app.api.deps import get_db
from app.core.security import verify_password, create_access_token
from app.core.security import (
    verify_password,
    create_access_token,
    hash_password,
)

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

    user.password = hash_password(user.password)
    return create_user(db, user)


@router.post(
    "/login",
    summary="User Login",
    description="Logs in a user and returns a JWT access token.",
)
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = get_user_by_email(db, user.email)

    if not db_user or not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": db_user.email})

    return {"access_token": token, "token_type": "bearer"}
