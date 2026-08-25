"""API 및 SQLite 영구 저장 통합 테스트."""

from __future__ import annotations

import os
import tempfile
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

TEST_DB = Path(tempfile.gettempdir()) / "tennis_test.db"
os.environ["TENNIS_DB_PATH"] = str(TEST_DB)

if TEST_DB.exists():
    TEST_DB.unlink()

from main import app, bootstrap_state  # noqa: E402


@pytest.fixture
def client():
    if TEST_DB.exists():
        TEST_DB.unlink()
    bootstrap_state()
    with TestClient(app) as c:
        yield c
    if TEST_DB.exists():
        TEST_DB.unlink()


def test_health(client):
    r = client.get("/api/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_persistence_across_restart(client):
    client.post("/api/reset")
    client.post("/api/players", json={"name": "영구저장", "skill_rank": 1})
    client.put("/api/settings", json={"mode": "FIXED_TEAM", "courts": 2})

    bootstrap_state()
    with TestClient(app) as c2:
        players = c2.get("/api/players").json()
        settings = c2.get("/api/settings").json()
        assert any(p["name"] == "영구저장" for p in players)
        assert settings["mode"] == "FIXED_TEAM"


@pytest.mark.parametrize("mode", ["INDIVIDUAL", "THREE_KINGDOMS", "UP_DOWN", "FIXED_TEAM"])
def test_four_modes(client, mode):
    client.post("/api/reset")
    for i, name in enumerate(["A", "B", "C", "D", "E", "F"], 1):
        client.post("/api/players", json={"name": name, "skill_rank": i})

    client.put("/api/settings", json={"mode": mode, "courts": 2})
    gen = client.post("/api/matches/generate", json={"mode": mode}).json()
    matches = gen["matches"]
    assert matches

    m = matches[0]
    client.post(
        f"/api/matches/{m['id']}/result",
        json={"score_a": 6, "score_b": 3},
    )
    rankings = client.get("/api/rankings").json()
    assert rankings["rankings"] is not None


def test_individual_six_player_rotation(client):
    client.post("/api/reset")
    for i in range(1, 7):
        client.post("/api/players", json={"name": f"P{i}", "skill_rank": i})

    gen = client.post(
        "/api/matches/generate",
        json={"mode": "INDIVIDUAL", "courts": 2},
    ).json()
    assert len(gen["matches"]) == 5


def test_monthly_archive_and_year_awards(client):
    client.post("/api/reset")
    names = ["Alpha", "Beta", "Gamma", "Delta", "Echo", "Foxtrot"]
    for i, name in enumerate(names, 1):
        client.post("/api/players", json={"name": name, "skill_rank": i})

    client.put("/api/settings", json={"mode": "INDIVIDUAL", "courts": 2})
    gen = client.post("/api/matches/generate", json={"mode": "INDIVIDUAL"}).json()

    for idx, match in enumerate(gen["matches"]):
        sa = 6 if idx % 2 == 0 else 3
        sb = 3 if idx % 2 == 0 else 6
        client.post(
            f"/api/matches/{match['id']}/result",
            json={"score_a": sa, "score_b": sb},
        )

    preview = client.get("/api/monthly-records/preview/current").json()
    assert preview["results"]
    assert preview["completed_matches"] == len(gen["matches"])

    record = client.post(
        "/api/monthly-records",
        json={"year": 2026, "month": 3, "title": "2026년 3월 월례회"},
    ).json()
    assert record["year"] == 2026
    assert record["month"] == 3
    assert len(record["results"]) >= 3

    record2 = client.post(
        "/api/monthly-records",
        json={"year": 2026, "month": 4, "title": "2026년 4월 월례회", "overwrite": False},
    ).json()
    assert record2["month"] == 4

    awards = client.get("/api/year-awards/2026").json()
    assert awards["monthly_count"] == 2
    assert len(awards["ceremony_awards"]) == 3
    assert awards["ceremony_awards"][0]["ceremony_rank"] == 1
    assert awards["ceremony_awards"][0]["total_points"] >= awards["ceremony_awards"][1]["total_points"]

    dup = client.post(
        "/api/monthly-records",
        json={"year": 2026, "month": 3},
    )
    assert dup.status_code == 409

    overwrite = client.post(
        "/api/monthly-records",
        json={"year": 2026, "month": 3, "overwrite": True},
    ).json()
    assert overwrite["month"] == 3

