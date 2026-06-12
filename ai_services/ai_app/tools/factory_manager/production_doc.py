from typing import Dict
import requests
import os

from ai_app.prompt.factory_manager.doc_prompt import doc_prompt


GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

def generate_production_doc(data: Dict):
    prompt = doc_prompt(data)

    if not prompt:
        return {
            "status": "error",
            "message": "Production data is missing or incomplete. Cannot generate report."
        }

    errors = []

    # 1. Try Groq
    groq_api_key = os.getenv("GROQ_API_KEY")
    if groq_api_key and "gsk_" in groq_api_key:
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are an expert manufacturing AI assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        headers = {
            "Authorization": f"Bearer {groq_api_key}",
            "Content-Type": "application/json"
        }
        try:
            print("DEBUG: Trying Groq...")
            response = requests.post(GROQ_URL, json=payload, headers=headers, timeout=20)
            if response.status_code == 200:
                result = response.json()
                report = result["choices"][0]["message"]["content"]
                return {"status": "success", "report": report}
            else:
                errors.append(f"Groq API Error {response.status_code}: {response.text}")
        except Exception as e:
            errors.append(f"Groq Connection Error: {str(e)}")
    else:
        errors.append("Groq API Key is not set or invalid in environment.")

    # 2. Fallback: Try OpenAI
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key and "sk-" in openai_api_key:
        openai_url = "https://api.openai.com/v1/chat/completions"
        payload = {
            "model": "gpt-4o-mini",
            "messages": [
                {"role": "system", "content": "You are an expert manufacturing AI assistant."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.3
        }
        headers = {
            "Authorization": f"Bearer {openai_api_key}",
            "Content-Type": "application/json"
        }
        try:
            print("DEBUG: Falling back to OpenAI (gpt-4o-mini)...")
            response = requests.post(openai_url, json=payload, headers=headers, timeout=20)
            if response.status_code == 200:
                result = response.json()
                report = result["choices"][0]["message"]["content"]
                return {"status": "success", "report": report}
            else:
                errors.append(f"OpenAI API Error {response.status_code}: {response.text}")
        except Exception as e:
            errors.append(f"OpenAI Connection Error: {str(e)}")

    # 3. Fallback: Try Google Gemini
    google_api_key = os.getenv("GOOGLE_API_KEY")
    if google_api_key:
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={google_api_key}"
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": "You are an expert manufacturing AI assistant. Generate a highly professional, comprehensive production completion report based on this prompt:\n\n" + prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.3
            }
        }
        headers = {"Content-Type": "application/json"}
        try:
            print("DEBUG: Falling back to Google Gemini (gemini-1.5-flash)...")
            response = requests.post(gemini_url, json=payload, headers=headers, timeout=20)
            if response.status_code == 200:
                result = response.json()
                report = result["candidates"][0]["content"]["parts"][0]["text"]
                return {"status": "success", "report": report}
            else:
                errors.append(f"Gemini API Error {response.status_code}: {response.text}")
        except Exception as e:
            errors.append(f"Gemini Connection Error: {str(e)}")

    return {
        "status": "error",
        "message": "All LLM providers failed. Errors:\n" + "\n".join(errors)
    }