
from pydantic import BaseModel, Field
from typing import List, Optional


# =========================================================
# WORKER SCHEMAS
# =========================================================

class CreateWorkerSchema(BaseModel):
    name: str = Field(..., description="Full name of the worker")
    role: str = Field(..., description="Worker role inside factory")
    factory_id: int = Field(..., description="Factory ID")


class WorkerSearchSchema(BaseModel):
    search: str = Field(..., description="Worker name search text")


# =========================================================
# TEAM SCHEMAS
# =========================================================

class AssignTeamSchema(BaseModel):
    production_id: int = Field(..., description="Production ID")
    workers: List[int] = Field(..., description="List of worker IDs")


class RemoveMemberSchema(BaseModel):
    member_id: int = Field(..., description="Production team member ID")


# =========================================================
# PRODUCTION SCHEMAS
# =========================================================

class CreateProductionSchema(BaseModel):
    product_name: str = Field(..., description="Production product name")
    target_qty: int = Field(..., description="Target production quantity")
    factory_id: int = Field(..., description="Factory ID")


class UpdateProductionSchema(BaseModel):
    product_id: int = Field(..., description="Product ID")

    product_name: Optional[str] = Field(
        None,
        description="Updated product name"
    )

    target_qty: Optional[int] = Field(
        None,
        description="Updated target quantity"
    )

    status: Optional[str] = Field(
        None,
        description="Production status"
    )


class CompleteProductSchema(BaseModel):
    product_id: int = Field(..., description="Production product ID")


# =========================================================
# MACHINE SCHEMAS
# =========================================================

class CreateMachineSchema(BaseModel):
    machine_name: str = Field(..., description="Machine name")
    status: str = Field(..., description="Machine status")


class UpdateMachineSchema(BaseModel):
    machine_id: int = Field(..., description="Machine ID")

    machine_name: Optional[str] = Field(
        None,
        description="Updated machine name"
    )

    status: Optional[str] = Field(
        None,
        description="Updated machine status"
    )


class DeleteMachineSchema(BaseModel):
    machine_id: int = Field(..., description="Machine ID")


# =========================================================
# REPORT SCHEMAS
# =========================================================

class ProductionReportSchema(BaseModel):
    start_date: Optional[str] = Field(
        None,
        description="Report start date"
    )

    end_date: Optional[str] = Field(
        None,
        description="Report end date"
    )