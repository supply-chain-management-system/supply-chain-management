import secrets
from datetime import datetime, timedelta


def generate_otp():
    return str(secrets.randbelow(900000) + 100000)
