from datetime import datetime

import httpx
from fastapi import APIRouter

from app.config import get_settings
from app.schemas.common import HealthResponse

settings = get_settings()
router = APIRouter(tags=["health"])


@router.get("/api/health", response_model=HealthResponse)
async def health():
    try:
        async with httpx.AsyncClient(timeout=2) as client:
            resp = await client.get(f"{settings.OLLAMA_HOST}/api/tags")
            llm_status = "connected" if resp.status_code == 200 else "disconnected"
    except Exception:
        llm_status = "disconnected"

    return HealthResponse(
        status="ok",
        llm=llm_status,
        model=settings.OLLAMA_MODEL,
        timestamp=datetime.now().isoformat(),
    )
