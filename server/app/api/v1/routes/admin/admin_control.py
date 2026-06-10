"""
admin_control.py
================
Full business control endpoints for the Admin role.
Uses get_tenant_db (schema resolved from the admin's JWT cookie via TenantMiddleware)
and get_db for public-schema entities (User, Company, InviteToken).

All sections:
  1.  System Overview  — GET /admin/overview
  2.  Users            — CRUD on public.users
  3.  Companies        — CRUD on public.companies
  4.  Factory Managers — CRUD on tenant.factory_managers
  5.  Warehouse Mgrs   — CRUD on tenant.warehouse_managers
  6.  Logistics Mgrs   — CRUD on tenant.logistics_managers
  7.  Supply Managers  — CRUD on tenant.supply_managers
  8.  Suppliers        — CRUD on tenant.suppliers
  9.  Requests/Apprvl  — CRUD on tenant.approvals
  10. Inventory        — CRUD on tenant.inventory
  11. Invite Tokens    — CRUD on public.invite_tokens
"""

import uuid
from datetime import datetime
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel, EmailStr
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.db.deps import get_db, get_tenant_db
from app.services.auth.dependancy import get_current_user

# ── Public-schema models ──────────────────────────────────────────────────────
from app.models.auth.user import User, UserProfile, RoleEnum
from app.models.company.company import Company, CompanyMode
from app.models.company_auth.managers import InviteToken

# ── Tenant-schema models ──────────────────────────────────────────────────────
from app.models.business_manager.team import (
    FactoryManager, WarehouseManager, LogisticsManager, SupplyManager
)
from app.models.business_manager.domain import Inventory, Approval
from app.models.supplier_manager.supplier import Supplier

from app.api.v1.routes.admin.emailsend import send_invite_email

router = APIRouter(prefix="/admin", tags=["Admin — Full Business Control"])


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 1 — SYSTEM OVERVIEW
# ══════════════════════════════════════════════════════════════════════════════

