

from requests import get

from app.db.database import engine, Base




from app.models.auth.user import User


from fastapi import FastAPI, Depends

import asyncio
import httpx
import websockets
from starlette.websockets import WebSocketState
import logging
from fastapi import FastAPI, Depends, Request, Response, WebSocket
from fastapi.responses import Response
from starlette.types import ASGIApp, Scope, Receive, Send

from app.services.auth.dependancy import require_role

from fastapi.middleware.cors import CORSMiddleware

from app.db.database import engine, Base

from app.models.auth.user import User
from app.models.company_auth.managers import InviteToken
from app.models.subscriptions import SubscriptionPlan



from app.models.business_manager import domain
from app.models.business_manager.team import (     # noqa — register models with BaseTenant metadata
    FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
)
from app.models.supplier_manager import supplier, inventory as inv_model, order as order_model # noqa

from app.middlewares.comapny.company_middleware import TenantMiddleware

from app.api.v1.routes.auth import authentication as auth
from app.api.v1.routes.auth import company_auth

from app.api.v1.routes.business_manager import dashboard as bm_dashboard
from app.api.v1.routes.business_manager import team as bm_team
from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.admin import admin_control as admin_control_routes
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card
from app.api.v1.routes.business_manager import factory_manager as bm_factory
from app.api.v1.routes.business_manager import logistics_manager
from app.api.v1.routes.business_manager import warehouse_manager
from app.api.v1.routes.supplier_manager import suppliers as sm_suppliers
from app.api.v1.routes.supplier_manager import inventory as sm_inventory
from app.api.v1.routes.supplier_manager import orders as sm_orders
from app.api.v1.routes.business_manager import supply_manager
from app.api.v1.routes.owner_routes import S_center_ai

from app.api.v1.routes import profile as auth_profile



from app.api.v1.routes.admin import admin_pages as admin_featuers
from app.api.v1.routes.company import company
from app.api.v1.routes.owner_routes import business_card



from app.api.v1.routes.sub_managers.warehouse_manager import api_warehouse
from app.api.v1.routes.sub_managers import request
from app.api.v1.routes.sub_managers.logistics_manager import logistics_dashboard





from app.api.v1.routes.sub_managers.factory_manager import production, team,factory_machine, factory_material
from app.api.v1.routes.sub_managers.factory_manager import analytics    

from app.api.v1.routes.elt import production_elt, warehouse_elt, logistics_elt

from app.api.v1.routes.elt import production_elt 




from app.api.v1.routes.auth import company_auth
from app.api.v1.routes.subscriptions import subscriptions
from app.db.database import SessionLocal
from app.services.subscriptions import seed_subscription_plans


app = FastAPI(
    title="FastAPI App",
    version="1.0.0",
    docs_url="/api/v1/docs",
    redoc_url="/api/v1/redoc",
    openapi_url="/api/v1/openapi.json",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(TenantMiddleware)

class PreflightASGIMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            # Extract origin header
            origin = b"https://korvex-d098b.web.app"
            for k, v in scope.get("headers", []):
                if k.lower() == b"origin":
                    origin = v
                    break

            if scope["method"] == "OPTIONS":
                headers = [
                    (b"access-control-allow-origin", origin),
                    (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS"),
                    (b"access-control-allow-headers", b"Authorization, Content-Type, X-Requested-With, Tenant-ID"),
                    (b"access-control-allow-credentials", b"true"),
                    (b"content-length", b"0")
                ]
                await send({
                    "type": "http.response.start",
                    "status": 200,
                    "headers": headers
                })
                await send({
                    "type": "http.response.body",
                    "body": b"",
                    "more_body": False
                })
                return

            async def cors_send(message: dict) -> None:
                if message["type"] == "http.response.start":
                    headers = list(message.get("headers", []))
                    
                    # Prevent duplicate CORS headers
                    cors_keys = {b"access-control-allow-origin", b"access-control-allow-methods", 
                                 b"access-control-allow-headers", b"access-control-allow-credentials"}
                    headers = [h for h in headers if h[0].lower() not in cors_keys]
                    
                    headers.extend([
                        (b"access-control-allow-origin", origin),
                        (b"access-control-allow-methods", b"GET, POST, PUT, DELETE, OPTIONS"),
                        (b"access-control-allow-headers", b"Authorization, Content-Type, X-Requested-With, Tenant-ID"),
                        (b"access-control-allow-credentials", b"true")
                    ])
                    message["headers"] = headers
                await send(message)

            await self.app(scope, receive, cors_send)
            return

        await self.app(scope, receive, send)

app.add_middleware(PreflightASGIMiddleware)

logger = logging.getLogger("uvicorn.error")

@app.middleware("http")
async def log_request_origin(request: Request, call_next):
    if request.method == "OPTIONS":
        return await call_next(request)
    origin = request.headers.get("origin")
    logger.info(f"Incoming request: {request.method} {request.url.path} | Origin: {origin or 'No Origin (Direct/Same-Origin)'}")
    response = await call_next(request)
    return response

app.add_middleware(TenantMiddleware)

@app.options("/{rest_of_path:path}")
async def preflight_handler(rest_of_path: str):
    return Response(status_code=200)


Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_subscription_plans(db)



# ── Core Auth ───────────────────────────────────────────────────────────────

app.include_router(auth.router, prefix="/api/v1")
app.include_router(auth_profile.router, prefix="/api/v1")
app.include_router(company_auth.router, prefix="/api/v1/company/auth")
app.include_router(company.router, prefix="/api/v1/company")


app.include_router(admin_featuers.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])
app.include_router(admin_control_routes.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])

