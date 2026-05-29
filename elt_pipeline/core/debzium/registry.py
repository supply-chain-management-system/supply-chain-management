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

    r = requests.post(CONNECT_URL, json=config)
    print(r.status_code, r.text)

if __name__ == "__main__":
    register_connector()