@router.get("/overview", summary="System-wide KPI dashboard")
def get_admin_overview(
    pub_db: Session = Depends(get_db),
    ten_db: Session = Depends(get_tenant_db),
    current_user: User = Depends(get_current_user),
):
    """Returns aggregated counts for the admin dashboard."""
    try:
        if current_user.company_id:
            total_users = pub_db.query(User).filter(
                User.company_id == current_user.company_id,
                User.role != RoleEnum.owner,
                User.role != RoleEnum.admin
            ).count()
        else:
            total_users = pub_db.query(User).count()

        total_companies = pub_db.query(Company).count()
        total_invites = pub_db.query(InviteToken).count()

        # Group companies by mode
        personal_companies = pub_db.query(Company).filter(Company.mode == CompanyMode.personal).count()
        team_companies = pub_db.query(Company).filter(Company.mode == CompanyMode.team).count()
        enterprise_companies = pub_db.query(Company).filter(Company.mode == CompanyMode.enterprise).count()

        users_by_role = {}
        for role in RoleEnum:
            query = pub_db.query(User).filter(User.role == role)
            if current_user.company_id:
                query = query.filter(User.company_id == current_user.company_id)
            users_by_role[role.value] = query.count()

        # Tenant-schema counts
        factory_managers = ten_db.query(FactoryManager).count()
        warehouse_managers = ten_db.query(WarehouseManager).count()
        logistics_managers = ten_db.query(LogisticsManager).count()
        supply_managers = ten_db.query(SupplyManager).count()

        total_suppliers = ten_db.query(Supplier).count()
        active_suppliers = ten_db.query(Supplier).filter(Supplier.is_active == True).count()

        total_inventory_items = ten_db.query(Inventory).count()
        total_inventory_qty = ten_db.query(func.sum(Inventory.qty)).scalar() or 0

        pending_requests = ten_db.query(Approval).filter(
            Approval.status.in_(["pending", "PENDING_WHM_APPROVAL"])
        ).count()
        approved_requests = ten_db.query(Approval).filter(Approval.status == "APPROVED").count()
        rejected_requests = ten_db.query(Approval).filter(Approval.status == "REJECTED").count()

        return {
            "users": {
                "total": total_users,
                "by_role": users_by_role,
            },
            "companies": {
                "total": total_companies,
                "personal": personal_companies,
                "team": team_companies,
                "enterprise": enterprise_companies,
            },
            "invites": {
                "total": total_invites,
            },
            "managers": {
                "factory": factory_managers,
                "warehouse": warehouse_managers,
                "logistics": logistics_managers,
                "supply": supply_managers,
                "total": factory_managers + warehouse_managers + logistics_managers + supply_managers,
            },
            "suppliers": {
                "total": total_suppliers,
                "active": active_suppliers,
            },
            "inventory": {
                "items": total_inventory_items,
                "total_qty": int(total_inventory_qty),
            },
            "requests": {
                "pending": pending_requests,
                "approved": approved_requests,
                "rejected": rejected_requests,
                "total": pending_requests + approved_requests + rejected_requests,
            },
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Overview error: {str(e)}")


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 2 — USER MANAGEMENT  (public.users)
# ══════════════════════════════════════════════════════════════════════════════

class UserUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[str] = None
    is_active: Optional[bool] = None


@router.get("/users", summary="List all users")
def list_users(
    role: Optional[str] = Query(None, description="Filter by role"),
    company_id: Optional[int] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * size
    query = db.query(User)
    if role:
        try:
            query = query.filter(User.role == RoleEnum(role))
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {role}")
    if company_id:
        query = query.filter(User.company_id == company_id)

    total = query.count()
    users = query.order_by(User.id.desc()).offset(skip).limit(size).all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [
            {
                "id": u.id,
                "name": u.name,
                "email": u.email,
                "role": u.role.value if u.role else None,
                "company_id": u.company_id,
                "is_active": u.is_active,
                "is_verified": u.is_verified,
                "created_at": u.created_at,
            }
            for u in users
        ],
    }


@router.get("/users/{user_id}", summary="Single user detail")
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    profile = user.profile
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "role": user.role.value if user.role else None,
        "company_id": user.company_id,
        "business_id": user.business_id,
        "is_active": user.is_active,
        "is_verified": user.is_verified,
        "created_at": user.created_at,
        "profile": {
            "phone": profile.phone if profile else None,
            "job_title": profile.job_title if profile else None,
            "department": profile.department if profile else None,
            "location": profile.location if profile else None,
            "bio": profile.bio if profile else None,
        } if profile else None,
    }


