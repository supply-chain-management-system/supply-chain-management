from fastapi import APIRouter

from ai_app.workflows.warehouse_manager.agent import agent

router = APIRouter()


@router.post("/ask-ai")
async def ask_ai(question: str):

    response = agent.run(question)

    return {
        "answer": response
    }