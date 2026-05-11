import httpx
from langchain_core.tools import tool

# Note: Requires PYTHONPATH to point to the 'server' directory when running
from app.db.database import SessionLocal
from app.models.sub_managers.factory_manager.production import Production, Production_status, Factory
from app.models.business_manager.domain import Inventory, Approval, Supplier

@tool
def create_factory_production_draft(product_name: str, target_qty: int, factory_id: int, user_id: int, company_id: int) -> str:
    """Drafts a new production request."""
    db = SessionLocal()
    try:
        factory = db.query(Factory).filter(Factory.id == factory_id, Factory.company_id == company_id).first()
        if not factory: return f"Access Denied: Factory {factory_id} does not belong to your company."
        
        new_production = Production(product_name=product_name, target_qty=target_qty, factory_id=factory_id, created_by=user_id, status=Production_status.PENDING)
        db.add(new_production)
        db.commit()
        return f"Successfully drafted production request for {target_qty} {product_name} at {factory.name}."
    except Exception as e:
        db.rollback()
        return f"Error: {str(e)}"
    finally: db.close()

@tool
def check_inventory_and_draft_orders(user_id: int) -> str:
    """Scans inventory for low stock and drafts Purchase Orders."""
    db = SessionLocal()
    try:
        low_stock_items = db.query(Inventory).filter(Inventory.qty < Inventory.threshold).all()
        if not low_stock_items: return "All inventory levels are above thresholds. No orders drafted."

        drafted_orders = []
        for item in low_stock_items:
            payload = {"sku": item.sku_id, "item_name": item.name, "current_qty": item.qty, "reorder_amount": item.threshold * 2}
            db.add(Approval(type="Purchase Order", payload=payload, status="PENDING_APPROVAL", requester_id=user_id))
            drafted_orders.append(item.name)

        db.commit()
        return f"Found low stock items. Automatically drafted Purchase Orders for: {', '.join(drafted_orders)}."
    except Exception as e:
        db.rollback()
        return f"Database error: {str(e)}"
    finally: db.close()

@tool
def bulk_approve_requests(filter_type: str, filter_value: str, user_id: int) -> str:
    """Approves multiple pending requests."""
    db = SessionLocal()
    try:
        query = db.query(Approval).filter(Approval.status == "PENDING_APPROVAL")
        if filter_type == "type": query = query.filter(Approval.type == filter_value)
        
        requests_to_approve = query.all()
        if not requests_to_approve: return "No pending requests found."

        for req in requests_to_approve:
            req.status = "APPROVED"
            req.reviewer_id = user_id
        db.commit()
        return f"Successfully processed bulk approval. {len(requests_to_approve)} requests are now APPROVED."
    except Exception as e:
        db.rollback()
        return f"Database error: {str(e)}"
    finally: db.close()

@tool
def check_supplier_status(max_rating: float, min_lead_time_days: int) -> str:
    """Queries for underperforming suppliers."""
    db = SessionLocal()
    try:
        suppliers = db.query(Supplier).filter(Supplier.rating <= max_rating, Supplier.lead_time_days >= min_lead_time_days).all()
        if not suppliers: return f"No suppliers found matching criteria."
        return "Matching suppliers found:\n" + "\n".join([f"- {s.name} (Rating: {s.rating}, Lead: {s.lead_time_days}d)" for s in suppliers])
    except Exception as e: return f"Database error: {str(e)}"
    finally: db.close()

@tool
def invite_team_member(name: str, email: str, role: str, business_name: str) -> str:
    """Triggers n8n to dispatch an invitation email."""
    try:
        payload = {"email": email, "role": role, "business_name": business_name, "invite_link": f"http://localhost:5173/setup-account?token=abc-123&email={email}"}
        httpx.post("http://127.0.0.1:5678/webhook/invite-user", json=payload).raise_for_status()
        return f"Successfully dispatched an invitation email to {name} ({email}) for the role of {role}."
    except Exception as e: return f"Failed to dispatch invitation: {str(e)}"

@tool
def dispatch_low_stock_alert(product_name: str, current_qty: int, threshold: int) -> str:
    """Dispatches emergency low stock alert via n8n."""
    try:
        payload = {"product_name": product_name, "current_qty": current_qty, "threshold": threshold, "message": f"⚠️ CRITICAL: {product_name} stock is at {current_qty}"}
        httpx.post("http://127.0.0.1:5678/webhook/low-stock-alert", json=payload).raise_for_status()
        return f"Emergency alert for {product_name} successfully dispatched."
    except Exception as e: return f"Failed to dispatch alert: {str(e)}"