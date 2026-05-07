import os
import requests as http_requests
from google.oauth2 import id_token
from google.auth.transport import requests

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")


def verify_google_token(code: str):
    try:
        print("Exchanging authorization code for tokens...")

        token_response = http_requests.post(
            "https://oauth2.googleapis.com/token",

            data={
                "code": code,
                "client_id": GOOGLE_CLIENT_ID,
                "client_secret": GOOGLE_CLIENT_SECRET,
                "redirect_uri": "postmessage",
                "grant_type": "authorization_code",
            },
        )

        token_data = token_response.json()

        if "error" in token_data:
            return None

        id_token_str = token_data.get("id_token")
        if not id_token_str:
            return None

        idinfo = id_token.verify_oauth2_token(
            id_token_str, requests.Request(), GOOGLE_CLIENT_ID
        )

        return idinfo

    except Exception as e:
        print(f"Error: {e}")
        return None
