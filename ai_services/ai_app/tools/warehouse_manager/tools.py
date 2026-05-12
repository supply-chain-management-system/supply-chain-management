from langchain.tools import tool
from server.app.db.database import SessionLocal
from server.app.models.sub_managers.warehouse_manager.warehouse import Inventory_ware,Product

@tool
def get_low_stock():
    """
    Returns products with critically low stock.
    """

    db = SessionLocal()

    inventory_items = db.query(Inventory_ware).all()

    low_stock = []

    for item in inventory_items:

        if item.quantity < 20:

            product = db.query(Product).filter(
                Product.id == item.product_id
            ).first()

            product_name = product.name if product else "Unknown"

            low_stock.append(
                f"{product_name} has only {item.quantity} units left"
            )

    db.close()

    if not low_stock:
        return "All inventory levels are healthy."

    return "\n".join(low_stock)