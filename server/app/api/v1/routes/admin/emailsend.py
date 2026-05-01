from fastapi_mail import FastMail, MessageSchema, MessageType
from .config import conf

async def send_invite_email(receiver_email: str, invite_link: str):
    message = MessageSchema(
        subject="You're invited!",
        recipients=[receiver_email],
        body=f"""
        Hello,

        You have been invited.

        Click below to register:
        {invite_link}
        """,
        subtype=MessageType.plain,
    )

    fm = FastMail(conf)
    await fm.send_message(message)