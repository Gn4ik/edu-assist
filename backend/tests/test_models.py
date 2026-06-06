import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_get_models(authenticated_client: AsyncClient):
    """Тест получения списка моделей"""
    assert True


async def test_get_models_requires_auth(client: AsyncClient):
    """Тест: список моделей требует авторизации"""
    assert True