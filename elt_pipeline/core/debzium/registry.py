import requests
import json
import os
import time

CONNECT_URL = "http://debezium_connect:8083/connectors"

def wait_for_debezium():
    for i in range(10):
        try:
            r = requests.get("http://debezium_connect:8083/connectors")
            if r.status_code == 200:
                print("✅ Debezium is ready")
                return
        except:
            print(f"⏳ Waiting for Debezium... ({i+1})")
            time.sleep(3)
    raise Exception("❌ Debezium not ready")

def register_connector():
    wait_for_debezium()

    BASE_DIR = os.path.dirname(__file__)
    file_path = os.path.join(BASE_DIR, "postgres-connector.json")

    with open(file_path) as f:
        config = json.load(f)

    # Dynamically inject credentials from environment variables if present
    postgres_host = os.getenv("POSTGRES_HOST")
    if postgres_host:
        config["config"]["database.hostname"] = postgres_host
    postgres_port = os.getenv("POSTGRES_PORT")
    if postgres_port:
        config["config"]["database.port"] = postgres_port
    postgres_user = os.getenv("POSTGRES_USER")
    if postgres_user:
        config["config"]["database.user"] = postgres_user
    postgres_password = os.getenv("POSTGRES_PASSWORD")
    if postgres_password:
        config["config"]["database.password"] = postgres_password
    postgres_db = os.getenv("POSTGRES_DB")
    if postgres_db:
        config["config"]["database.dbname"] = postgres_db

    r = requests.post(CONNECT_URL, json=config)
    print(r.status_code, r.text)

if __name__ == "__main__":
    register_connector()