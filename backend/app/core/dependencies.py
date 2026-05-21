import secrets

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.core.security import decode_token
from app.core.rate_limiter import RateLimiter
from app.database import get_db
from app.models.user import User

security_scheme = HTTPBearer()
rate_limiter = RateLimiter()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    try:
        payload = decode_token(credentials.credentials)
        if payload.get("type") != "access":
            raise HTTPException(status_code=401, detail="Invalid token type")
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
        )

    result = await db.execute(select(User).where(User.id == int(user_id)))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        raise HTTPException(status_code=401, detail="User not found or inactive")
    return user


async def require_rate_limit(user: User = Depends(get_current_user)) -> User:
    if not rate_limiter.is_allowed(user.id):
        raise HTTPException(status_code=429, detail="Rate limit exceeded. Try again later.")
    return user


def generate_api_key() -> str:
    return f"edu_{secrets.token_hex(24)}"
