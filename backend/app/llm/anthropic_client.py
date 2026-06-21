import json
import re
import httpx
from .base import LLMResponse


def _parse_json_lenient(text: str):
    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    try:
        return json.loads(m.group(0))
    except json.JSONDecodeError:
        return None


class AnthropicClient:
    provider = "anthropic"

    def __init__(self, base_url: str, api_key: str, model: str):
        self.base_url = base_url
        self.api_key = api_key
        self.model = model

    async def chat(
        self,
        system: str,
        user: str,
        *,
        json_schema: dict | None = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> LLMResponse:
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json",
        }
        messages = [{"role": "user", "content": user}]
        if json_schema:
            messages.append({"role": "assistant", "content": "{"})

        body = {
            "model": self.model,
            "system": system,
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature,
        }

        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.post(f"{self.base_url}/messages", headers=headers, json=body)
            r.raise_for_status()
            data = r.json()

        text = "".join(b.get("text", "") for b in data["content"] if b.get("type") == "text")
        if json_schema:
            text = "{" + text
        raw = _parse_json_lenient(text) if json_schema else None
        usage = {
            "input_tokens": data["usage"]["input_tokens"],
            "output_tokens": data["usage"]["output_tokens"],
        }
        return LLMResponse(
            content=text, raw_json=raw, usage=usage, provider="anthropic", model=self.model
        )