@router.put("/users/{user_id}", summary="Edit a user")
def update_user(user_id: int, data: UserUpdateSchema, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if data.email and data.email != user.email:
        existing = db.query(User).filter(User.email == data.email).first()
        if existing:
            raise HTTPException(status_code=409, detail="Email already in use")
        user.email = data.email

    if data.name:
        user.name = data.name
    if data.is_active is not None:
        user.is_active = data.is_active
    if data.role:
        try:
            user.role = RoleEnum(data.role)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid role: {data.role}")

    try:
        db.commit()
        db.refresh(user)
        return {"status": "success", "id": user.id, "name": user.name, "email": user.email}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/users/{user_id}", summary="Delete a user")
def delete_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    try:
        db.delete(user)
        db.commit()
        return {"status": "success", "message": f"User {user_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/users/{user_id}/toggle-active", summary="Toggle user active state")
def toggle_user_active(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.is_active = not user.is_active
    db.commit()
    return {"status": "success", "is_active": user.is_active}


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 3 — COMPANY MANAGEMENT  (public.companies)
# ══════════════════════════════════════════════════════════════════════════════

class CompanyUpdateSchema(BaseModel):
    name: Optional[str] = None
    industry: Optional[str] = None
    company_size: Optional[str] = None
    address: Optional[str] = None
    country: Optional[str] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    is_active: Optional[bool] = None
    is_verified: Optional[bool] = None


@router.get("/companies", summary="List all companies")
def list_companies(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * size
    total = db.query(Company).count()
    companies = db.query(Company).order_by(Company.id.desc()).offset(skip).limit(size).all()

    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [
            {
                "id": c.id,
                "name": c.name,
                "industry": c.industry,
                "company_size": c.company_size,
                "mode": c.mode.value if c.mode else None,
                "schema_name": c.schema_name,
                "public_id": c.public_id,
                "is_active": c.is_active,
                "is_verified": c.is_verified,
                "owner_email": c.owner_email,
                "country": c.country,
                "created_at": c.created_at,
                "user_count": len(c.users),
            }
            for c in companies
        ],
    }


@router.get("/companies/{company_id}", summary="Single company detail")
def get_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    return {
        "id": company.id,
        "name": company.name,
        "industry": company.industry,
        "company_size": company.company_size,
        "mode": company.mode.value if company.mode else None,
        "schema_name": company.schema_name,
        "public_id": company.public_id,
        "registration_number": company.registration_number,
        "website": company.website,
        "address": company.address,
        "country": company.country,
        "phone": company.phone,
        "owner_email": company.owner_email,
        "is_active": company.is_active,
        "is_verified": company.is_verified,
        "is_profile_complete": company.is_profile_complete,
        "created_at": company.created_at,
        "updated_at": company.updated_at,
        "users": [
            {"id": u.id, "name": u.name, "email": u.email, "role": u.role.value if u.role else None}
            for u in company.users
        ],
    }


@router.put("/companies/{company_id}", summary="Edit a company")
def update_company(company_id: int, data: CompanyUpdateSchema, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(company, key, value)
    try:
        db.commit()
        db.refresh(company)
        return {"status": "success", "id": company.id, "name": company.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/companies/{company_id}", summary="Delete a company")
def delete_company(company_id: int, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    try:
        db.delete(company)
        db.commit()
        return {"status": "success", "message": f"Company {company_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 4 — FACTORY MANAGER CONTROL  (tenant.factory_managers)
# ══════════════════════════════════════════════════════════════════════════════

class FMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: str = "Day"
    department: str = "Assembly"
    factory_id: Optional[int] = 1
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class FMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shift: Optional[str] = None
    department: Optional[str] = None
    factory_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


@router.get("/factory-managers", summary="List all factory managers")
def list_factory_managers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(FactoryManager).filter(FactoryManager.role == "factory_manager")
    total = query.count()
    items = query.order_by(FactoryManager.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total,
        "page": page,
        "size": size,
        "items": [
            {
                "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
                "shift": m.shift, "department": m.department, "role": m.role,
                "factory_id": m.factory_id, "business_id": m.business_id,
                "business_card_id": m.business_card_id, "is_used": m.is_used,
                "size": m.size, "tagline": m.tagline, "description": m.description,
                "color": m.color, "created_at": m.created_at,
            }
            for m in items
        ],
    }


@router.get("/factory-managers/{manager_id}", summary="Get one factory manager")
def get_factory_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(FactoryManager).filter(FactoryManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Factory Manager not found")
    return {
        "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
        "shift": m.shift, "department": m.department, "role": m.role,
        "factory_id": m.factory_id, "business_id": m.business_id,
        "business_card_id": m.business_card_id, "is_used": m.is_used,
        "size": m.size, "tagline": m.tagline, "description": m.description,
        "color": m.color, "created_at": m.created_at,
    }


@router.post("/factory-managers", status_code=status.HTTP_201_CREATED, summary="Create factory manager")
def create_factory_manager(data: FMCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(FactoryManager).filter(FactoryManager.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    m = FactoryManager(
        name=data.name, email=data.email, phone=data.phone,
        shift=data.shift, department=data.department,
        factory_id=data.factory_id, business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size, tagline=data.tagline, description=data.description,
        color=data.color, role="factory_manager", is_used=False,
    )
    try:
        db.add(m)
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/factory-managers/{manager_id}", summary="Edit factory manager")
def update_factory_manager(manager_id: int, data: FMUpdateSchema, db: Session = Depends(get_tenant_db)):
    m = db.query(FactoryManager).filter(FactoryManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Factory Manager not found")
    if data.email and data.email != m.email:
        if db.query(FactoryManager).filter(FactoryManager.email == data.email).first():
            raise HTTPException(status_code=409, detail="Email already in use")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(m, key, value)
    try:
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/factory-managers/{manager_id}", summary="Delete factory manager")
def delete_factory_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(FactoryManager).filter(FactoryManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Factory Manager not found")
    try:
        db.delete(m)
        db.commit()
        return {"status": "success", "message": f"Factory Manager {manager_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 5 — WAREHOUSE MANAGER CONTROL  (tenant.warehouse_managers)
# ══════════════════════════════════════════════════════════════════════════════

class WHMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: str = "Day"
    zone: str = "General Storage"
    warehouse_id: Optional[int] = 1
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class WHMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shift: Optional[str] = None
    zone: Optional[str] = None
    warehouse_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


@router.get("/warehouse-managers", summary="List all warehouse managers")
def list_warehouse_managers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(WarehouseManager)
    total = query.count()
    items = query.order_by(WarehouseManager.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
                "shift": m.shift, "zone": m.zone, "department": m.department,
                "warehouse_id": m.warehouse_id, "business_id": m.business_id,
                "business_card_id": m.business_card_id, "is_used": m.is_used,
                "size": m.size, "tagline": m.tagline, "description": m.description,
                "color": m.color, "created_at": m.created_at,
            }
            for m in items
        ],
    }


@router.get("/warehouse-managers/{manager_id}", summary="Get one warehouse manager")
def get_warehouse_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(WarehouseManager).filter(WarehouseManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Warehouse Manager not found")
    return {
        "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
        "shift": m.shift, "zone": m.zone, "department": m.department,
        "warehouse_id": m.warehouse_id, "business_id": m.business_id,
        "business_card_id": m.business_card_id, "is_used": m.is_used,
        "size": m.size, "tagline": m.tagline, "description": m.description,
        "color": m.color, "created_at": m.created_at,
    }


@router.post("/warehouse-managers", status_code=status.HTTP_201_CREATED, summary="Create warehouse manager")
def create_warehouse_manager(data: WHMCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(WarehouseManager).filter(WarehouseManager.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    m = WarehouseManager(
        name=data.name, email=data.email, phone=data.phone,
        shift=data.shift, zone=data.zone, department=data.zone,
        warehouse_id=data.warehouse_id, business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size, tagline=data.tagline, description=data.description,
        color=data.color, is_used=False,
    )
    try:
        db.add(m)
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/warehouse-managers/{manager_id}", summary="Edit warehouse manager")
def update_warehouse_manager(manager_id: int, data: WHMUpdateSchema, db: Session = Depends(get_tenant_db)):
    m = db.query(WarehouseManager).filter(WarehouseManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Warehouse Manager not found")
    if data.email and data.email != m.email:
        if db.query(WarehouseManager).filter(WarehouseManager.email == data.email).first():
            raise HTTPException(status_code=409, detail="Email already in use")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(m, key, value)
    if data.zone:
        m.department = data.zone
    try:
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/warehouse-managers/{manager_id}", summary="Delete warehouse manager")
def delete_warehouse_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(WarehouseManager).filter(WarehouseManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Warehouse Manager not found")
    try:
        db.delete(m)
        db.commit()
        return {"status": "success", "message": f"Warehouse Manager {manager_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 6 — LOGISTICS MANAGER CONTROL  (tenant.logistics_managers)
# ══════════════════════════════════════════════════════════════════════════════

class LMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    shift: str = "Day"
    route: str = "Local"
    hub_id: Optional[int] = 1
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class LMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    shift: Optional[str] = None
    route: Optional[str] = None
    hub_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


@router.get("/logistics-managers", summary="List all logistics managers")
def list_logistics_managers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(LogisticsManager)
    total = query.count()
    items = query.order_by(LogisticsManager.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
                "shift": m.shift, "route": m.route, "department": m.department,
                "hub_id": m.hub_id, "business_id": m.business_id,
                "business_card_id": m.business_card_id,
                "is_active": m.is_active, "is_used": m.is_used,
                "size": m.size, "tagline": m.tagline, "description": m.description,
                "color": m.color, "created_at": m.created_at,
            }
            for m in items
        ],
    }


@router.get("/logistics-managers/{manager_id}", summary="Get one logistics manager")
def get_logistics_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(LogisticsManager).filter(LogisticsManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Logistics Manager not found")
    return {
        "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
        "shift": m.shift, "route": m.route, "department": m.department,
        "hub_id": m.hub_id, "business_id": m.business_id,
        "business_card_id": m.business_card_id,
        "is_active": m.is_active, "is_used": m.is_used,
        "size": m.size, "tagline": m.tagline, "description": m.description,
        "color": m.color, "created_at": m.created_at,
    }


@router.post("/logistics-managers", status_code=status.HTTP_201_CREATED, summary="Create logistics manager")
def create_logistics_manager(data: LMCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(LogisticsManager).filter(LogisticsManager.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    m = LogisticsManager(
        name=data.name, email=data.email, phone=data.phone,
        shift=data.shift, route=data.route, department=data.route,
        hub_id=data.hub_id, business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size, tagline=data.tagline, description=data.description,
        color=data.color, is_active=False, is_used=False,
    )
    try:
        db.add(m)
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/logistics-managers/{manager_id}", summary="Edit logistics manager")
def update_logistics_manager(manager_id: int, data: LMUpdateSchema, db: Session = Depends(get_tenant_db)):
    m = db.query(LogisticsManager).filter(LogisticsManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Logistics Manager not found")
    if data.email and data.email != m.email:
        if db.query(LogisticsManager).filter(LogisticsManager.email == data.email).first():
            raise HTTPException(status_code=409, detail="Email already in use")
    for key, value in data.model_dump(exclude_unset=True).items():
        if key == "hub_id":
            m.hub_id = value
        else:
            setattr(m, key, value)
    if data.route:
        m.department = data.route
    try:
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/logistics-managers/{manager_id}", summary="Delete logistics manager")
def delete_logistics_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(LogisticsManager).filter(LogisticsManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Logistics Manager not found")
    try:
        db.delete(m)
        db.commit()
        return {"status": "success", "message": f"Logistics Manager {manager_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 7 — SUPPLY MANAGER CONTROL  (tenant.supply_managers)
# ══════════════════════════════════════════════════════════════════════════════

class SMCreateSchema(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    category: str = "Electronics"
    region: str = "Domestic"
    department: str = "Procurement"
    supplier_id: Optional[int] = None
    business_id: Optional[int] = 1
    business_card_id: Optional[int] = None
    size: Optional[str] = "Standard"
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = "#185FA5"


class SMUpdateSchema(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    category: Optional[str] = None
    region: Optional[str] = None
    department: Optional[str] = None
    supplier_id: Optional[int] = None
    business_id: Optional[int] = None
    business_card_id: Optional[int] = None
    size: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None


@router.get("/supply-managers", summary="List all supply managers")
def list_supply_managers(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(SupplyManager)
    total = query.count()
    items = query.order_by(SupplyManager.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
                "category": m.category, "region": m.region, "department": m.department,
                "supplier_id": m.supplier_id, "business_id": m.business_id,
                "business_card_id": m.business_card_id,
                "is_active": m.is_active, "is_used": m.is_used,
                "size": m.size, "tagline": m.tagline, "description": m.description,
                "color": m.color, "created_at": m.created_at,
            }
            for m in items
        ],
    }


@router.get("/supply-managers/{manager_id}", summary="Get one supply manager")
def get_supply_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(SupplyManager).filter(SupplyManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Supply Manager not found")
    return {
        "id": m.id, "name": m.name, "email": m.email, "phone": m.phone,
        "category": m.category, "region": m.region, "department": m.department,
        "supplier_id": m.supplier_id, "business_id": m.business_id,
        "business_card_id": m.business_card_id,
        "is_active": m.is_active, "is_used": m.is_used,
        "size": m.size, "tagline": m.tagline, "description": m.description,
        "color": m.color, "created_at": m.created_at,
    }


@router.post("/supply-managers", status_code=status.HTTP_201_CREATED, summary="Create supply manager")
def create_supply_manager(data: SMCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(SupplyManager).filter(SupplyManager.email == data.email).first()
    if existing:
        raise HTTPException(status_code=409, detail="Email already in use")
    m = SupplyManager(
        name=data.name, email=data.email, phone=data.phone,
        category=data.category, region=data.region, department=data.department,
        supplier_id=data.supplier_id, business_id=data.business_id,
        business_card_id=data.business_card_id,
        size=data.size, tagline=data.tagline, description=data.description,
        color=data.color, is_active=False, is_used=False,
    )
    try:
        db.add(m)
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/supply-managers/{manager_id}", summary="Edit supply manager")
def update_supply_manager(manager_id: int, data: SMUpdateSchema, db: Session = Depends(get_tenant_db)):
    m = db.query(SupplyManager).filter(SupplyManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Supply Manager not found")
    if data.email and data.email != m.email:
        if db.query(SupplyManager).filter(SupplyManager.email == data.email).first():
            raise HTTPException(status_code=409, detail="Email already in use")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(m, key, value)
    try:
        db.commit()
        db.refresh(m)
        return {"status": "success", "id": m.id, "name": m.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/supply-managers/{manager_id}", summary="Delete supply manager")
def delete_supply_manager(manager_id: int, db: Session = Depends(get_tenant_db)):
    m = db.query(SupplyManager).filter(SupplyManager.id == manager_id).first()
    if not m:
        raise HTTPException(status_code=404, detail="Supply Manager not found")
    try:
        db.delete(m)
        db.commit()
        return {"status": "success", "message": f"Supply Manager {manager_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 8 — SUPPLIER MANAGEMENT  (tenant.suppliers)
# ══════════════════════════════════════════════════════════════════════════════

class SupplierCreateSchema(BaseModel):
    name: str
    category: str
    contact_email: str
    phone: Optional[str] = None
    lead_time_days: int = 7
    rating: float = 5.0
    business_id: int = 1
    manager_id: Optional[int] = None


class SupplierUpdateSchema(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    contact_email: Optional[str] = None
    phone: Optional[str] = None
    lead_time_days: Optional[int] = None
    rating: Optional[float] = None
    is_active: Optional[bool] = None
    business_id: Optional[int] = None
    manager_id: Optional[int] = None


@router.get("/suppliers", summary="List all suppliers")
def list_suppliers(
    is_active: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(Supplier)
    if is_active is not None:
        query = query.filter(Supplier.is_active == is_active)
    total = query.count()
    items = query.order_by(Supplier.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": s.id, "name": s.name, "category": s.category,
                "contact_email": s.contact_email, "phone": s.phone,
                "lead_time_days": s.lead_time_days, "rating": s.rating,
                "is_active": s.is_active, "business_id": s.business_id,
                "manager_id": s.manager_id, "created_at": s.created_at,
            }
            for s in items
        ],
    }


@router.get("/suppliers/{supplier_id}", summary="Get one supplier")
def get_supplier(supplier_id: int, db: Session = Depends(get_tenant_db)):
    s = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {
        "id": s.id, "name": s.name, "category": s.category,
        "contact_email": s.contact_email, "phone": s.phone,
        "lead_time_days": s.lead_time_days, "rating": s.rating,
        "is_active": s.is_active, "business_id": s.business_id,
        "manager_id": s.manager_id, "created_at": s.created_at,
    }


@router.post("/suppliers", status_code=status.HTTP_201_CREATED, summary="Create supplier")
def create_supplier(data: SupplierCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(Supplier).filter(Supplier.name == data.name).first()
    if existing:
        raise HTTPException(status_code=409, detail="Supplier name already exists")
    s = Supplier(
        name=data.name, category=data.category, contact_email=data.contact_email,
        phone=data.phone, lead_time_days=data.lead_time_days, rating=data.rating,
        business_id=data.business_id, manager_id=data.manager_id, is_active=True,
    )
    try:
        db.add(s)
        db.commit()
        db.refresh(s)
        return {"status": "success", "id": s.id, "name": s.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/suppliers/{supplier_id}", summary="Edit supplier")
def update_supplier(supplier_id: int, data: SupplierUpdateSchema, db: Session = Depends(get_tenant_db)):
    s = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(s, key, value)
    try:
        db.commit()
        db.refresh(s)
        return {"status": "success", "id": s.id, "name": s.name}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/suppliers/{supplier_id}", summary="Delete supplier")
def delete_supplier(supplier_id: int, db: Session = Depends(get_tenant_db)):
    s = db.query(Supplier).filter(Supplier.id == supplier_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Supplier not found")
    try:
        db.delete(s)
        db.commit()
        return {"status": "success", "message": f"Supplier {supplier_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 9 — REQUESTS & APPROVALS  (tenant.approvals)
# ══════════════════════════════════════════════════════════════════════════════

class ApprovalActionSchema(BaseModel):
    action: str  # "APPROVE" or "REJECT"


class ApprovalCreateSchema(BaseModel):
    type: str
    description: str
    priority: Optional[str] = "standard"
    role: Optional[str] = "admin"
    requester_id: Optional[int] = 0


@router.get("/requests", summary="List all requests/approvals")
def list_requests(
    request_status: Optional[str] = Query(None, alias="status"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(Approval)
    if request_status:
        query = query.filter(Approval.status == request_status)
    total = query.count()
    items = query.order_by(Approval.created_at.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": r.id, "type": r.type, "status": r.status,
                "payload": r.payload, "requester_id": r.requester_id,
                "reviewer_id": r.reviewer_id, "created_at": r.created_at,
            }
            for r in items
        ],
    }


@router.get("/requests/{request_id}", summary="Get one request")
def get_request(request_id: int, db: Session = Depends(get_tenant_db)):
    r = db.query(Approval).filter(Approval.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    return {
        "id": r.id, "type": r.type, "status": r.status,
        "payload": r.payload, "requester_id": r.requester_id,
        "reviewer_id": r.reviewer_id, "created_at": r.created_at,
    }


@router.post("/requests", status_code=status.HTTP_201_CREATED, summary="Create a request")
def create_request(data: ApprovalCreateSchema, db: Session = Depends(get_tenant_db)):
    r = Approval(
        type=data.type,
        payload={
            "alert_message": data.description,
            "role": data.role,
            "priority": data.priority,
        },
        status="pending",
        requester_id=data.requester_id or 0,
    )
    try:
        db.add(r)
        db.commit()
        db.refresh(r)
        return {"status": "success", "id": r.id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/requests/{request_id}/action", summary="Approve or reject a request")
def action_request(request_id: int, data: ApprovalActionSchema, db: Session = Depends(get_tenant_db)):
    r = db.query(Approval).filter(Approval.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    action = data.action.upper()
    if action not in ["APPROVE", "REJECT"]:
        raise HTTPException(status_code=400, detail="Action must be APPROVE or REJECT")
    try:
        if action == "APPROVE":
            r.status = "APPROVED"
            r.reviewer_id = 1  # Admin
            db.commit()
            return {"status": "success", "message": "Request approved"}
        else:
            db.delete(r)
            db.commit()
            return {"status": "success", "message": "Request rejected and removed"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/requests/{request_id}", summary="Hard-delete a request")
def delete_request(request_id: int, db: Session = Depends(get_tenant_db)):
    r = db.query(Approval).filter(Approval.id == request_id).first()
    if not r:
        raise HTTPException(status_code=404, detail="Request not found")
    try:
        db.delete(r)
        db.commit()
        return {"status": "success", "message": f"Request {request_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 10 — INVENTORY OVERSIGHT  (tenant.inventory)
# ══════════════════════════════════════════════════════════════════════════════

class InventoryCreateSchema(BaseModel):
    sku_id: str
    name: str
    qty: int = 0
    threshold: int = 10
    warehouse_id: Optional[int] = None


class InventoryUpdateSchema(BaseModel):
    name: Optional[str] = None
    qty: Optional[int] = None
    threshold: Optional[int] = None
    warehouse_id: Optional[int] = None


@router.get("/inventory", summary="List all inventory items")
def list_inventory(
    low_stock: Optional[bool] = Query(None, description="Filter items below threshold"),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_tenant_db),
):
    skip = (page - 1) * size
    query = db.query(Inventory)
    if low_stock:
        query = query.filter(Inventory.qty <= Inventory.threshold)
    total = query.count()
    items = query.order_by(Inventory.id.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": i.id, "sku_id": i.sku_id, "name": i.name,
                "qty": i.qty, "threshold": i.threshold,
                "warehouse_id": i.warehouse_id,
                "is_low_stock": i.qty <= i.threshold,
            }
            for i in items
        ],
    }


@router.get("/inventory/{item_id}", summary="Get one inventory item")
def get_inventory_item(item_id: int, db: Session = Depends(get_tenant_db)):
    i = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not i:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return {
        "id": i.id, "sku_id": i.sku_id, "name": i.name,
        "qty": i.qty, "threshold": i.threshold, "warehouse_id": i.warehouse_id,
        "is_low_stock": i.qty <= i.threshold,
    }


@router.post("/inventory", status_code=status.HTTP_201_CREATED, summary="Create inventory item")
def create_inventory_item(data: InventoryCreateSchema, db: Session = Depends(get_tenant_db)):
    existing = db.query(Inventory).filter(Inventory.sku_id == data.sku_id).first()
    if existing:
        raise HTTPException(status_code=409, detail="SKU already exists")
    item = Inventory(
        sku_id=data.sku_id, name=data.name,
        qty=data.qty, threshold=data.threshold,
        warehouse_id=data.warehouse_id,
    )
    try:
        db.add(item)
        db.commit()
        db.refresh(item)
        return {"status": "success", "id": item.id, "sku_id": item.sku_id}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/inventory/{item_id}", summary="Edit inventory item")
def update_inventory_item(item_id: int, data: InventoryUpdateSchema, db: Session = Depends(get_tenant_db)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    for key, value in data.model_dump(exclude_unset=True).items():
        setattr(item, key, value)
    try:
        db.commit()
        db.refresh(item)
        return {"status": "success", "id": item.id, "name": item.name, "qty": item.qty}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/inventory/{item_id}", summary="Delete inventory item")
def delete_inventory_item(item_id: int, db: Session = Depends(get_tenant_db)):
    item = db.query(Inventory).filter(Inventory.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    try:
        db.delete(item)
        db.commit()
        return {"status": "success", "message": f"Inventory item {item_id} deleted"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))


# ══════════════════════════════════════════════════════════════════════════════
# SECTION 11 — INVITE TOKEN MANAGEMENT  (public.invite_tokens)
# ══════════════════════════════════════════════════════════════════════════════

class InviteCreateSchema(BaseModel):
    email: EmailStr
    role: str
    name: Optional[str] = None


@router.get("/invites", summary="List all invite tokens")
def list_invites(
    role: Optional[str] = Query(None),
    is_used: Optional[bool] = Query(None),
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    skip = (page - 1) * size
    query = db.query(InviteToken)
    if role:
        query = query.filter(InviteToken.role == role)
    if is_used is not None:
        query = query.filter(InviteToken.is_used == is_used)
    total = query.count()
    items = query.order_by(InviteToken.created_at.desc()).offset(skip).limit(size).all()
    return {
        "total": total, "page": page, "size": size,
        "items": [
            {
                "id": i.id, "email": i.email, "role": i.role,
                "name": i.name, "token": i.token, "is_used": i.is_used,
                "created_at": i.created_at, "expires_at": i.expires_at,
                "extra_data": i.extra_data,
            }
            for i in items
        ],
    }


@router.post("/invites", status_code=status.HTTP_201_CREATED, summary="Create and send an invite")
async def create_invite(data: InviteCreateSchema, db: Session = Depends(get_db)):
    token = str(uuid.uuid4())
    name = data.name or data.email.split("@")[0]
    invite = InviteToken(
        email=data.email,
        role=data.role,
        token=token,
        name=name,
        is_used=False,
    )
    db.add(invite)
    db.commit()
    db.refresh(invite)

    import os
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    link = f"{frontend_url}/register?token={token}&role={data.role}"
    try:
        await send_invite_email(data.email, link)
    except Exception as e:
        print(f"Email dispatch failed (non-critical): {e}")

    return {
        "status": "success",
        "id": invite.id,
        "invite_link": link,
        "message": f"Invite sent to {data.email}",
    }


@router.delete("/invites/{invite_id}", summary="Revoke/delete an invite token")
def delete_invite(invite_id: int, db: Session = Depends(get_db)):
    invite = db.query(InviteToken).filter(InviteToken.id == invite_id).first()
    if not invite:
        raise HTTPException(status_code=404, detail="Invite not found")
    try:
        db.delete(invite)
        db.commit()
        return {"status": "success", "message": f"Invite {invite_id} revoked"}
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
