from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    llm_provider: str = "openai"
    openai_base_url: str = "https://dashscope.aliyuncs.com/compatible-mode/v1"
    openai_api_key: str = ""
    openai_model: str = "qwen-plus"
    anthropic_base_url: str = "https://api.deepseek.com/anthropic"
    anthropic_api_key: str = ""
    anthropic_model: str = "deepseek-chat"
    database_url: str = "sqlite:///./vibechat.db"
    log_level: str = "INFO"
    daily_analysis_limit_guest: int = 10
    message_rate_limit_per_min: int = 30
    cors_origins: str = "http://localhost:3000"
    host: str = "127.0.0.1"
    port: int = 8000


settings = Settings()
