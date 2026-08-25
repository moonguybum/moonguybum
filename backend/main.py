"""
수정회 테니스 월례회 매니저 - FastAPI 백엔드
In-memory 저장소 + MatchEngine 4모드 지원
"""

from __future__ import annotations

import itertools
from copy import deepcopy
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# ---------------------------------------------------------------------------
# In-memory DB
# ---------------------------------------------------------------------------

players_db: List[Dict[str, Any]] = []
matches_db: List[Dict[str, Any]] = []
settings_db: Dict[str, Any] = {
    "mode": "INDIVIDUAL",
    "courts": 2,
}
court_states_db: List[Dict[str, Any]] = []  # UP_DOWN 모드용
team_assignments_db: Dict[str, List[int]] = {}  # THREE_KINGDOMS
fixed_teams_db: List[Dict[str, Any]] = []  # FIXED_TEAM

_next_player_id = 1
_next_match_id = 1


def _pid() -> int:
    global _next_player_id
    v = _next_player_id
    _next_player_id += 1
    return v


def _mid() -> int:
    global _next_match_id
    v = _next_match_id
    _next_match_id += 1
    return v


# ---------------------------------------------------------------------------
# Pydantic models
# ---------------------------------------------------------------------------

class PlayerCreate(BaseModel):
    name: str
    skill_rank: int = 0


class PlayerUpdate(BaseModel):
    name: Optional[str] = None
    skill_rank: Optional[int] = None


class SettingsUpdate(BaseModel):
    mode: Optional[str] = None
    courts: Optional[int] = None


class MatchResult(BaseModel):
    score_a: int = Field(..., ge=0)
    score_b: int = Field(..., ge=0)


class GenerateMatchesRequest(BaseModel):
    mode: Optional[str] = None
    courts: Optional[int] = None


# ---------------------------------------------------------------------------
# MatchEngine
# ---------------------------------------------------------------------------

