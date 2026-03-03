from pydantic_settings import BaseSettings
from pydantic import ConfigDict

class Settings(BaseSettings):
    mongodb_uri: str
    mongodb_db: str = "ai_exam"
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60

    model_config = ConfigDict(
        env_file=".env",
        extra="allow"
    )

settings = Settings()
