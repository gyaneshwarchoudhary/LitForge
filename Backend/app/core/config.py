from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # ── Database ──────────────────────────────────────────────
    DATABASE_URL: str

    # ── JWT / Auth ────────────────────────────────────────────
    SECRET_KEY: str = "Your secret key "
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    # ── Pinecone ──────────────────────────────────────────────
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str = "book-helper"

    # ── Google Gemini Embeddings ──────────────────────────────
    GOOGLE_API_KEY: str

    # ── Google Gemini LLM ─────────────────────────────────────
    GOOGLE_LLM_API_KEY: str

    # ── Conversation Memory ───────────────────────────────────
    CONVERSATION_MAX_TURNS: int = 6
    CONVERSATION_MAX_HISTORY_CHARS: int = 4000


settings = Settings()
