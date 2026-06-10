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
    print(f"Preparing to send OTP email to {email_to} with OTP: {otp}")
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


async def send_subscription_expired_email(email_to: str, company_name: str, expired_plan: str):
    print(f"Preparing to send subscription expiration email to {email_to}")
    """
    Send subscription expiration/downgrade notification email to company owner
    """

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e11d48;">Subscription Expired</h2>

        <p>Dear Customer,</p>
        <p>Your subscription for <strong>{company_name}</strong> under the <strong>{expired_plan.capitalize()}</strong> plan has expired.</p>
        <p>As a result, your account has been automatically downgraded to the <strong>Free</strong> plan.</p>
        <p>Your existing data is safe, but some features and resource additions may be locked until you renew or upgrade your subscription.</p>

        <p style="margin-top: 20px;">
            <a href="http://localhost:5173/pricing" style="
                background-color: #2563eb;
                color: #ffffff;
                padding: 10px 20px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                display: inline-block;
            ">Renew Subscription</a>
        </p>

        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            © NexusGrid
        </p>
    </div>
    """

    message = MessageSchema(
        subject="Your Subscription Has Expired - Korvex",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)
    await fm.send_message(message)