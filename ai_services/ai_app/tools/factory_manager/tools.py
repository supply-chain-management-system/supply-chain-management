# ai_app/tools/factory_manager/tools.py

import httpx

from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig

from ai_app.schemas.factory_manager.factory_schema import (
    CreateWorkerSchema,
    AssignTeamSchema,
    RemoveMemberSchema,
    CreateProductionSchema,
    CompleteProductSchema,
    CreateMachineSchema,
)


# =========================================================
# BASE CONFIG
# =========================================================

BASE_URL = "http://fastapi:8000/api/v1"




@tool(args_schema=CreateWorkerSchema)
def create_worker_tool(
    name: str,
    role: str,
    factory_id: int,
    config: RunnableConfig
) -> str:
    """
    Create a new factory worker.
    """

    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")

    if user_role not in ["factory_manager", "owner"]:
        return "Access Denied."

    payload = {
        "name": name,
        "role": role,
        "factory_id": factory_id
    }

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.post(
            f"{BASE_URL}/factory/create_worker",
            json=payload,
            headers=headers,
            timeout=10.0
        )

        if response.status_code == 200:
            return f"Worker '{name}' created successfully."

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# GET AVAILABLE WORKERS
# =========================================================

@tool
def get_available_workers_tool(config: RunnableConfig) -> str:
    """
    Get all available workers that are not assigned.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.get(
            f"{BASE_URL}/factory/get_worker",
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# ASSIGN TEAM
# =========================================================

@tool(args_schema=AssignTeamSchema)
def assign_team_tool(
    production_id: int,
    workers: list[int],
    config: RunnableConfig
) -> str:
    """
    Assign workers into production team.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    payload = {
        "production_id": production_id,
        "workers": workers
    }

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.post(
            f"{BASE_URL}/factory/assign_team",
            json=payload,
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# GET ALL TEAMS
# =========================================================

@tool
def get_all_teams_tool(config: RunnableConfig) -> str:
    """
    Get all production teams and members.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.get(
            f"{BASE_URL}/factory/all_team",
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# REMOVE TEAM MEMBER
# =========================================================

@tool(args_schema=RemoveMemberSchema)
def remove_team_member_tool(
    member_id: int,
    config: RunnableConfig
) -> str:
    """
    Remove worker from production team.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.delete(
            f"{BASE_URL}/factory/removemember/{member_id}",
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# CREATE PRODUCTION
# =========================================================

@tool(args_schema=CreateProductionSchema)
def create_production_tool(
    product_name: str,
    target_qty: int,
    factory_id: int,
    config: RunnableConfig
) -> str:
    """
    Create a new production item inside factory.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    payload = {
        "product_name": product_name,
        "target_qty": target_qty,
        "factory_id": factory_id
    }

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.post(
            f"{BASE_URL}/factory/product_create",
            json=payload,
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# GET FACTORY PRODUCTS
# =========================================================

@tool
def get_factory_products_tool(config: RunnableConfig) -> str:
    """
    Get all factory production products.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.get(
            f"{BASE_URL}/factory/products",
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# COMPLETE PRODUCT
# =========================================================

@tool(args_schema=CompleteProductSchema)
def complete_product_tool(
    product_id: int,
    config: RunnableConfig
) -> str:
    """
    Mark factory production as completed.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.patch(
            f"{BASE_URL}/factory/products/{product_id}/complete",
            headers=headers,
            timeout=15.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# CREATE MACHINE
# =========================================================

@tool(args_schema=CreateMachineSchema)
def create_machine_tool(
    machine_name: str,
    status: str,
    config: RunnableConfig
) -> str:
    """
    Create factory machine.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    payload = {
        "machine_name": machine_name,
        "status": status
    }

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.post(
            f"{BASE_URL}/factory_machine/",
            json=payload,
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# GET MACHINES
# =========================================================

@tool
def get_machines_tool(config: RunnableConfig) -> str:
    """
    Get all factory machines.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.get(
            f"{BASE_URL}/factory_machine/",
            headers=headers,
            timeout=10.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"


# =========================================================
# GET PRODUCTION REPORT
# =========================================================

@tool
def get_production_report_tool(config: RunnableConfig) -> str:
    """
    Get production analytics report.
    """

    tenant_schema = config["configurable"].get("tenant_schema")

    headers = {
        "X-Tenant-Schema": tenant_schema
    }

    try:

        response = httpx.get(
            f"{BASE_URL}/factory/production-report",
            headers=headers,
            timeout=20.0
        )

        return response.text

    except Exception as e:
        return f"Tool Error: {str(e)}"