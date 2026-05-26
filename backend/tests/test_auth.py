import pytest


@pytest.mark.asyncio
async def test_register(client):
    response = await client.post("/api/auth/register", json={
        "username": "newuser",
        "email": "new@example.com",
        "password": "SecurePass123!",
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "newuser"
    assert data["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_register_duplicate(client):
    await client.post("/api/auth/register", json={
        "username": "dupuser",
        "email": "dup@example.com",
        "password": "SecurePass123!",
    })
    response = await client.post("/api/auth/register", json={
        "username": "dupuser",
        "email": "dup2@example.com",
        "password": "SecurePass123!",
    })
    assert response.status_code == 400


@pytest.mark.asyncio
async def test_login(client):
    await client.post("/api/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "SecurePass123!",
    })
    response = await client.post("/api/auth/login", json={
        "username": "loginuser",
        "password": "SecurePass123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_login_wrong_password(client):
    await client.post("/api/auth/register", json={
        "username": "wrongpw",
        "email": "wrong@example.com",
        "password": "SecurePass123!",
    })
    response = await client.post("/api/auth/login", json={
        "username": "wrongpw",
        "password": "WrongPass!",
    })
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_profile(client, test_user, auth_headers):  # noqa: ARG001
    response = await client.get("/api/users/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


@pytest.mark.asyncio
async def test_unauthorized(client):
    response = await client.get("/api/users/me")
    assert response.status_code == 403
