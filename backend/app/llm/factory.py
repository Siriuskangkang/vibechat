from ..core.config import settings
from .anthropic_client import AnthropicClient
from .base import LLMClient
from .openai_client import OpenAIClient


def get_llm() -> LLMClient:
    if settings.llm_provider == "anthropic":
        return AnthropicClient(
            settings.anthropic_base_url,
            settings.anthropic_api_key,
            settings.anthropic_model,
        )
    return OpenAIClient(
        settings.openai_base_url,
        settings.openai_api_key,
        settings.openai_model,
    )
