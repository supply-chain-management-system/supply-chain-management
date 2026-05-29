import os
import httpx
import psycopg2
from pydantic import BaseModel, Field
from pymongo import MongoClient
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings

# Define it at the top of the file!
MONGO_URI = os.getenv("MONGO_URL", "mongodb://mongodb:27017") # Updated host link to match your docker setup
mongodb_client = MongoClient(MONGO_URI)

@tool
def get_stock_level(product_name: str, config: RunnableConfig):
    """Check current stock level for a product from the inventory server."""
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")

    allowed_roles = ["main_manager", "warehouse_manager", "owner"]
    if user_role not in allowed_roles:
        return f"Access Denied: As a '{user_role}', you are not authorized to view warehouse stock levels."

    url = f"http://fastapi:8000/api/v1/internal/stock/{product_name}"
    headers = {"X-Tenant-Schema": tenant_schema} if tenant_schema else {}

    try:
        response = httpx.get(url, headers=headers, timeout=5.0)
        if response.status_code == 200:
            data = response.json()
            return f"Stock for '{data['product_name']}': {data['quantity']} units."
        return f"Inventory server unreachable or item not found. Status: {response.status_code}"
    except Exception as e:
        return f"Tool Error: {str(e)}"
    

@tool
def search_warehouse_manuals(query: str, config: RunnableConfig) -> str:
    """Search internal warehouse operational manuals, guidelines, and safety policies."""
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")

    allowed_roles = ["main_manager", "warehouse_manager", "factory_manager", "owner"]
    if user_role not in allowed_roles:
        return "Access Denied: You do not have clearance to read warehouse operational manuals."

    vector_store = MongoDBAtlasVectorSearch(
        collection=mongodb_client["korvex_ai_db"]["knowledge_base"],
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
        index_name="vector_index"
    )
    
    search_filter = {"tenant_schema": {"$eq": tenant_schema}}
    
    try:
        docs = vector_store.similarity_search(
            query, 
            k=3, 
            pre_filter=search_filter
        )
        
        if not docs:
            return "No manuals found for your company's workspace."
            
        return "\n\n".join([d.page_content for d in docs])
        
    except Exception as e:
        return f"Database Search Error: {str(e)}"


class InventoryUpdateSchema(BaseModel):
    product_id: int = Field(description="The integer ID of the product.")
    rack_id: str = Field(description="The string identifier for the storage rack (e.g., 'A1').")
    quantity: int = Field(description="The number of items to add or remove.")
    operation_type: str = Field(description="Must be exactly 'IN' (to add) or 'OUT' (to remove).")

@tool(args_schema=InventoryUpdateSchema)
def update_inventory_tool(product_id: int, rack_id: str, quantity: int, operation_type: str, config: RunnableConfig) -> str:
    """
    Use this tool strictly to update warehouse inventory levels when a user wants 
    to add (IN) or remove (OUT) stock for a specific product and rack.
    """
    api_url = "http://fastapi:8000/api/v1/inventory" 
    
    # Extract the user identity and schema context right from the active token state
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")
    
    # RBAC Guard for alterations
    if user_role not in ["main_manager", "warehouse_manager", "owner"]:
        return f"Access Denied: Role '{user_role}' cannot perform structural changes to inventory stock."

    payload = {
        "product_id": product_id,
        "rack_id": rack_id,
        "quantity": quantity,
        "type": operation_type.upper()
    }
    
    # Inject the contextual tenancy keys to pass the TenantMiddleware seamlessly
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Schema": tenant_schema if tenant_schema else ""
    }

    try:
        with httpx.Client() as client:
            response = client.post(api_url, json=payload, headers=headers, timeout=10.0)
            
        if response.status_code == 200:
            data = response.json()
            return f"Success: Stock updated. The new quantity is {data.get('quantity')} units."
            
        elif response.status_code == 400:
            error_detail = response.json().get("detail", "Bad Request")
            return f"Action failed: {error_detail}."
            
        else:
            return f"Server error {response.status_code}: Could not update stock levels."
            
    except httpx.RequestError as e:
        return f"System error connecting to the database: {str(e)}"
    


class ProductCreateSchema(BaseModel):
    name: str = Field(description="The display name of the new product (e.g., 'Silver Bar', 'Gold Coin').")
    sku: str = Field(description="The unique Stock Keeping Unit identifier string (e.g., 'SLV-999-1KG').")

@tool(args_schema=ProductCreateSchema)
def create_product_tool(name: str, sku: str, config: RunnableConfig) -> str:
    """
    Use this tool strictly to create or register a brand-new product category 
    in the master warehouse catalog system before managing its physical stock.
    """
    api_url = "http://fastapi:8000/api/v1/ware_products"
    
    # Extract structural enterprise parameters directly from secure LangGraph state
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")
    
    #  Role Guard: Only strategic leadership should be registering base catalog products
    if user_role not in ["main_manager", "owner"]:
        return f"Access Denied: Role '{user_role}' does not have permissions to register new catalog products."

    payload = {
        "name": name.strip(),
        "sku": sku.strip().upper()
    }
    
    headers = {
        "Content-Type": "application/json",
        "X-Tenant-Schema": tenant_schema if tenant_schema else ""
    }

    try:
        with httpx.Client() as client:
            response = client.post(api_url, json=payload, headers=headers, timeout=10.0)
            
        if response.status_code == 201:
            data = response.json()
            return f"Success: Product '{data.get('name')}' has been officially registered with ID {data.get('id')} and SKU '{data.get('sku')}'."
            
        else:
            error_msg = response.json().get("detail", "Registration rejected by internal server.")
            return f"Action failed: {error_msg}"
            
    except httpx.RequestError as e:
        return f"System error connecting to catalog server: {str(e)}"