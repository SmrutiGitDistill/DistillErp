import os

from pydantic_settings import BaseSettings
from pathlib import Path

IS_RENDER = bool(os.getenv("RENDER"))
ENV_FILE = None if IS_RENDER else Path(__file__).resolve().parent.parent.parent / ".env"
DEFAULT_ENVIRONMENT = "production" if IS_RENDER else "development"

class Settings(BaseSettings):
    DATABASE_URL: str | None = None
    DATABASE_PRIVATE_URL: str | None = None
    SECRET_KEY: str | None = None
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    ALLOWED_ORIGINS: str = "http://localhost:5173"
    ENVIRONMENT: str = DEFAULT_ENVIRONMENT
    BACKUP_PATH: str = "./backups"
    RENDER_EXTERNAL_URL: str | None = None
    INITIAL_SUPERADMIN_EMAIL: str | None = None
    INITIAL_SUPERADMIN_PASSWORD: str | None = None
    INITIAL_SUPERADMIN_NAME: str = "Super Admin"

    @property
    def origins_list(self):
        origins = [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
        # Render auto-injects RENDER_EXTERNAL_URL — add it so same-domain requests work
        if self.RENDER_EXTERNAL_URL:
            origins.append(self.RENDER_EXTERNAL_URL.rstrip("/"))
        return origins or ["http://localhost:5173"]

    @property
    def database_url(self) -> str:
        url = self.DATABASE_URL or self.DATABASE_PRIVATE_URL
        if not url:
            raise RuntimeError(
                "DATABASE_URL is not set. "
                "In Render, link a PostgreSQL database to this service and expose its "
                "connection string as DATABASE_URL in the Environment tab, then redeploy."
            )
        # Render (and older Heroku) return postgres:// — SQLAlchemy needs postgresql://
        if url.startswith("postgres://"):
            return url.replace("postgres://", "postgresql://", 1)
        return url

    def validate_for_startup(self):
        missing = []
        if not (self.DATABASE_URL or self.DATABASE_PRIVATE_URL):
            missing.append("DATABASE_URL")
        if not self.SECRET_KEY:
            missing.append("SECRET_KEY")
        if missing:
            raise RuntimeError(
                "Missing required environment variable(s): "
                + ", ".join(missing)
                + ". Set them in the Render service → Environment tab, then redeploy."
            )

    class Config:
        env_file = ENV_FILE
        env_file_encoding = "utf-8"
        extra = "ignore"   # silently discard unknown env vars (e.g. stale .env fields)

settings = Settings()
