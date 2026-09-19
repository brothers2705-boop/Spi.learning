from pydantic_settings import BaseSettings
from typing import List, Optional
import os

class Settings(BaseSettings):
    APP_NAME: str = "SPI LEARNING"
    ENVIRONMENT: str = "development"
    SECRET_KEY: str = "change-me-in-production-use-a-long-random-string"
    DATABASE_URL: str = "postgresql://postgres:postgres@localhost:5432/coursenotes"
    REDIS_URL: str = "redis://localhost:6379/0"
    
    AI_PROVIDER: str = "auto"
    ANTHROPIC_API_KEY: str = ""
    CLAUDE_MODEL: str = "claude-3-5-sonnet-20241022"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-1.5-flash"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    MAX_CHUNK_TOKENS: int = 12000
    CHUNK_OVERLAP_TOKENS: int = 500
    MAX_RETRIES: int = 3
    AI_CONCURRENCY: int = 3
    MAX_TRANSCRIPT_CHARS: int = 500000
    
    TRANSCRIPT_PROVIDERS: str = "youtube,thirdparty"
    PROXY_URL: Optional[str] = None
    WEBSHARE_PROXY_USERNAME: Optional[str] = None
    WEBSHARE_PROXY_PASSWORD: Optional[str] = None
    THIRDPARTY_TRANSCRIPT_API_KEY: Optional[str] = None
    THIRDPARTY_TRANSCRIPT_API_URL: Optional[str] = None
    
    MAX_VIDEO_DURATION_MINUTES: int = 300
    RATE_LIMIT_JOBS_PER_HOUR: int = 5
    FILE_RETENTION_HOURS: int = 24
    MAX_QUEUE_LENGTH: int = 100
    MAX_CONCURRENT_JOBS: int = 5
    GLOBAL_CONCURRENCY_LIMIT: int = 10
    
    STORAGE_BACKEND: str = "local"
    S3_BUCKET: Optional[str] = None
    S3_ENDPOINT_URL: Optional[str] = None
    S3_ACCESS_KEY_ID: Optional[str] = None
    S3_SECRET_ACCESS_KEY: Optional[str] = None
    S3_REGION: str = "us-east-1"
    LOCAL_STORAGE_PATH: str = "./storage"
    
    ALLOWED_ORIGINS: str = "http://localhost:3000,http://localhost:3001"
    FRONTEND_URL: str = "http://localhost:3000"
    
    ADMIN_TOKEN: Optional[str] = None
    SENTRY_DSN: Optional[str] = None
    
    CLAUDE_INPUT_COST_PER_M: float = 3.0
    CLAUDE_OUTPUT_COST_PER_M: float = 15.0
    
    @property
    def allowed_origins_list(self) -> List[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",") if o.strip()]
    
    @property
    def transcript_providers_list(self) -> List[str]:
        return [p.strip().lower() for p in self.TRANSCRIPT_PROVIDERS.split(",") if p.strip()]
    
    @property
    def is_production(self) -> bool:
        return self.ENVIRONMENT == "production"
    
    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()

def get_database_url() -> str:
    return settings.DATABASE_URL
