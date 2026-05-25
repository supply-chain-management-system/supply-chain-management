import psycopg2
from langchain_core.tools import tool
from langchain_core.runnables import RunnableConfig
import httpx
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings
# 🔒 Centralized Role Permissions
import os
from pymongo import MongoClient

# Define it at the top of the file!
MONGO_URI = os.getenv("MONGO_URL","mongodb://localhost:27017")
mongodb_client = MongoClient(MONGO_URI)
@tool
def get_stock_level(product_name: str, config: RunnableConfig):
    """Check current stock level for a product from the inventory server."""
    
    # 1. Extract the secret credentials
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")

    # 2. ROLE-BASED ACCESS CONTROL (RBAC)
    # Only allow managers who actually need stock data
    allowed_roles = ["main_manager", "warehouse_manager", "owner"]
    if user_role not in allowed_roles:
        return f"Access Denied: As a '{user_role}', you are not authorized to view warehouse stock levels."

    # 3. TENANT INJECTION
    # We pass the schema as a custom header to your internal API!
    url = f"http://fastapi:8000/api/v1/internal/stock/{product_name}"
    headers = {"X-Tenant-Schema": tenant_schema} if tenant_schema else {}

    try:
        # Notice we added headers=headers here!
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
    
    # 1. Extract the secret credentials
    tenant_schema = config["configurable"].get("tenant_schema")
    user_role = config["configurable"].get("user_role")

    # 2. ROLE-BASED ACCESS CONTROL (RBAC)
    # Maybe factory managers are allowed to read warehouse safety rules too?
    allowed_roles = ["main_manager", "warehouse_manager", "factory_manager", "owner"]
    if user_role not in allowed_roles:
        return "Access Denied: You do not have clearance to read warehouse operational manuals."

    # 3. TENANT-SECURE VECTOR SEARCH
    vector_store = MongoDBAtlasVectorSearch(
        collection=mongodb_client["korvex_ai_db"]["knowledge_base"],
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
        index_name="vector_index"
    )
    
    # 🚀 The Magic Filter: This ensures the AI ONLY retrieves documents 
    # where the 'tenant_schema' metadata matches the user's company!
    search_filter = {"tenant_schema": {"$eq": tenant_schema}}
    
    try:
        docs = vector_store.similarity_search(
            query, 
            k=3, 
            pre_filter=search_filter  # Applied here!
        )
        
        if not docs:
            return "No manuals found for your company's workspace."
            
        return "\n\n".join([d.page_content for d in docs])
        
    except Exception as e:
        return f"Database Search Error: {str(e)}"