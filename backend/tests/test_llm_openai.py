import json
import httpx
import respx
from app.llm.openai_client import OpenAIClient


@respx.mock
async def test_openai_structured_request_and_parse():
    respx.post("https://ex.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json={
            "choices": [{"message": {"content": '{"primary":"焦虑","valence":-0.7}'}}],
            "usage": {"prompt_tokens": 10, "completion_tokens": 5},
        })
    )
    client = OpenAIClient("https://ex.com/v1", "sk-x", "qwen-plus")
    resp = await client.chat("你是情绪分析", "睡不着", json_schema={"type": "object"})

    assert resp.provider == "openai"
    assert resp.model == "qwen-plus"
    assert resp.raw_json == {"primary": "焦虑", "valence": -0.7}
    assert resp.usage == {"input_tokens": 10, "output_tokens": 5}

    body = json.loads(respx.calls[0].request.content)
    assert body["model"] == "qwen-plus"
    assert body["response_format"] == {"type": "json_object"}
    assert body["messages"][0] == {"role": "system", "content": "你是情绪分析"}
    assert body["messages"][1] == {"role": "user", "content": "睡不着"}
    assert respx.calls[0].request.headers["authorization"] == "Bearer sk-x"


@respx.mock
async def test_openai_plain_text():
    respx.post("https://ex.com/v1/chat/completions").mock(
        return_value=httpx.Response(200, json={
            "choices": [{"message": {"content": "你好"}}],
            "usage": {"prompt_tokens": 1, "completion_tokens": 1},
        })
    )
    client = OpenAIClient("https://ex.com/v1", "sk-x", "qwen-plus")
    resp = await client.chat("s", "u")
    assert resp.raw_json is None
    assert resp.content == "你好"
