from fastapi import APIRouter
from ..core.config import settings

router = APIRouter()


@router.get("/health")
async def health():
    return {"code": 0, "message": "ok", "data": {"status": "up", "provider": settings.llm_provider}}
