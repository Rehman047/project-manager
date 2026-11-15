from pathlib import Path
from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+psycopg2://postgres:postgres@localhost:5432/project_manager"
    JWT_SECRET: str = "change-this-secret-in-production"
    GEMINI_API_KEY: str = ""

    model_config = SettingsConfigDict(
        env_file=Path(__file__).resolve().parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def use_database_default_for_blank_values(cls, value: str) -> str:
        return value or "postgresql+psycopg2://postgres:postgres@localhost:5432/project_manager"

    @field_validator("JWT_SECRET", mode="before")
    @classmethod
    def use_jwt_default_for_blank_values(cls, value: str) -> str:
        return value or "change-this-secret-in-production"


settings = Settings()
