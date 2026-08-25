"""연말 시상 — 월례회 성적 누적 및 1·2·3위 선별."""

from __future__ import annotations

from typing import Any, Dict, List

DEFAULT_RANK_POINTS: Dict[int, int] = {
    1: 10,
    2: 7,
    3: 5,
    4: 3,
    5: 2,
    6: 1,
}


def normalize_rank_points(raw: Dict[str, Any] | Dict[int, int] | None) -> Dict[int, int]:
    if not raw:
        return dict(DEFAULT_RANK_POINTS)
    result: Dict[int, int] = {}
    for key, value in raw.items():
        rank = int(key)
        result[rank] = int(value)
    return result or dict(DEFAULT_RANK_POINTS)


def points_for_rank(rank: int, rank_points: Dict[int, int]) -> int:
    if rank in rank_points:
        return rank_points[rank]
    return rank_points.get(6, 0)


def extract_award_entries(
    mode: str,
    rankings: List[Dict[str, Any]],
    *,
    team_assignments: Dict[str, List[int]] | None = None,
    fixed_teams: List[Dict[str, Any]] | None = None,
    court_states: List[Dict[str, Any]] | None = None,
    player_names: Dict[int, str] | None = None,
) -> List[Dict[str, Any]]:
    """모드별 순위표를 연말 시상용 개인 항목으로 변환."""
    names = player_names or {}
    entries: List[Dict[str, Any]] = []

    if mode == "INDIVIDUAL":
        for row in rankings:
            entries.append(
                {
                    "player_id": row.get("player_id"),
                    "player_name": row.get("name") or names.get(row.get("player_id"), ""),
                    "rank": row.get("rank", 0),
                    "score_diff": row.get("score_diff", 0),
                    "wins": row.get("wins", 0),
                    "losses": row.get("losses", 0),
                }
            )
        return entries

    if mode == "THREE_KINGDOMS":
        for row in rankings:
            team = row.get("team")
            member_ids = (team_assignments or {}).get(team, [])
            for pid in member_ids:
                entries.append(
                    {
                        "player_id": pid,
                        "player_name": names.get(pid, f"#{pid}"),
                        "rank": row.get("rank", 0),
                        "score_diff": row.get("score_diff", 0),
                        "wins": row.get("wins", 0),
                        "losses": row.get("losses", 0),
                        "team": team,
                    }
                )
        return entries

    if mode == "FIXED_TEAM":
        for row in rankings:
            for pid in row.get("player_ids", []):
                entries.append(
                    {
                        "player_id": pid,
                        "player_name": names.get(pid, f"#{pid}"),
                        "rank": row.get("rank", 0),
                        "score_diff": row.get("score_diff", 0),
                        "wins": row.get("wins", 0),
                        "losses": row.get("losses", 0),
                        "team_name": row.get("name"),
                    }
                )
        return entries

    if mode == "UP_DOWN":
        rank = 1
        for cs in sorted(court_states or [], key=lambda x: x.get("court", 99)):
            for pid in cs.get("player_ids", []):
                entries.append(
                    {
                        "player_id": pid,
                        "player_name": names.get(pid, f"#{pid}"),
                        "rank": rank,
                        "score_diff": 0,
                        "wins": 0,
                        "losses": 0,
                        "court": cs.get("court"),
                        "court_label": cs.get("label"),
                    }
                )
                rank += 1
        return entries

    return entries


def aggregate_yearly_standings(
    monthly_records: List[Dict[str, Any]],
    rank_points: Dict[int, int] | None = None,
) -> List[Dict[str, Any]]:
    """월별 기록을 합산해 연간 순위표 생성."""
    points_map = normalize_rank_points(rank_points)
    totals: Dict[str, Dict[str, Any]] = {}

    for record in monthly_records:
        month_label = f"{record['year']}-{record['month']:02d}"
        for result in record.get("results", []):
            name = result["player_name"]
            bucket = totals.setdefault(
                name,
                {
                    "player_name": name,
                    "player_id": result.get("player_id"),
                    "total_points": 0,
                    "first_places": 0,
                    "second_places": 0,
                    "third_places": 0,
                    "months_played": 0,
                    "monthly_details": [],
                },
            )
            if result.get("player_id") and not bucket.get("player_id"):
                bucket["player_id"] = result["player_id"]

            pts = result.get("award_points", 0)
            bucket["total_points"] += pts
            bucket["months_played"] += 1
            rank = result.get("rank", 0)
            if rank == 1:
                bucket["first_places"] += 1
            elif rank == 2:
                bucket["second_places"] += 1
            elif rank == 3:
                bucket["third_places"] += 1

            bucket["monthly_details"].append(
                {
                    "month": month_label,
                    "title": record.get("title"),
                    "rank": rank,
                    "award_points": pts,
                    "score_diff": result.get("score_diff", 0),
                }
            )

    standings = list(totals.values())
    standings.sort(
        key=lambda x: (
            -x["total_points"],
            -x["first_places"],
            -x["second_places"],
            -x["third_places"],
            x["player_name"],
        )
    )
    for i, row in enumerate(standings):
        row["year_rank"] = i + 1
    return standings


def select_ceremony_awards(
    standings: List[Dict[str, Any]], limit: int = 3
) -> List[Dict[str, Any]]:
    """연말총회 시상 대상 1·2·3위 선별."""
    awards = []
    for row in standings[:limit]:
        awards.append(
            {
                "ceremony_rank": row["year_rank"],
                "player_name": row["player_name"],
                "player_id": row.get("player_id"),
                "total_points": row["total_points"],
                "months_played": row["months_played"],
                "first_places": row["first_places"],
                "second_places": row["second_places"],
                "third_places": row["third_places"],
                "monthly_details": row["monthly_details"],
            }
        )
    return awards
