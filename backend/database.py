"""SQLite 영구 저장소 — 앱 상태 load/save."""

from __future__ import annotations

import json
import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Tuple

SCHEMA_PATH = Path(__file__).parent / "schema_sqlite.sql"
DEFAULT_DB_PATH = Path(__file__).parent / "data" / "tennis.db"
DB_PATH = Path(os.environ.get("TENNIS_DB_PATH", DEFAULT_DB_PATH))


def _connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db() -> None:
    sql = SCHEMA_PATH.read_text(encoding="utf-8")
    with _connect() as conn:
        conn.executescript(sql)
        conn.commit()


def _json_load(raw: str | None, default: Any) -> Any:
    if raw is None:
        return default
    return json.loads(raw)


def load_state() -> Tuple[
    List[Dict[str, Any]],
    List[Dict[str, Any]],
    Dict[str, Any],
    List[Dict[str, Any]],
    Dict[str, List[int]],
    List[Dict[str, Any]],
    int,
    int,
]:
    init_db()
    with _connect() as conn:
        settings_row = conn.execute("SELECT mode, courts FROM settings WHERE id = 1").fetchone()
        settings = {
            "mode": settings_row["mode"] if settings_row else "INDIVIDUAL",
            "courts": settings_row["courts"] if settings_row else 2,
        }

        players = [
            {
                "id": row["id"],
                "name": row["name"],
                "skill_rank": row["skill_rank"],
                "team": row["team"],
                "partner_id": row["partner_id"],
            }
            for row in conn.execute(
                "SELECT id, name, skill_rank, team, partner_id FROM players ORDER BY id"
            )
        ]

        matches = []
        for row in conn.execute(
            """
            SELECT id, mode, round_num, court, team_a_ids, team_b_ids,
                   team_a_label, team_b_label, score_a, score_b, status
            FROM matches ORDER BY id
            """
        ):
            m: Dict[str, Any] = {
                "id": row["id"],
                "mode": row["mode"],
                "round_num": row["round_num"],
                "court": row["court"],
                "team_a_ids": _json_load(row["team_a_ids"], []),
                "team_b_ids": _json_load(row["team_b_ids"], []),
                "score_a": row["score_a"],
                "score_b": row["score_b"],
                "status": row["status"],
            }
            if row["team_a_label"]:
                m["team_a_label"] = row["team_a_label"]
            if row["team_b_label"]:
                m["team_b_label"] = row["team_b_label"]
            matches.append(m)

        court_states = [
            {
                "court": row["court"],
                "label": row["label"],
                "player_ids": _json_load(row["player_ids"], []),
            }
            for row in conn.execute(
                "SELECT court, label, player_ids FROM court_states ORDER BY court"
            )
        ]

        team_row = conn.execute(
            "SELECT value FROM meta WHERE key = 'team_assignments'"
        ).fetchone()
        team_assignments = _json_load(team_row["value"] if team_row else None, {})

        fixed_row = conn.execute(
            "SELECT value FROM meta WHERE key = 'fixed_teams'"
        ).fetchone()
        fixed_teams = _json_load(fixed_row["value"] if fixed_row else None, [])

        next_player = conn.execute(
            "SELECT value FROM meta WHERE key = 'next_player_id'"
        ).fetchone()
        next_match = conn.execute(
            "SELECT value FROM meta WHERE key = 'next_match_id'"
        ).fetchone()
        next_player_id = int(next_player["value"]) if next_player else max(
            (p["id"] for p in players), default=0
        ) + 1
        next_match_id = int(next_match["value"]) if next_match else max(
            (m["id"] for m in matches), default=0
        ) + 1

    return (
        players,
        matches,
        settings,
        court_states,
        team_assignments,
        fixed_teams,
        next_player_id,
        next_match_id,
    )


