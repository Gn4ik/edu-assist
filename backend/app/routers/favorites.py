from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.dependencies import get_current_user
from app.database import get_db
from app.models.user import User
from app.models.generation import Generation
from app.models.favorite import Favorite

router = APIRouter(prefix="/api/favorites", tags=["favorites"])


class AddFavoriteRequest(BaseModel):
    generation_id: int


@router.get("")
async def list_favorites(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    rows = (
        await db.execute(
            select(Favorite, Generation)
            .join(Generation, Favorite.generation_id == Generation.id)
            .where(Favorite.user_id == user.id)
            .order_by(Favorite.created_at.desc())
        )
    ).all()

    return {
        "items": [
            {
                "favorite_id": fav.id,
                "generation_id": gen.id,
                "type": gen.type,
                "input_content": gen.input_content[:200],
                "output_content": gen.output_content,
                "model_used": gen.model_used,
                "language": gen.language,
                "created_at": fav.created_at.isoformat(),
            }
            for fav, gen in rows
        ]
    }


@router.post("", status_code=201)
async def add_favorite(
    body: AddFavoriteRequest,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    gen = (
        await db.execute(
            select(Generation).where(
                Generation.id == body.generation_id, Generation.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if not gen:
        raise HTTPException(404, "Generation not found")

    existing = (
        await db.execute(
            select(Favorite).where(
                Favorite.user_id == user.id,
                Favorite.generation_id == body.generation_id,
            )
        )
    ).scalar_one_or_none()
    if existing:
        raise HTTPException(409, "Already in favorites")

    fav = Favorite(user_id=user.id, generation_id=body.generation_id)
    db.add(fav)
    await db.commit()
    await db.refresh(fav)
    return {"success": True, "favorite_id": fav.id}


@router.delete("/{favorite_id}", status_code=204)
async def remove_favorite(
    favorite_id: int,
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    fav = (
        await db.execute(
            select(Favorite).where(
                Favorite.id == favorite_id, Favorite.user_id == user.id
            )
        )
    ).scalar_one_or_none()
    if not fav:
        raise HTTPException(404, "Favorite not found")
    await db.delete(fav)
    await db.commit()
