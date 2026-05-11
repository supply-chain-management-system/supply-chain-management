# import httpx
# import json
# from langchain_core.tools import tool

# # Import your database session and models
# from app.db.database import SessionLocal

# from app.models.sub_managers.factory_manager.production import Production, Production_status, Factory

# from app.models.sub_managers.factory_manager.production import (
#     Production,
#     Production_status,
#     Factory,
# )

# from app.models.business_manager.domain import Inventory, Approval, Supplier

# # ==========================================
# # 1. DATABASE & APPROVAL TOOLS
# # ==========================================


# @tool
# def create_factory_production_draft(
#     product_name: str, target_qty: int, factory_id: int, user_id: int, company_id: int
# ) -> str:
#     """
#     Drafts a new production request. Validates that the factory belongs to the user's company.
#     """
#     db = SessionLocal()
#     try:
#         # 1. Security Check: Does this factory belong to the user's company?
#         factory = (
#             db.query(Factory)
#             .filter(Factory.id == factory_id, Factory.company_id == company_id)
#             .first()
#         )

#         if not factory:
#             return (
#                 f"Access Denied: Factory {factory_id} does not belong to your company."
#             )

#         # 2. If valid, proceed with the draft
#         new_production = Production(
#             product_name=product_name,
#             target_qty=target_qty,
#             factory_id=factory_id,
#             created_by=user_id,
#             status=Production_status.PENDING,
#         )
#         db.add(new_production)
#         db.commit()
#         return f"Successfully drafted production request for {target_qty} {product_name} at {factory.name}."
#     except Exception as e:
#         db.rollback()
#         return f"Error: {str(e)}"
#     finally:
#         db.close()


# @tool
# def check_inventory_and_draft_orders(user_id: int) -> str:
#     """
#     Scans the inventory database for items where quantity is below the threshold.
#     If low stock is found, it automatically drafts a Purchase Order for the relevant supplier.
#     """
#     db = SessionLocal()
#     try:
#         # 1. Query real Inventory table
#         low_stock_items = (
#             db.query(Inventory).filter(Inventory.qty < Inventory.threshold).all()
#         )

#         if not low_stock_items:
#             return "I checked the database. All inventory levels are currently above their thresholds. No orders drafted."

#         drafted_orders = []

#         # 2. Create an Approval request for each low stock item
#         for item in low_stock_items:
#             payload = {
#                 "sku": item.sku_id,
#                 "item_name": item.name,
#                 "current_qty": item.qty,
#                 "reorder_amount": item.threshold * 2,  # Simple reorder logic
#             }

#             new_approval = Approval(
#                 type="Purchase Order",
#                 payload=payload,
#                 status="PENDING_APPROVAL",
#                 requester_id=user_id,
#             )
#             db.add(new_approval)
#             drafted_orders.append(item.name)

#         db.commit()
#         return f"Found low stock items. Automatically drafted Purchase Orders for: {', '.join(drafted_orders)}."
#     except Exception as e:
#         db.rollback()
#         return f"Database error while checking inventory: {str(e)}"
#     finally:
#         db.close()


# @tool
# def bulk_approve_requests(filter_type: str, filter_value: str, user_id: int) -> str:
#     """
#     Approves multiple pending requests at once based on criteria.
#     Arguments:
#     - filter_type: e.g., "type"
#     - filter_value: e.g., "Purchase Order"
#     """
#     db = SessionLocal()
#     try:
#         query = db.query(Approval).filter(Approval.status == "PENDING_APPROVAL")

#         if filter_type == "type":
#             query = query.filter(Approval.type == filter_value)

#         requests_to_approve = query.all()
#         count = len(requests_to_approve)

#         if count == 0:
#             return "No pending requests found matching those criteria."

#         for req in requests_to_approve:
#             req.status = "APPROVED"
#             req.reviewer_id = user_id

#         db.commit()
#         return (
#             f"Successfully processed bulk approval. {count} requests are now APPROVED."
#         )
#     except Exception as e:
#         db.rollback()
#         return f"Database error while bulk approving: {str(e)}"
#     finally:
#         db.close()


# @tool
# def check_supplier_status(max_rating: float, min_lead_time_days: int) -> str:
#     """
#     Queries the database for suppliers matching specific negative criteria (e.g., low ratings, long lead times).
#     """
#     db = SessionLocal()
#     try:
#         suppliers = (
#             db.query(Supplier)
#             .filter(
#                 Supplier.rating <= max_rating,
#                 Supplier.lead_time_days >= min_lead_time_days,
#             )
#             .all()
#         )

#         if not suppliers:
#             return f"No suppliers found with a rating below {max_rating} and lead time over {min_lead_time_days} days."

#         result_str = "Matching suppliers found:\n"
#         for s in suppliers:
#             result_str += (
#                 f"- {s.name} (Rating: {s.rating}, Lead Time: {s.lead_time_days} days)\n"
#             )

#         return result_str
#     except Exception as e:
#         return f"Database error while checking suppliers: {str(e)}"
#     finally:
#         db.close()


# # ==========================================
# # 2. n8n AUTOMATION ENGINE TOOLS
# # ==========================================


# @tool
# def invite_team_member(name: str, email: str, role: str, business_name: str) -> str:
#     """
#     Triggers the n8n automation engine to dispatch an invitation email to a new team member.
#     Use this when the user asks to invite, add, or onboard a new team member.
#     """
#     # 🚨 REPLACE WITH YOUR NGROK URL

#     n8n_url = n8n_url = "http://127.0.0.1:5678/webhook/low-stock-alert"


#     mock_token = "abc-123-secure-token"
#     invite_link = (
#         f"http://localhost:5173/setup-account?token={mock_token}&email={email}"
#     )

#     payload = {
#         "email": email,
#         "role": role,
#         "business_name": business_name,
#         "invite_link": invite_link,
#     }

#     try:
#         response = httpx.post(n8n_url, json=payload)
#         response.raise_for_status()
#         return f"Successfully dispatched an invitation email to {name} ({email}) for the role of {role}."
#     except Exception as e:
#         return f"Failed to dispatch invitation via automation engine: {str(e)}"


# @tool
# def dispatch_low_stock_alert(
#     product_name: str, current_qty: int, threshold: int
# ) -> str:
#     """
#     Use this tool ONLY when you detect that a product's inventory has fallen below its safety threshold.
#     This dispatches an emergency alert to the Business Manager via the automation engine.
#     """


#     n8n_url = "http://127.0.0.1:5678/webhook/low-stock-alert"


#     payload = {
#         "product_name": product_name,
#         "current_qty": current_qty,
#         "threshold": threshold,
#         "message": f"⚠️ CRITICAL: {product_name} stock is at {current_qty} (Safety Threshold: {threshold})",
#     }

#     try:
#         response = httpx.post(n8n_url, json=payload)
#         response.raise_for_status()
#         return f"Emergency alert for {product_name} successfully dispatched to the automation engine."
#     except Exception as e:
#         return f"Failed to dispatch alert: {str(e)}"
