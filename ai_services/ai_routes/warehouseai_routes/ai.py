from fastapi import APIRouter
from ai_services.ai.warehouse_ai.agent import agent

router = APIRouter()

@router.post("/ask-ai")
def ask_ai(question: str):

    response = agent.run(question)

    return {
        "answer": response
    }