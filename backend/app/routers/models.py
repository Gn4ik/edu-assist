from fastapi import APIRouter

from app.services.llm_service import list_models

router = APIRouter(prefix="/api/models", tags=["models"])


@router.get("")
async def get_models():
    models = await list_models()
    return {"models": models}
