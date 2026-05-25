from pathlib import Path
from functools import lru_cache

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # App
    APP_NAME: str = "EduAssist"
    APP_VERSION: str = "2.0.0"
    DEBUG: bool = False
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://localhost:3000",
    ]

    # Paths
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    FONT_DIR: Path = BASE_DIR / "fonts"
    UPLOAD_DIR: Path = BASE_DIR / "uploads"

    # Ollama
    OLLAMA_HOST: str = "http://localhost:11434"
    OLLAMA_MODEL: str = "llama3.1:latest"
    OLLAMA_TIMEOUT: int = 120

    # Chunking
    CHUNK_SIZE: int = 1500
    CHUNK_OVERLAP: int = 200

    # Cache
    CACHE_DIR: Path = BASE_DIR / ".cache"
    CACHE_SIZE_MB: int = 200

    # Database - PostgreSQL
    POSTGRES_USER: str = "eduassist"
    POSTGRES_PASSWORD: str = "your_secure_password"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "eduassist"
    
    @property
    def DATABASE_URL(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    # Auth
    JWT_SECRET_KEY: str = "change-me-in-production-use-a-real-secret"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Rate limiting
    RATE_LIMIT_PER_MINUTE: int = 20

    # File upload
    MAX_FILE_SIZE_MB: int = 10
    MAX_FILE_SIZE_BYTES: int = 10 * 1024 * 1024

    # Logging
    LOG_LEVEL: str = "INFO"

    model_config = {"env_file": ".env", "env_file_encoding": "utf-8"}


@lru_cache
def get_settings() -> Settings:
    return Settings()