from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    SECRET_KEY: str = "hve1rhfLe6NmBMr5s6GKx9tjneqWton8nwJST63r5-w"
    ALGORITHM: str = "HS256"
    MONGO_URL: str = "mongodb://mongodb:27017"
    MONGO_DB: str = "chat_db"
    REDIS_URL: str = "redis://redis:6379/0"
    PORT: int = 8002

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
