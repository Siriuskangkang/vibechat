import json
import httpx
import respx
from app.llm.anthropic_client import AnthropicClient


@respx.mock
async def test_anthropic_structured_system_separate():
    respx.post("https://ex.com/v1/messages").mock(
        return_value=httpx.Response(200, json={
            "content": [{"type": "text", "text": '{"primary":"焦虑","valence":-0.7}'}],
            "usage": {"input_tokens": 10, "output_tokens": 5},
        })
    )
    client = AnthropicClient("https://ex.com", "sk-x", "deepseek-chat")
    resp = await client.chat("你是情绪分析", "睡不着", json_schema={"type": "object"})

    # 解析正确
    assert resp.provider == "anthropic"
    assert resp.raw_json == {"primary": "焦虑", "valence": -0.7}
    assert resp.usage == {"input_tokens": 10, "output_tokens": 5}

    # 请求体构造正确（Anthropic 标准：system 单独 + 端点 /v1/messages）
    body = json.loads(respx.calls[0].request.content)
    assert body["model"] == "deepseek-chat"
    assert body["system"] == "你是情绪分析"          # ★ system 单独字段
    assert body["messages"] == [{"role": "user", "content": "睡不着"}]
    assert respx.calls[0].request.headers["x-api-key"] == "sk-x"
    assert respx.calls[0].request.headers["anthropic-version"] == "2023-06-01"


@respx.mock
async def test_anthropic_skips_thinking_block():
    # 推理模型：content 含 thinking 块 + text 块，只取 text
    respx.post("https://ex.com/v1/messages").mock(
        return_value=httpx.Response(200, json={
            "content": [
                {"type": "thinking", "thinking": "...推理过程..."},
                {"type": "text", "text": '{"primary":"平静"}'},
            ],
            "usage": {"input_tokens": 10, "output_tokens": 20},
        })
    )
    client = AnthropicClient("https://ex.com", "sk-x", "deepseek-chat")
    resp = await client.chat("s", "u", json_schema={"type": "object"})
    assert resp.raw_json == {"primary": "平静"}


@respx.mock
async def test_anthropic_plain_text():
    respx.post("https://ex.com/v1/messages").mock(
        return_value=httpx.Response(200, json={
            "content": [{"type": "text", "text": "你好"}],
            "usage": {"input_tokens": 1, "output_tokens": 1},
        })
    )
    client = AnthropicClient("https://ex.com", "sk-x", "deepseek-chat")
    resp = await client.chat("s", "u")
    assert resp.raw_json is None
    assert resp.content == "你好"
