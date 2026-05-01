import os
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from dotenv import load_dotenv

load_dotenv()

# Setup the connection configuration using your .env variables
conf = ConnectionConfig(
    MAIL_USERNAME=os.getenv("MAIL_USERNAME"),
    MAIL_PASSWORD=os.getenv("MAIL_PASSWORD"),
    MAIL_FROM=os.getenv("MAIL_FROM", "noreply@nexusgrid.com"),
    MAIL_PORT=int(os.getenv("MAIL_PORT", 587)),
    MAIL_SERVER=os.getenv("MAIL_SERVER"),
    MAIL_STARTTLS=os.getenv("MAIL_STARTTLS", "True").lower() in ("true", "1", "t"),
    MAIL_SSL_TLS=os.getenv("MAIL_SSL_TLS", "False").lower() in ("true", "1", "t"),
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True
)

async def send_role_invitation_email(email_to: str, role: str, business_name: str, invite_link: str):
    """
    A reusable function that any teammate can import to send an invitation.
    """
    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #1e293b;">Welcome to NexusGrid</h2>
        <p>You have been invited to join <strong>{business_name}</strong> as a <strong>{role}</strong>.</p>
        <p>Please click the button below to set up your account and access your dashboard.</p>
        <a href="{invite_link}" style="display: inline-block; padding: 10px 20px; margin-top: 15px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Accept Invitation
        </a>
        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            If the button doesn't work, copy and paste this link into your browser: <br>
            {invite_link}
        </p>
    </div>
    """

    message = MessageSchema(
        subject=f"Invitation to join {business_name} on NexusGrid",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)