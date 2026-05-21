import pytest


@pytest.mark.asyncio
async def test_health(client):
    response = await client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"


@pytest.mark.asyncio
async def test_history_empty(client, auth_headers):
    response = await client.get("/api/history", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []
    assert data["total"] == 0


@pytest.mark.asyncio
async def test_favorites_empty(client, auth_headers):
    response = await client.get("/api/favorites", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["items"] == []


@pytest.mark.asyncio
async def test_stats(client, auth_headers):
    response = await client.get("/api/users/me/stats", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "total_generations" in data
    assert "by_type" in data


@pytest.mark.asyncio
async def test_summary_no_input(client, auth_headers):
    response = await client.post("/api/generation/summary", json={}, headers=auth_headers)
    assert response.status_code == 400
