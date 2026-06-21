import pytest
from app.llm.base import LLMResponse
from app.services import emotion_service
from app.core.exceptions import VibeChatError


class FakeLLM:
    provider = "test"

    async def chat(self, system, user, *, json_schema=None, **kw):
        return LLMResponse(
            content="{}",
            raw_json={"primary": "焦虑", "secondary": [], "valence": -0.7, "arousal": 0.8,
                      "intensity": 0.85, "social": 0.6, "keywords": ["汇报"],
                      "reading": "被汇报压着", "risk_flag": False},
            usage={}, provider="test", model="test",
        )


class FailingLLM:
    async def chat(self, *a, **kw):
        raise RuntimeError("boom")


async def test_analyze_normal(monkeypatch):
    monkeypatch.setattr(emotion_service, "get_llm", lambda: FakeLLM())
    data = await emotion_service.analyze_emotion("明天汇报睡不着")
    assert data["primary"] == "焦虑"
    assert data["provider"] == "test"
    assert data["vector"] == [-0.7, 0.8, 0.85, 0.6]


async def test_analyze_fallback_on_failure(monkeypatch):
    monkeypatch.setattr(emotion_service, "get_llm", lambda: FailingLLM())
    data = await emotion_service.analyze_emotion("很焦虑睡不着")
    assert data["provider"] == "rule-fallback"
    assert data["primary"] == "焦虑"


async def test_analyze_empty_raises():
    with pytest.raises(VibeChatError):
        await emotion_service.analyze_emotion("   ")


async def test_analyze_truncates_long_text(monkeypatch):
    monkeypatch.setattr(emotion_service, "get_llm", lambda: FailingLLM())
    data = await emotion_service.analyze_emotion("焦虑" * 1000)
    assert data["provider"] == "rule-fallback"
