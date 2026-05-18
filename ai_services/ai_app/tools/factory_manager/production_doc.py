from typing import Dict
import requests
import os

from ai_app.prompt.factory_manager.doc_prompt import doc_prompt


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
GROQ_API_KEY= os.getenv("GROQ_API_KEY")
def generate_production_doc(data: Dict):
    if not GROQ_API_KEY:
        return {"status": "error", "message": "GROQ_API_KEY not found in environment"}

    prompt = doc_prompt(data)

    if not prompt:
        return {
            "status": "error",
            "message": "Production data is missing or incomplete. Cannot generate report."
        }
    
    payload = {
       
        "model": "llama-3.3-70b-versatile", 
        "messages": [
            {
                "role": "system",
                "content": "You are an expert manufacturing AI assistant."
            },
            {
                "role": "user",
                "content": prompt
            }
        ],
        "temperature": 0.3
    }

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(GROQ_URL, json=payload, headers=headers)
        
        
        if response.status_code != 200:
            return {
                "status": "error", 
                "message": f"Groq API Error {response.status_code}: {response.text}"
            }

        result = response.json()
        report = result["choices"][0]["message"]["content"]
        
        return {
            "status": "success",
            "report": report
        }
    
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection Error: {str(e)}"
        }