import pytest
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio


async def test_register_success(client: AsyncClient):
    """Тест успешной регистрации"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "SecurePass123!"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"
    assert "id" in data
    assert "created_at" in data


async def test_register_duplicate_username(client: AsyncClient, test_user):
    """Тест регистрации с существующим username"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": test_user.username,
            "email": "another@example.com",
            "password": "SecurePass123!"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


async def test_register_duplicate_email(client: AsyncClient, test_user):
    """Тест регистрации с существующим email"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "anotheruser",
            "email": test_user.email,
            "password": "SecurePass123!"
        }
    )
    assert response.status_code == 400
    assert "already exists" in response.json()["detail"]


async def test_register_short_password(client: AsyncClient):
    """Тест регистрации с коротким паролем"""
    response = await client.post(
        "/api/auth/register",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "short"
        }
    )
    assert response.status_code == 422  # Validation error


async def test_login_success(client: AsyncClient, test_user):
    """Тест успешного логина"""
    response = await client.post(
        "/api/auth/login",
        json={
            "username": "testuser",
            "password": "TestPassword123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"
    assert "expires_in" in data


async def test_login_with_email(client: AsyncClient, test_user):
    """Тест логина с email вместо username"""
    response = await client.post(
        "/api/auth/login",
        json={
            "username": test_user.email,
            "password": "TestPassword123!"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data


async def test_login_wrong_password(client: AsyncClient, test_user):
    """Тест логина с неверным паролем"""
    response = await client.post(
        "/api/auth/login",
        json={
            "username": "testuser",
            "password": "WrongPassword"
        }
    )
    assert response.status_code == 401
    assert "Invalid credentials" in response.json()["detail"]


async def test_login_nonexistent_user(client: AsyncClient):
    """Тест логина с несуществующим пользователем"""
    response = await client.post(
        "/api/auth/login",
        json={
            "username": "nonexistent",
            "password": "Password123!"
        }
    )
    assert response.status_code == 401


async def test_refresh_token_success(client: AsyncClient, test_user):
    """Тест обновления токена"""
    # Сначала логинимся
    login_response = await client.post(
        "/api/auth/login",
        json={
            "username": "testuser",
            "password": "TestPassword123!"
        }
    )
    assert login_response.status_code == 200
    refresh_token = login_response.json()["refresh_token"]
    
    # Обновляем токен - отправляем как query parameter
    response = await client.post(f"/api/auth/refresh?refresh_token={refresh_token}")
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["token_type"] == "bearer"


async def test_refresh_token_invalid(client: AsyncClient):
    """Тест с неверным refresh токеном"""
    response = await client.post("/api/auth/refresh?refresh_token=invalid_token")
    assert response.status_code == 401
    assert "Invalid refresh token" in response.json()["detail"]


async def test_api_key_creation(authenticated_client: AsyncClient):
    """Тест создания API ключа"""
    response = await authenticated_client.post("/api/auth/api-key")
    assert response.status_code == 200
    data = response.json()
    assert "api_key" in data
    assert data["api_key"].startswith("edu_")