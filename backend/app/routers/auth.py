from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, generate_api_key
from app.core.security import decode_token
from app.database import get_db
from app.models.user import User
from app.schemas.auth import RegisterRequest, LoginRequest, TokenResponse
from app.schemas.user import UserOut
from app.services.auth_service import register_user, authenticate_user, create_tokens

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/register", response_model=UserOut, status_code=201)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await register_user(db, body.username, body.email, body.password)
    except ValueError as e:
        raise HTTPException(400, str(e))
    return user


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    try:
        user = await authenticate_user(db, body.username, body.password)
    except ValueError as e:
        raise HTTPException(401, str(e))
    return create_tokens(user.id)


@router.post("/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str, db: AsyncSession = Depends(get_db)):
    try:
        payload = decode_token(refresh_token)
        if payload.get("type") != "refresh":
            raise ValueError()
        user_id = int(payload["sub"])
    except Exception:
        raise HTTPException(401, "Invalid refresh token")

    from sqlalchemy import select
    user = (await db.execute(select(User).where(User.id == user_id))).scalar_one_or_none()
    if not user:
        raise HTTPException(401, "User not found")

    return create_tokens(user.id)


@router.post("/api-key")
async def create_api_key(
    user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user.api_key = generate_api_key()
    await db.commit()
    return {"api_key": user.api_key}
