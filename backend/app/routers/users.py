from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.generation import Generation
from app.models.favorite import Favorite

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/me")
async def get_profile(user: User = Depends(get_current_user)):
    return {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "is_active": user.is_active,
        "settings": user.settings,
        "created_at": user.created_at.isoformat(),
    }


@router.get("/me/stats")
async def get_stats(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total = await db.scalar(
        select(func.count()).select_from(Generation).where(Generation.user_id == user.id)
    )
    favorites_count = await db.scalar(
        select(func.count()).select_from(Favorite).where(Favorite.user_id == user.id)
    )

    type_rows = (
        await db.execute(
            select(Generation.type, func.count())
            .where(Generation.user_id == user.id)
            .group_by(Generation.type)
        )
    ).all()
    by_type = {r[0]: r[1] for r in type_rows}

    model_rows = (
        await db.execute(
            select(Generation.model_used, func.count())
            .where(Generation.user_id == user.id)
            .group_by(Generation.model_used)
        )
    ).all()

    avg_time = await db.scalar(
        select(func.avg(Generation.processing_time_ms)).where(Generation.user_id == user.id)
    ) or 0

    week_ago = datetime.now(timezone.utc) - timedelta(days=7)
    recent = await db.scalar(
        select(func.count()).select_from(Generation).where(
            Generation.user_id == user.id, Generation.created_at >= week_ago
        )
    )

    lang_rows = (
        await db.execute(
            select(Generation.language, func.count())
            .where(Generation.user_id == user.id)
            .group_by(Generation.language)
        )
    ).all()

    return {
        "total_generations": total,
        "by_type": by_type,
        "total_favorites": favorites_count,
        "models_used": {r[0]: r[1] for r in model_rows},
        "avg_processing_time_ms": int(avg_time),
        "generations_last_7_days": recent,
        "languages_used": {r[0]: r[1] for r in lang_rows},
    }