class MatchEngine:
    """경기 모드별 대진 생성 및 순위 계산."""

    MODES = ("INDIVIDUAL", "THREE_KINGDOMS", "UP_DOWN", "FIXED_TEAM")

    @staticmethod
    def generate_matches(
        mode: str,
        players: List[Dict[str, Any]],
        courts: int,
    ) -> List[Dict[str, Any]]:
        if mode not in MatchEngine.MODES:
            raise ValueError(f"Unknown mode: {mode}")
        if len(players) < 4:
            raise ValueError("최소 4명의 참가자가 필요합니다.")

        if mode == "INDIVIDUAL":
            return MatchEngine._generate_individual(players, courts)
        if mode == "THREE_KINGDOMS":
            return MatchEngine._generate_three_kingdoms(players, courts)
        if mode == "UP_DOWN":
            return MatchEngine._generate_up_down(players, courts)
        return MatchEngine._generate_fixed_team(players, courts)

    @staticmethod
    def _sorted_by_skill(players: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return sorted(players, key=lambda p: (p.get("skill_rank") or 999, p["id"]))

    @staticmethod
    def _generate_individual(
        players: List[Dict[str, Any]], courts: int
    ) -> List[Dict[str, Any]]:
        """개인 교대 순환전: 1+4 vs 2+3 밸런싱, 파트너 로테이션."""
        sorted_p = MatchEngine._sorted_by_skill(players)
        n = len(sorted_p)
        matches: List[Dict[str, Any]] = []
        round_num = 1

        # 4명씩 그룹으로 나누어 밸런스 매치 생성, 나머지는 순환
        groups = []
        for i in range(0, n, 4):
            chunk = sorted_p[i:i + 4]
            if len(chunk) >= 4:
                groups.append(chunk)

        if not groups:
            groups = [sorted_p[:4]]

        rotation_idx = 0
        for g in groups:
            ids = [p["id"] for p in g]
            # 1+4 vs 2+3
            team_a = [ids[0], ids[3]]
            team_b = [ids[1], ids[2]]
            court = ((rotation_idx % courts) + 1) if courts > 0 else 1
            matches.append(
                {
                    "mode": "INDIVIDUAL",
                    "round_num": round_num,
                    "court": court,
                    "team_a_ids": team_a,
                    "team_b_ids": team_b,
                    "score_a": None,
                    "score_b": None,
                    "status": "pending",
                }
            )
            rotation_idx += 1
            round_num += 1

        # 추가 로테이션 라운드 (파트너 교체: 1+2 vs 3+4, 1+3 vs 2+4)
        if len(sorted_p) >= 4:
            base = sorted_p[:4]
            ids = [p["id"] for p in base]
            extra_pairs = [
                ([ids[0], ids[1]], [ids[2], ids[3]]),
                ([ids[0], ids[2]], [ids[1], ids[3]]),
                ([ids[0], ids[3]], [ids[1], ids[2]]),
            ]
            for ta, tb in extra_pairs:
                court = ((rotation_idx % courts) + 1) if courts > 0 else 1
                matches.append(
                    {
                        "mode": "INDIVIDUAL",
                        "round_num": round_num,
                        "court": court,
                        "team_a_ids": ta,
                        "team_b_ids": tb,
                        "score_a": None,
                        "score_b": None,
                        "status": "pending",
                    }
                )
                rotation_idx += 1
                round_num += 1

        return matches

    @staticmethod
    def _balance_teams_three(
        players: List[Dict[str, Any]],
    ) -> Dict[str, List[int]]:
        """실력 균등 3팀 분할 (스네이크 드래프트)."""
        sorted_p = MatchEngine._sorted_by_skill(players)
        teams: Dict[str, List[int]] = {"A": [], "B": [], "C": []}
        keys = ["A", "B", "C"]
        for i, p in enumerate(sorted_p):
            round_idx = i // 3
            pos = i % 3
            if round_idx % 2 == 1:
                tkey = keys[2 - pos]
            else:
                tkey = keys[pos]
            teams[tkey].append(p["id"])
        return teams

    @staticmethod
    def _generate_three_kingdoms(
        players: List[Dict[str, Any]], courts: int
    ) -> List[Dict[str, Any]]:
        """삼국지: A vs B, B vs C, C vs A 로테이션."""
        global team_assignments_db
        teams = MatchEngine._balance_teams_three(players)
        team_assignments_db = teams

        for p in players_db:
            for tname, ids in teams.items():
                if p["id"] in ids:
                    p["team"] = tname

        pairings = [("A", "B"), ("B", "C"), ("C", "A")]
        matches: List[Dict[str, Any]] = []
        for i, (ta, tb) in enumerate(pairings):
            court = ((i % courts) + 1) if courts > 0 else 1
            matches.append(
                {
                    "mode": "THREE_KINGDOMS",
                    "round_num": i + 1,
                    "court": court,
                    "team_a_ids": teams[ta],
                    "team_b_ids": teams[tb],
                    "team_a_label": ta,
                    "team_b_label": tb,
                    "score_a": None,
                    "score_b": None,
                    "status": "pending",
                }
            )
        return matches

    @staticmethod
    def _generate_up_down(
        players: List[Dict[str, Any]], courts: int
    ) -> List[Dict[str, Any]]:
        """승급/강등전: 코트별 현재 배치 초기화."""
        global court_states_db
        sorted_p = MatchEngine._sorted_by_skill(players)
        n = len(sorted_p)
        half = max(n // 2, 2)

        court1_players = sorted_p[:half]
        court2_players = sorted_p[half:]

        # 4명 미만이면 2코트에 균등 배치
        if len(court2_players) < 2 and n >= 4:
            court1_players = sorted_p[:2]
            court2_players = sorted_p[2:4]

        court_states_db = [
            {
                "court": 1,
                "label": "1코트 (상위)",
                "player_ids": [p["id"] for p in court1_players[:4]],
            },
            {
                "court": 2,
                "label": "2코트 (하위)",
                "player_ids": [p["id"] for p in court2_players[:4]],
            },
        ]

        # 현재 코트 1·2 각 2명씩 매치 1건
        matches: List[Dict[str, Any]] = []
        for cs in court_states_db:
            ids = cs["player_ids"]
            if len(ids) >= 4:
                matches.append(
                    {
                        "mode": "UP_DOWN",
                        "round_num": cs["court"],
                        "court": cs["court"],
                        "team_a_ids": ids[:2],
                        "team_b_ids": ids[2:4],
                        "score_a": None,
                        "score_b": None,
                        "status": "pending",
                    }
                )
            elif len(ids) >= 2:
                mid = len(ids) // 2
                matches.append(
                    {
                        "mode": "UP_DOWN",
                        "round_num": cs["court"],
                        "court": cs["court"],
                        "team_a_ids": ids[:mid] if mid else ids[:1],
                        "team_b_ids": ids[mid:] if mid else ids[1:2],
                        "score_a": None,
                        "score_b": None,
                        "status": "pending",
                    }
                )
        return matches

    @staticmethod
    def _generate_fixed_team(
        players: List[Dict[str, Any]], courts: int
    ) -> List[Dict[str, Any]]:
        """고정 파트너: 상위1+하위1, 상위2+하위2 ..."""
        global fixed_teams_db
        sorted_p = MatchEngine._sorted_by_skill(players)
        n = len(sorted_p)
        pairs: List[Dict[str, Any]] = []
        half = n // 2
        for i in range(half):
            top = sorted_p[i]
            bottom = sorted_p[n - 1 - i]
            if top["id"] == bottom["id"]:
                continue
            pairs.append(
                {
                    "team_id": len(pairs) + 1,
                    "name": f"{top['name']}&{bottom['name']}",
                    "player_ids": [top["id"], bottom["id"]],
                }
            )
            for p in players_db:
                if p["id"] in (top["id"], bottom["id"]):
                    p["partner_id"] = bottom["id"] if p["id"] == top["id"] else top["id"]

        fixed_teams_db = pairs
        team_ids_list = [t["player_ids"] for t in pairs]

        matches: List[Dict[str, Any]] = []
        round_num = 1
        idx = 0
        for i in range(len(team_ids_list)):
            for j in range(i + 1, len(team_ids_list)):
                court = ((idx % courts) + 1) if courts > 0 else 1
                matches.append(
                    {
                        "mode": "FIXED_TEAM",
                        "round_num": round_num,
                        "court": court,
                        "team_a_ids": team_ids_list[i],
                        "team_b_ids": team_ids_list[j],
                        "team_a_label": pairs[i]["name"],
                        "team_b_label": pairs[j]["name"],
                        "score_a": None,
                        "score_b": None,
                        "status": "pending",
                    }
                )
                idx += 1
                round_num += 1
        return matches

    @staticmethod
    def apply_up_down_result(match: Dict[str, Any]) -> None:
        """UP_DOWN 경기 결과 후 승급/강등 처리."""
        global court_states_db
        if match.get("score_a") is None or match.get("score_b") is None:
            return

        court = match["court"]
        sa, sb = match["score_a"], match["score_b"]
        winners = match["team_a_ids"] if sa > sb else match["team_b_ids"]
        losers = match["team_b_ids"] if sa > sb else match["team_a_ids"]

        if sa == sb:
            return

        c1 = next((c for c in court_states_db if c["court"] == 1), None)
        c2 = next((c for c in court_states_db if c["court"] == 2), None)
        if not c1 or not c2:
            return

        if court == 1:
            # 1코트 패자 → 2코트, 2코트 승자 → 1코트
            for lid in losers:
                if lid in c1["player_ids"]:
                    c1["player_ids"].remove(lid)
                    if lid not in c2["player_ids"]:
                        c2["player_ids"].append(lid)
            # 2코트에서 승자 1명 승급 (첫 승자)
            promote = winners[0] if winners else None
            if promote and promote in c2["player_ids"]:
                c2["player_ids"].remove(promote)
                if promote not in c1["player_ids"]:
                    c1["player_ids"].append(promote)
        elif court == 2:
            # 2코트 승자 → 1코트, 1코트 패자 → 2코트
            promote = winners[0] if winners else None
            if promote and promote in c2["player_ids"]:
                c2["player_ids"].remove(promote)
                if promote not in c1["player_ids"]:
                    c1["player_ids"].append(promote)
            demote = losers[0] if losers else None
            if demote and demote in c1["player_ids"]:
                c1["player_ids"].remove(demote)
                if demote not in c2["player_ids"]:
                    c2["player_ids"].append(demote)

    @staticmethod
    def compute_rankings(mode: str) -> List[Dict[str, Any]]:
        completed = [m for m in matches_db if m["status"] == "completed"]

        if mode == "INDIVIDUAL":
            return MatchEngine._rankings_individual(completed)
        if mode == "THREE_KINGDOMS":
            return MatchEngine._rankings_three_kingdoms(completed)
        if mode == "UP_DOWN":
            return MatchEngine._rankings_up_down()
        if mode == "FIXED_TEAM":
            return MatchEngine._rankings_fixed_team(completed)
        return []

    @staticmethod
    def _player_name(pid: int) -> str:
        p = next((x for x in players_db if x["id"] == pid), None)
        return p["name"] if p else f"#{pid}"

    @staticmethod
    def _rankings_individual(completed: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """개인 순위: 5경기 이상 시 상위 4경기 득실 반영."""
        per_player: Dict[int, List[int]] = {p["id"]: [] for p in players_db}

        for m in completed:
            if m.get("mode") != "INDIVIDUAL":
                continue
            sa, sb = m["score_a"], m["score_b"]
            diff_a = sa - sb
            for pid in m["team_a_ids"]:
                if pid in per_player:
                    per_player[pid].append(diff_a)
            for pid in m["team_b_ids"]:
                if pid in per_player:
                    per_player[pid].append(-diff_a)

        results = []
        for pid, diffs in per_player.items():
            if not diffs:
                total_diff = 0
                used = []
            elif len(diffs) >= 5:
                sorted_diffs = sorted(diffs, reverse=True)
                used = sorted_diffs[:4]
                total_diff = sum(used)
            else:
                used = diffs
                total_diff = sum(diffs)

            wins = sum(1 for d in used if d > 0)
            losses = sum(1 for d in used if d < 0)
            results.append(
                {
                    "player_id": pid,
                    "name": MatchEngine._player_name(pid),
                    "wins": wins,
                    "losses": losses,
                    "score_diff": total_diff,
                    "match_diffs": diffs,
                    "matches_count": len(diffs),
                }
            )

        results.sort(key=lambda x: (-x["score_diff"], -x["wins"]))
        for i, r in enumerate(results):
            r["rank"] = i + 1
        return results[:6]

    @staticmethod
    def _rankings_three_kingdoms(
        completed: List[Dict[str, Any]],
    ) -> List[Dict[str, Any]]:
        teams: Dict[str, Dict[str, int]] = {
            "A": {"wins": 0, "losses": 0, "points_for": 0, "points_against": 0},
            "B": {"wins": 0, "losses": 0, "points_for": 0, "points_against": 0},
            "C": {"wins": 0, "losses": 0, "points_for": 0, "points_against": 0},
        }
        for m in completed:
            if m.get("mode") != "THREE_KINGDOMS":
                continue
            ta = m.get("team_a_label", "A")
            tb = m.get("team_b_label", "B")
            sa, sb = m["score_a"], m["score_b"]
            if ta in teams:
                teams[ta]["points_for"] += sa
                teams[ta]["points_against"] += sb
            if tb in teams:
                teams[tb]["points_for"] += sb
                teams[tb]["points_against"] += sa
            if sa > sb:
                if ta in teams:
                    teams[ta]["wins"] += 1
                if tb in teams:
                    teams[tb]["losses"] += 1
            elif sb > sa:
                if tb in teams:
                    teams[tb]["wins"] += 1
                if ta in teams:
                    teams[ta]["losses"] += 1

        results = []
        for name, stats in teams.items():
            member_ids = team_assignments_db.get(name, [])
            members = [MatchEngine._player_name(pid) for pid in member_ids]
            results.append(
                {
                    "team": name,
                    "members": members,
                    "wins": stats["wins"],
                    "losses": stats["losses"],
                    "points_for": stats["points_for"],
                    "points_against": stats["points_against"],
                    "score_diff": stats["points_for"] - stats["points_against"],
                }
            )
        results.sort(key=lambda x: (-x["wins"], -x["score_diff"]))
        for i, r in enumerate(results):
            r["rank"] = i + 1
        return results

    @staticmethod
    def _rankings_up_down() -> List[Dict[str, Any]]:
        results = []
        for cs in court_states_db:
            names = [MatchEngine._player_name(pid) for pid in cs["player_ids"]]
            results.append(
                {
                    "court": cs["court"],
                    "label": cs.get("label", f"{cs['court']}코트"),
                    "players": names,
                    "player_ids": cs["player_ids"],
                }
            )
        return results

    @staticmethod
    def _rankings_fixed_team(completed: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        team_stats: Dict[str, Dict[str, Any]] = {}
        for ft in fixed_teams_db:
            team_stats[ft["name"]] = {
                "team_id": ft["team_id"],
                "name": ft["name"],
                "player_ids": ft["player_ids"],
                "wins": 0,
                "losses": 0,
                "points_for": 0,
                "points_against": 0,
            }

        for m in completed:
            if m.get("mode") != "FIXED_TEAM":
                continue
            ta_name = m.get("team_a_label", "")
            tb_name = m.get("team_b_label", "")
            sa, sb = m["score_a"], m["score_b"]
            if ta_name in team_stats:
                team_stats[ta_name]["points_for"] += sa
                team_stats[ta_name]["points_against"] += sb
            if tb_name in team_stats:
                team_stats[tb_name]["points_for"] += sb
                team_stats[tb_name]["points_against"] += sa
            if sa > sb:
                if ta_name in team_stats:
                    team_stats[ta_name]["wins"] += 1
                if tb_name in team_stats:
                    team_stats[tb_name]["losses"] += 1
            elif sb > sa:
                if tb_name in team_stats:
                    team_stats[tb_name]["wins"] += 1
                if ta_name in team_stats:
                    team_stats[ta_name]["losses"] += 1

        results = list(team_stats.values())
        for r in results:
            r["score_diff"] = r["points_for"] - r["points_against"]
        results.sort(key=lambda x: (-x["wins"], -x["score_diff"]))
        for i, r in enumerate(results):
            r["rank"] = i + 1
        return results


# ---------------------------------------------------------------------------
# FastAPI app
# ---------------------------------------------------------------------------

app = FastAPI(title="수정회 테니스 월례회 매니저 API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "timestamp": datetime.utcnow().isoformat()}


@app.get("/api/settings")
def get_settings():
    return settings_db


@app.put("/api/settings")
def update_settings(body: SettingsUpdate):
    if body.mode and body.mode not in MatchEngine.MODES:
        raise HTTPException(400, f"Invalid mode. Use one of {MatchEngine.MODES}")
    if body.mode:
        settings_db["mode"] = body.mode
    if body.courts is not None:
        settings_db["courts"] = max(1, min(body.courts, 6))
    return settings_db


@app.get("/api/players")
def list_players():
    return players_db


@app.post("/api/players")
def create_player(body: PlayerCreate):
    player = {
        "id": _pid(),
        "name": body.name.strip(),
        "skill_rank": body.skill_rank,
        "team": None,
        "partner_id": None,
    }
    players_db.append(player)
    return player


@app.put("/api/players/{player_id}")
def update_player(player_id: int, body: PlayerUpdate):
    p = next((x for x in players_db if x["id"] == player_id), None)
    if not p:
        raise HTTPException(404, "Player not found")
    if body.name is not None:
        p["name"] = body.name.strip()
    if body.skill_rank is not None:
        p["skill_rank"] = body.skill_rank
    return p


@app.delete("/api/players/{player_id}")
def delete_player(player_id: int):
    global players_db
    players_db = [p for p in players_db if p["id"] != player_id]
    return {"ok": True}


@app.post("/api/players/seed")
def seed_players():
    """데모용 8명 시드."""
    global players_db, _next_player_id
    if players_db:
        return {"message": "already seeded", "count": len(players_db)}
    demo = [
        ("김수정", 1),
        ("이테니", 2),
        ("박라켓", 3),
        ("최서브", 4),
        ("정스매", 5),
        ("한볼트", 6),
        ("오코트", 7),
        ("윤그립", 8),
    ]
    players_db = []
    _next_player_id = 1
    for name, rank in demo:
        players_db.append(
            {
                "id": _pid(),
                "name": name,
                "skill_rank": rank,
                "team": None,
                "partner_id": None,
            }
        )
    return {"message": "seeded", "count": len(players_db)}


@app.get("/api/matches")
def list_matches():
    enriched = []
    for m in matches_db:
        em = deepcopy(m)
        em["team_a_names"] = [MatchEngine._player_name(pid) for pid in m["team_a_ids"]]
        em["team_b_names"] = [MatchEngine._player_name(pid) for pid in m["team_b_ids"]]
        enriched.append(em)
    return enriched


@app.post("/api/matches/generate")
def generate_matches(body: GenerateMatchesRequest = GenerateMatchesRequest()):
    mode = body.mode or settings_db["mode"]
    courts = body.courts or settings_db["courts"]
    if len(players_db) < 4:
        raise HTTPException(400, "최소 4명의 참가자가 필요합니다.")

    global matches_db, _next_match_id
    matches_db = []
    _next_match_id = 1

    try:
        raw = MatchEngine.generate_matches(mode, players_db, courts)
    except ValueError as e:
        raise HTTPException(400, str(e))

    for r in raw:
        r["id"] = _mid()
        matches_db.append(r)

    settings_db["mode"] = mode
    settings_db["courts"] = courts

    return {"generated": len(matches_db), "matches": list_matches()}


@app.post("/api/matches/{match_id}/result")
def submit_result(match_id: int, body: MatchResult):
    m = next((x for x in matches_db if x["id"] == match_id), None)
    if not m:
        raise HTTPException(404, "Match not found")
    m["score_a"] = body.score_a
    m["score_b"] = body.score_b
    m["status"] = "completed"

    if m.get("mode") == "UP_DOWN":
        MatchEngine.apply_up_down_result(m)
        # 다음 라운드 매치 자동 생성
        _append_up_down_next_matches(m)

    return m


def _append_up_down_next_matches(completed_match: Dict[str, Any]) -> None:
    """UP_DOWN: 결과 입력 후 해당 코트 다음 경기 추가."""
    court = completed_match["court"]
    cs = next((c for c in court_states_db if c["court"] == court), None)
    if not cs or len(cs["player_ids"]) < 2:
        return

    ids = cs["player_ids"]
    # 기존 pending 같은 코트 매치 제거
    global matches_db
    matches_db = [
        x for x in matches_db
        if x.get("mode") != "UP_DOWN" or x["court"] != court or x["status"] == "completed"
    ]

    if len(ids) >= 4:
        new_m = {
            "id": _mid(),
            "mode": "UP_DOWN",
            "round_num": court,
            "court": court,
            "team_a_ids": ids[:2],
            "team_b_ids": ids[2:4],
            "score_a": None,
            "score_b": None,
            "status": "pending",
        }
    elif len(ids) >= 2:
        mid = len(ids) // 2
        new_m = {
            "id": _mid(),
            "mode": "UP_DOWN",
            "round_num": court,
            "court": court,
            "team_a_ids": ids[:mid] if mid else ids[:1],
            "team_b_ids": ids[mid:] if mid else ids[1:2],
            "score_a": None,
            "score_b": None,
            "status": "pending",
        }
    else:
        return

    matches_db.append(new_m)


@app.get("/api/rankings")
def get_rankings():
    mode = settings_db["mode"]
    rankings = MatchEngine.compute_rankings(mode)

    enriched_court_states = None
    if mode == "UP_DOWN":
        enriched_court_states = []
        for cs in court_states_db:
            enriched_court_states.append(
                {
                    **cs,
                    "players": [
                        MatchEngine._player_name(pid) for pid in cs["player_ids"]
                    ],
                }
            )

    return {
        "mode": mode,
        "rankings": rankings,
        "court_states": enriched_court_states,
        "teams": team_assignments_db if mode == "THREE_KINGDOMS" else None,
        "fixed_teams": fixed_teams_db if mode == "FIXED_TEAM" else None,
    }


@app.get("/api/court-states")
def get_court_states():
    return court_states_db


@app.post("/api/reset")
def reset_all():
    global players_db, matches_db, court_states_db, team_assignments_db, fixed_teams_db
    global _next_player_id, _next_match_id
    players_db = []
    matches_db = []
    court_states_db = []
    team_assignments_db = {}
    fixed_teams_db = []
    _next_player_id = 1
    _next_match_id = 1
    settings_db["mode"] = "INDIVIDUAL"
    settings_db["courts"] = 2
    return {"ok": True}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
