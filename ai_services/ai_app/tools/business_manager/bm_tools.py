import os
import httpx
import sys
import os
from langchain_core.tools import tool
BASE_DIR = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../../../")
)

sys.path.append(BASE_DIR)

# Assuming main server routes are prefixed with /api/v1
MAIN_SERVER_URL = os.getenv("MAIN_SERVER_URL", "http://fastapi:8000/api/v1")
N8N_URL = os.getenv("N8N_URL", "http://n8n:5678/webhook")
HTTP_TIMEOUT = 10.0


# ==========================================
# BUSINESS DATA TOOLS (Calling Main Server)
# ==========================================
@tool
def create_factory_production_draft(
    product_name: str, target_qty: int, factory_id: int, user_id: int
) -> str:
    """Drafts a new production request by calling the main server factory API."""
    try:
        # Mapped to teammate's production_create schema
        payload = {
            "product_name": product_name,
            "target_qty": target_qty,
            "factory_id": factory_id,
            "created_by": user_id,
        }

        # Hitting the real POST /factory/product_create endpoint
        response = httpx.post(
            f"{MAIN_SERVER_URL}/factory/product_create",
            json=payload,
            timeout=HTTP_TIMEOUT,
        )

        if response.status_code in [200, 201]:
            return f"Successfully drafted production request for {target_qty} {product_name}."
        else:
            return f"Failed to create draft. Main Server responded: {response.text}"

    except httpx.RequestError as e:
        return f"Microservice Communication Error: Could not reach main server. Details: {str(e)}"


@tool
def check_inventory_and_draft_orders(user_id: int) -> str:
    """Scans inventory for low stock via API and drafts Purchase Orders."""
    try:
        # Hitting the real GET /inventory endpoint
        response = httpx.get(f"{MAIN_SERVER_URL}/inventory", timeout=HTTP_TIMEOUT)
        response.raise_for_status()
        inventory_items = response.json()

        # Filter low stock items (Assuming a default threshold of 50 if 'threshold' isn't in the new DB model)
        low_stock_items = [
            item
            for item in inventory_items
            if item.get("quantity", 0) < item.get("threshold", 50)
        ]

        if not low_stock_items:
            return "All inventory levels are above thresholds. No orders drafted."

        drafted_orders = []
        for item in low_stock_items:
            payload = {
                "type": "Purchase Order",
                "payload": {
                    "product_id": item.get("product_id"),
                    "rack_id": item.get("rack_id"),
                    "current_qty": item.get("quantity"),
                    "reorder_amount": 100,  # Default reorder batch
                },
                "status": "PENDING_APPROVAL",
                "requester_id": user_id,
            }
            # Push the draft back to the main server approvals route
            httpx.post(
                f"{MAIN_SERVER_URL}/business-manager/approvals",
                json=payload,
                timeout=HTTP_TIMEOUT,
            )
            drafted_orders.append(f"Product ID {item.get('product_id')}")

        return f"Found low stock items. Automatically drafted Purchase Orders for: {', '.join(drafted_orders)}."

    except Exception as e:
        return f"Microservice Communication Error: {str(e)}"


@tool
def bulk_approve_requests(filter_type: str, filter_value: str, user_id: int) -> str:
    """Approves multiple pending requests via the main server API."""
    try:
        payload = {
            "filter_type": filter_type,
            "filter_value": filter_value,
            "reviewer_id": user_id,
        }

        # Note: Your teammate still needs to build this approval endpoint if they haven't yet!
        response = httpx.post(
            f"{MAIN_SERVER_URL}/business-manager/approvals/bulk-approve",
            json=payload,
            timeout=HTTP_TIMEOUT,
        )

        if response.status_code == 200:
            result_data = response.json()
            approved_count = result_data.get("approved_count", 0)
            return f"Successfully processed bulk approval. {approved_count} requests are now APPROVED."
        else:
            return f"Failed bulk approval. Main Server responded: {response.text}"

    except Exception as e:
        return f"Microservice Communication Error: {str(e)}"


@tool
def check_supplier_status(max_rating: float, min_lead_time_days: int) -> str:
    """Queries for underperforming suppliers via API."""
    try:
        # Note: Your teammate still needs to build this supplier endpoint!
        response = httpx.get(
            f"{MAIN_SERVER_URL}/business-manager/suppliers", timeout=HTTP_TIMEOUT
        )
        response.raise_for_status()

        all_suppliers = response.json()

        bad_suppliers = [
            s
            for s in all_suppliers
            if s.get("rating", 5.0) <= max_rating
            and s.get("lead_time_days", 0) >= min_lead_time_days
        ]

        if not bad_suppliers:
            return f"No suppliers found matching criteria."

        return "Matching suppliers found:\n" + "\n".join(
            [
                f"- {s.get('name')} (Rating: {s.get('rating')}, Lead: {s.get('lead_time_days')}d)"
                for s in bad_suppliers
            ]
        )

    except Exception as e:
        return f"Microservice Communication Error: {str(e)}"


# ==========================================
# AUTOMATION TOOLS (Calling n8n)
# ==========================================
@tool
def invite_team_member(name: str, email: str, role: str, business_name: str) -> str:
    """Triggers n8n to dispatch an invitation email."""
    try:
        payload = {
            "email": email,
            "role": role,
            "business_name": business_name,
            "invite_link": f"http://localhost:5173/setup-account?token=abc-123&email={email}",
        }
        httpx.post(
            f"{N8N_URL}/invite-user", json=payload, timeout=HTTP_TIMEOUT
        ).raise_for_status()
        return f"Successfully dispatched an invitation email to {name} ({email}) for the role of {role}."
    except Exception as e:
        return f"Failed to dispatch invitation via n8n: {str(e)}"


@tool
def dispatch_low_stock_alert(
    product_name: str, current_qty: int, threshold: int
) -> str:
    """Dispatches emergency low stock alert via n8n."""
    try:
        payload = {
            "product_name": product_name,
            "current_qty": current_qty,
            "threshold": threshold,
            "message": f"⚠️ CRITICAL: {product_name} stock is at {current_qty}",
        }
        httpx.post(
            f"{N8N_URL}/low-stock-alert", json=payload, timeout=HTTP_TIMEOUT
        ).raise_for_status()
        return f"Emergency alert for {product_name} successfully dispatched."
    except Exception as e:
        return f"Failed to dispatch alert via n8n: {str(e)}"
