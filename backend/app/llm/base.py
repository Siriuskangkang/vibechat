from dataclasses import dataclass
from typing import Optional, Protocol


@dataclass
class LLMResponse:
    content: str
    raw_json: Optional[dict]
    usage: dict
    provider: str
    model: str


class LLMClient(Protocol):
    provider: str

    async def chat(
        self,
        system: str,
        user: str,
        *,
        json_schema: Optional[dict] = None,
        temperature: float = 0.3,
        max_tokens: int = 1024,
    ) -> LLMResponse: ...
