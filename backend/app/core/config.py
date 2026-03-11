"""ShieldSpeak Backend - Core configuration."""

from pydantic_settings import BaseSettings
from typing import List


class Settings(BaseSettings):
    APP_NAME: str = "ShieldSpeak"
    APP_ENV: str = "development"
    APP_SECRET_KEY: str = "change-me-in-production"

    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    DATABASE_URL: str = "postgresql+psycopg://shieldspeak:shieldspeak@localhost:5432/shieldspeak"
    REDIS_URL: str = "redis://localhost:6379/0"

    CORS_ORIGINS: str = "http://localhost:3000"

    MODEL_NAME_TEXT_CLASSIFIER: str = "unitary/toxic-bert"
    WHISPER_MODEL_SIZE: str = "base"
    MAX_AUDIO_UPLOAD_MB: int = 25

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()
