import json
import httpx
from .base import LLMResponse


class OpenAIClient:
    provider = "openai"

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
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }
        body = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system},
                {"role": "user", "content": user},
            ],
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if json_schema:
            body["response_format"] = {"type": "json_object"}

        async with httpx.AsyncClient(timeout=60) as c:
            r = await c.post(f"{self.base_url}/chat/completions", headers=headers, json=body)
            r.raise_for_status()
            data = r.json()

        text = data["choices"][0]["message"]["content"]
        raw = json.loads(text) if json_schema else None
        usage = {
            "input_tokens": data["usage"]["prompt_tokens"],
            "output_tokens": data["usage"]["completion_tokens"],
        }
        return LLMResponse(
            content=text, raw_json=raw, usage=usage, provider="openai", model=self.model
        )
