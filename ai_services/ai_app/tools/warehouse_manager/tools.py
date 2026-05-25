import httpx
from langchain_core.tools import tool
from langchain_mongodb import MongoDBAtlasVectorSearch
from langchain_openai import OpenAIEmbeddings
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
    

@tool
def search_warehouse_manuals(query: str) -> str:
    """Search internal warehouse operational manuals, guidelines, and safety policies."""
    vector_store = MongoDBAtlasVectorSearch(
        collection=mongodb_client["korvex_ai_db"]["knowledge_base"],
        embedding=OpenAIEmbeddings(model="text-embedding-3-small"),
        index_name="vector_index"
    )
    docs = vector_store.similarity_search(query, k=3)
    return "\n\n".join([d.page_content for d in docs])



