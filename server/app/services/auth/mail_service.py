from fastapi_mail import FastMail, MessageSchema, MessageType

from app.services.email_service import conf


async def send_reset_password_email(
    email_to: str,
    user_name: str,
    reset_link: str,
):

    html_content = f"""
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">

        <h2 style="color: #1e293b;">
            Reset Your Password
        </h2>

        <p>
            Hello {user_name},
        </p>

        <p>
            Click the button below to reset your password:
        </p>

        <a
            href="{reset_link}"
            style="
                display: inline-block;
                padding: 12px 24px;
                background-color: #2563eb;
                color: white;
                text-decoration: none;
                border-radius: 8px;
                margin-top: 20px;
                font-weight: bold;
            "
        >
            Reset Password
        </a>

        <p style="margin-top: 20px;">
            This link will expire in
            <strong>15 minutes</strong>.
        </p>

        <p>
            If you did not request this,
            please ignore this email.
        </p>

        <p style="margin-top: 30px; font-size: 12px; color: #64748b;">
            © NexusGrid
        </p>

    </div>
    """

    message = MessageSchema(
        subject="Reset Your Password - Korvex",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html,
    )

    fm = FastMail(conf)

    await fm.send_message(message)
