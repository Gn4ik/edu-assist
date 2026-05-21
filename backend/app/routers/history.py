from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func, desc

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.generation import Generation
from app.models.favorite import Favorite

router = APIRouter(prefix="/api/history", tags=["history"])


@router.get("")
async def list_history(
    type: str | None = None,
    language: str | None = None,
    search: str | None = None,
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Generation).where(Generation.user_id == user.id)
    if type:
        query = query.where(Generation.type == type)
    if language:
        query = query.where(Generation.language == language)
    if search:
        query = query.where(Generation.input_content.ilike(f"%{search}%"))

    total = await db.scalar(
        select(func.count()).select_from(query.subquery())
    )
    items = (
        await db.execute(
            query.order_by(desc(Generation.created_at))
            .offset((page - 1) * per_page)
            .limit(per_page)
        )
    ).scalars().all()

    fav_ids = set(
        r[0] for r in (
            await db.execute(
                select(Favorite.generation_id).where(Favorite.user_id == user.id)
            )
        ).all()
    )

    return {
        "items": [
            {
                "id": g.id,
                "type": g.type,
                "input_type": g.input_type,
                "input_content": g.input_content[:200],
                "output_content": g.output_content,
                "model_used": g.model_used,
                "language": g.language,
                "difficulty": g.difficulty,
                "processing_time_ms": g.processing_time_ms,
                "is_favorite": g.id in fav_ids,
                "created_at": g.created_at.isoformat(),
            }
            for g in items
        ],
        "total": total,
        "page": page,
        "per_page": per_page,
        "pages": (total + per_page - 1) // per_page if total else 0,
    }


@router.get("/{generation_id}")
async def get_history_item(
    generation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = (
        await db.execute(
            select(Generation).where(
                Generation.id == generation_id, Generation.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if not gen:
        raise HTTPException(404, "Generation not found")
    return {
        "id": gen.id,
        "type": gen.type,
        "input_type": gen.input_type,
        "input_content": gen.input_content,
        "output_content": gen.output_content,
        "model_used": gen.model_used,
        "language": gen.language,
        "difficulty": gen.difficulty,
        "processing_time_ms": gen.processing_time_ms,
        "tokens_used": gen.tokens_used,
        "from_cache": gen.from_cache,
        "created_at": gen.created_at.isoformat(),
    }


@router.delete("/{generation_id}", status_code=204)
async def delete_history_item(
    generation_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = (
        await db.execute(
            select(Generation).where(
                Generation.id == generation_id, Generation.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if not gen:
        raise HTTPException(404, "Generation not found")
    await db.delete(gen)
    await db.commit()
