from fastapi import APIRouter, Depends, HTTPException

from app.core.dependencies import get_current_user
from app.models.user import User
from app.cache import clear_cache

router = APIRouter(prefix="/api/cache", tags=["cache"])


@router.delete("/{cache_type}")
async def clear_cache_endpoint(
    cache_type: str,
    user: User = Depends(get_current_user),  # noqa: ARG001
):
    if cache_type not in ["all", "summary", "flashcards", "quiz"]:
        raise HTTPException(400, "Invalid cache type")
    keys_removed = clear_cache(cache_type)
    return {"success": True, "cleared": cache_type, "keys_removed": keys_removed}
