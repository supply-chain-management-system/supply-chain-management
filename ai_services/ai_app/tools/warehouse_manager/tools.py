import httpx
from langchain_core.tools import tool

@tool
def get_stock_level(product_name: str):
    """Check current stock level for a product from the inventory server."""
    url = f"http://fastapi:8000/api/v1/internal/stock/{product_name}"
    try:
        response = httpx.get(url, timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            return f"Stock for '{data['product_name']}': {data['quantity']} units."
        return "Inventory server unreachable."
    except Exception as e:
        return f"Tool Error: {str(e)}"