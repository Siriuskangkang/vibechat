from app.core.config import settings
from app.llm.factory import get_llm
from app.llm.openai_client import OpenAIClient
from app.llm.anthropic_client import AnthropicClient


def test_factory_returns_openai(monkeypatch):
    monkeypatch.setattr(settings, "llm_provider", "openai")
    assert isinstance(get_llm(), OpenAIClient)


def test_factory_returns_anthropic(monkeypatch):
    monkeypatch.setattr(settings, "llm_provider", "anthropic")
    assert isinstance(get_llm(), AnthropicClient)
