from starlette.middleware.base import BaseHTTPMiddleware


class TenantMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):

        tenant_id = request.headers.get("X-Tenant-ID")
        print(f"Received request for tenant ID: {tenant_id}")
        request.state.schema = None

        public_paths = [
            "/api/v1/signup",
            "/api/v1/login",
            "/api/v1/company/setup",
        ]

        if request.url.path in public_paths:
            return await call_next(request)

        if tenant_id:
            from app.db.database import SessionLocal
            from app.models.company.company import Company

            db = SessionLocal()
            company = db.query(Company).filter_by(public_id=tenant_id).first()
            db.close()

            if company:
                request.state.schema = company.schema_name

        response = await call_next(request)
        return response
