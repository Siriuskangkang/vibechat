from app.llm.base import LLMResponse
from app.services import host_service


class IcebreakLLM:
    async def chat(self, system, user, *, json_schema=None, **kw):
        return LLMResponse(content="{}", raw_json={"message": "测试破冰语"}, usage={}, provider="t", model="t")


class SummaryLLM:
    async def chat(self, system, user, *, json_schema=None, **kw):
        return LLMResponse(content="{}", raw_json={
            "summary": "你今晚被汇报压着", "takeaway": "说出来就轻了一点",
            "mood_end": {"valence": -0.3, "arousal": 0.4},
        }, usage={}, provider="t", model="t")


class FailLLM:
    async def chat(self, *a, **kw):
        raise RuntimeError("boom")


async def test_icebreak_normal(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: IcebreakLLM())
    assert await host_service.icebreak("emo", "低沉", "低落", []) == "测试破冰语"


async def test_icebreak_fallback(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: FailLLM())
    msg = await host_service.icebreak("emo", "低沉", "低落", [])
    assert msg == host_service.ICEBREAK_FALLBACK["emo"]


async def test_summarize_has_mood_end(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: SummaryLLM())
    r = await host_service.summarize("焦虑", "深夜焦虑", "睡不着")
    assert r["mood_end"] == {"valence": -0.3, "arousal": 0.4}
    assert "summary" in r and "takeaway" in r


async def test_summarize_fallback(monkeypatch):
    monkeypatch.setattr(host_service, "get_llm", lambda: FailLLM())
    r = await host_service.summarize("焦虑", "深夜焦虑", "睡不着")
    assert "mood_end" in r and "summary" in r