def save_state(
    players_db: List[Dict[str, Any]],
    matches_db: List[Dict[str, Any]],
    settings_db: Dict[str, Any],
    court_states_db: List[Dict[str, Any]],
    team_assignments_db: Dict[str, List[int]],
    fixed_teams_db: List[Dict[str, Any]],
    next_player_id: int,
    next_match_id: int,
) -> None:
    init_db()
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO settings (id, mode, courts, updated_at)
            VALUES (1, ?, ?, ?)
            ON CONFLICT(id) DO UPDATE SET
                mode = excluded.mode,
                courts = excluded.courts,
                updated_at = excluded.updated_at
            """,
            (settings_db["mode"], settings_db["courts"], now),
        )

        conn.execute("DELETE FROM players")
        for p in players_db:
            conn.execute(
                """
                INSERT INTO players (id, name, skill_rank, team, partner_id)
                VALUES (?, ?, ?, ?, ?)
                """,
                (p["id"], p["name"], p.get("skill_rank", 0), p.get("team"), p.get("partner_id")),
            )

        conn.execute("DELETE FROM matches")
        for m in matches_db:
            conn.execute(
                """
                INSERT INTO matches (
                    id, mode, round_num, court, team_a_ids, team_b_ids,
                    team_a_label, team_b_label, score_a, score_b, status
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    m["id"],
                    m["mode"],
                    m.get("round_num", 1),
                    m.get("court"),
                    json.dumps(m.get("team_a_ids", [])),
                    json.dumps(m.get("team_b_ids", [])),
                    m.get("team_a_label"),
                    m.get("team_b_label"),
                    m.get("score_a"),
                    m.get("score_b"),
                    m.get("status", "pending"),
                ),
            )

        conn.execute("DELETE FROM court_states")
        for cs in court_states_db:
            conn.execute(
                """
                INSERT INTO court_states (court, label, player_ids)
                VALUES (?, ?, ?)
                """,
                (cs["court"], cs.get("label"), json.dumps(cs.get("player_ids", []))),
            )

        conn.execute(
            """
            INSERT INTO meta (key, value) VALUES ('team_assignments', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (json.dumps(team_assignments_db),),
        )
        conn.execute(
            """
            INSERT INTO meta (key, value) VALUES ('fixed_teams', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (json.dumps(fixed_teams_db),),
        )
        conn.execute(
            """
            INSERT INTO meta (key, value) VALUES ('next_player_id', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (str(next_player_id),),
        )
        conn.execute(
            """
            INSERT INTO meta (key, value) VALUES ('next_match_id', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (str(next_match_id),),
        )
        conn.commit()


DEFAULT_AWARD_SETTINGS = {
    "rank_points": {
        "1": 10,
        "2": 7,
        "3": 5,
        "4": 3,
        "5": 2,
        "6": 1,
    }
}


def load_award_settings() -> Dict[str, Any]:
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT value FROM meta WHERE key = 'award_settings'"
        ).fetchone()
    if not row:
        return dict(DEFAULT_AWARD_SETTINGS)
    return _json_load(row["value"], DEFAULT_AWARD_SETTINGS)


def save_award_settings(settings: Dict[str, Any]) -> None:
    init_db()
    with _connect() as conn:
        conn.execute(
            """
            INSERT INTO meta (key, value) VALUES ('award_settings', ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value
            """,
            (json.dumps(settings),),
        )
        conn.commit()


def list_monthly_records(year: int | None = None) -> List[Dict[str, Any]]:
    init_db()
    with _connect() as conn:
        if year is not None:
            rows = conn.execute(
                """
                SELECT id, year, month, title, mode, note, held_at, created_at
                FROM monthly_records
                WHERE year = ?
                ORDER BY month DESC, id DESC
                """,
                (year,),
            ).fetchall()
        else:
            rows = conn.execute(
                """
                SELECT id, year, month, title, mode, note, held_at, created_at
                FROM monthly_records
                ORDER BY year DESC, month DESC, id DESC
                """
            ).fetchall()

        records = [dict(row) for row in rows]
        for record in records:
            result_rows = conn.execute(
                """
                SELECT player_id, player_name, rank, award_points,
                       score_diff, wins, losses
                FROM monthly_results
                WHERE monthly_record_id = ?
                ORDER BY rank ASC, player_name ASC
                """,
                (record["id"],),
            ).fetchall()
            record["results"] = [dict(r) for r in result_rows]
    return records


def get_monthly_record(record_id: int) -> Dict[str, Any] | None:
    records = list_monthly_records()
    return next((r for r in records if r["id"] == record_id), None)


def monthly_record_exists(year: int, month: int) -> bool:
    init_db()
    with _connect() as conn:
        row = conn.execute(
            "SELECT 1 FROM monthly_records WHERE year = ? AND month = ?",
            (year, month),
        ).fetchone()
    return row is not None


def delete_monthly_record(record_id: int) -> bool:
    init_db()
    with _connect() as conn:
        cur = conn.execute("DELETE FROM monthly_records WHERE id = ?", (record_id,))
        conn.commit()
        return cur.rowcount > 0


def create_monthly_record(
    year: int,
    month: int,
    title: str,
    mode: str,
    note: str | None,
    held_at: str,
    results: List[Dict[str, Any]],
    overwrite: bool = False,
) -> Dict[str, Any]:
    init_db()
    now = datetime.now(timezone.utc).isoformat()
    with _connect() as conn:
        existing = conn.execute(
            "SELECT id FROM monthly_records WHERE year = ? AND month = ?",
            (year, month),
        ).fetchone()
        if existing and not overwrite:
            raise ValueError(f"{year}년 {month}월 기록이 이미 있습니다.")
        if existing and overwrite:
            conn.execute(
                "DELETE FROM monthly_results WHERE monthly_record_id = ?",
                (existing["id"],),
            )
            conn.execute(
                "DELETE FROM monthly_records WHERE id = ?",
                (existing["id"],),
            )

        cur = conn.execute(
            """
            INSERT INTO monthly_records (year, month, title, mode, note, held_at, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (year, month, title, mode, note, held_at, now),
        )
        record_id = cur.lastrowid
        for result in results:
            conn.execute(
                """
                INSERT INTO monthly_results (
                    monthly_record_id, player_id, player_name, rank,
                    award_points, score_diff, wins, losses
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    record_id,
                    result.get("player_id"),
                    result["player_name"],
                    result["rank"],
                    result.get("award_points", 0),
                    result.get("score_diff", 0),
                    result.get("wins", 0),
                    result.get("losses", 0),
                ),
            )
        conn.commit()

    created = get_monthly_record(record_id)
    assert created is not None
    return created
