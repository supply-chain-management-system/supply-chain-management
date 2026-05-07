from starlette.middleware.base import BaseHTTPMiddleware
from jose import jwt
from app.db.database import SessionLocal
from app.models.auth.user import User
from app.models.company.company import Company
import os

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = "HS256"


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        print(f"Processing request for path: {request.url.path}")

        request.state.schema = None

        public_paths = [
            "/api/v1/signup",
            "/api/v1/login",
            "/api/v1/company/setup",
        ]

        if request.url.path in public_paths:
            print(f"Allowing access to public path: {request.url.path}")
            return await call_next(request)

        token = request.cookies.get("access_token")

        if not token:
            print("Access token not found in cookies.")
            return await call_next(request)

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

            user_email = payload.get("sub")

            if not user_email:
                print("Invalid token payload.")
                return await call_next(request)

            db = SessionLocal()

            user = db.query(User).filter(User.email == user_email).first()

            if user and user.company_id:

                company = (
                    db.query(Company).filter(Company.id == user.company_id).first()
                )

                if company:
                    print(
                        f"Setting tenant schema for company: {company.name} (ID: {company.id})"
                    )
                    request.state.schema = company.schema_name

            db.close()

        except Exception as e:
            print("JWT decode error:", e)

        response = await call_next(request)
        return response