# ── Admin ────────────────────────────────────────────────────────────────────
app.include_router(admin_featuers.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])
app.include_router(admin_control_routes.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner"]))])

# ── Business Manager ─────────────────────────────────────────────────────────

app.include_router(bm_dashboard.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(bm_dashboard.requests_router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager", "supply_manager", "warehouse_manager", "factory_manager", "logistics_manager"]))])
app.include_router(bm_team.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(bm_factory.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(logistics_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(warehouse_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])
app.include_router(supply_manager.router, prefix="/api/v1", dependencies=[Depends(require_role(["owner", "business_manager"]))])



# ── Supplier Manager ─────────────────────────────────────────────────────────

app.include_router(sm_suppliers.router, prefix="/api/v1", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])
app.include_router(sm_inventory.router, prefix="/api/v1/supplier-manager", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])
app.include_router(sm_orders.router, prefix="/api/v1/supplier-manager", dependencies=[Depends(require_role(["supply_manager", "owner", "business_manager"]))])



# ── Factory Sub-Manager ──────────────────────────────────────────────────────

app.include_router(production.router, prefix="/api/v1/production", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(team.router, prefix="/api/v1/factory_team", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(factory_machine.router, prefix="/api/v1/factory_machine", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(factory_material.router, prefix="/api/v1/factory_material", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(analytics.router, prefix="/api/v1/factory_analytics", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])
app.include_router(production_elt.router, prefix="/api/v1/elt", dependencies=[Depends(require_role(["factory_manager", "owner", "business_manager"]))])

app.include_router(warehouse_elt.router, prefix="/api/v1/elt", dependencies=[Depends(require_role(["warehouse_manager", "owner", "business_manager"]))])
app.include_router(logistics_elt.router, prefix="/api/v1/elt", dependencies=[Depends(require_role(["logistics_manager", "owner", "business_manager"]))])

app.include_router(api_warehouse.router, prefix="/api/v1", dependencies=[Depends(require_role(["warehouse_manager", "owner", "business_manager"]))])

app.include_router(logistics_dashboard.router, prefix="/api/v1", dependencies=[Depends(require_role(["logistics_manager", "owner", "business_manager"]))])



# ── Warehouse Sub-Manager ────────────────────────────────────────────────────
app.include_router(api_warehouse.router, prefix="/api/v1", dependencies=[Depends(require_role(["warehouse_manager", "owner", "business_manager"]))])

# ── Logistics Sub-Manager ────────────────────────────────────────────────────
app.include_router(logistics_dashboard.router, prefix="/api/v1", dependencies=[Depends(require_role(["logistics_manager", "owner", "business_manager"]))])

# ── Shared / Other ───────────────────────────────────────────────────────────

app.include_router(request.router, prefix="/api/v1", dependencies=[Depends(require_role(["factory_manager", "warehouse_manager", "owner", "business_manager"]))])
app.include_router(business_card.router, prefix="/api/v1", dependencies=[Depends(require_role(["admin", "owner", "business_manager"]))])
app.include_router(subscriptions.router, prefix="/api/v1")
app.include_router(S_center_ai.router, prefix="/api/v1")




CHAT_SERVICE_URL = "http://chat-service:8002"

@app.api_route("/api/v1/chat/{path:path}", methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"])
async def chat_proxy(request: Request, path: str):
    url = f"{CHAT_SERVICE_URL}/api/v1/chat/{path}"
    params = dict(request.query_params)
    headers = {k: v for k, v in request.headers.items() if k.lower() != "host"}
    
    body = None
    if request.method not in ("GET", "HEAD", "OPTIONS"):
        try:
            body = await request.body()
        except Exception:
            body = b""
            
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            resp = await client.request(
                method=request.method,
                url=url,
                params=params,
                headers=headers,
                content=body,
            )
            response_headers = {k: v for k, v in resp.headers.items() if k.lower() not in ("content-length", "content-encoding", "transfer-encoding")}
            return Response(
                content=resp.content,
                status_code=resp.status_code,
                headers=response_headers,
            )
        except Exception as e:
            return Response(content=f"Chat Service proxy error: {str(e)}", status_code=502)

@app.websocket("/ws/chat/{room_id}")
async def chat_websocket_proxy(websocket: WebSocket, room_id: str):
    await websocket.accept()
    query_string = ""
    if websocket.query_params:
         request_query = "&".join([f"{k}={v}" for k, v in websocket.query_params.items()])
         query_string = f"?{request_query}"
         
    target_url = f"ws://chat-service:8002/ws/chat/{room_id}{query_string}"
    headers = []
    cookie_header = websocket.headers.get("cookie")
    if cookie_header:
        headers.append(("Cookie", cookie_header))
        
    try:
        async with websockets.connect(target_url, additional_headers=headers) as target_ws:
            async def forward_to_target():
                try:
                    while True:
                        message = await websocket.receive_text()
                        await target_ws.send(message)
                except Exception:
                    pass

            async def forward_to_client():
                try:
                    while True:
                        message = await target_ws.recv()
                        await websocket.send_text(message)
                except Exception:
                    pass

            await asyncio.gather(forward_to_target(), forward_to_client())
    except Exception as e:
        print(f"WebSocket proxy error: {e}")
    finally:
        if websocket.client_state != WebSocketState.DISCONNECTED:
            await websocket.close()


@app.get("/")
def root():
    return {"message": "Welcome to FastAPI App"}
