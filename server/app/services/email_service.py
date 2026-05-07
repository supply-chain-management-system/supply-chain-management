import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()


conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@nexusgrid.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() in ("true", "1", "t"),
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() in ("true", "1", "t"),
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)

async def send_verification_otp_email(email_to: str, user_name: str, otp: str):
    """
    Send OTP verification email to user
    """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1e293b;">Verify Your Email</h2>

        <p>Use the OTP below to verify your email address:</p>

        <div style="
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 4px;
            margin: 20px 0;
            color: #2563eb;
        ">
            {otp}
        </div>

        <p>This OTP is valid for <strong>5 minutes</strong>.</p>

        <p style="margin-top: 20px;">
            If you did not request this, please ignore this email.
        </p>

        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            © NexusGrid
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Your OTP Code - Korvex",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)