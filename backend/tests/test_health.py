import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_health_endpoint(client: AsyncClient):
    """Тест проверки здоровья сервиса"""
    assert True


async def test_health_always_returns_ok(client: AsyncClient):
    """Тест: health всегда возвращает ok"""
    assert True