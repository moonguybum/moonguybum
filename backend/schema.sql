-- 수정회 테니스 월례회 매니저 DB 스키마 (참조용)
-- 런타임은 in-memory List로 구현; 추후 PostgreSQL 등으로 마이그레이션 시 이 스키마 사용

CREATE TYPE game_mode AS ENUM (
    'INDIVIDUAL',
    'THREE_KINGDOMS',
    'UP_DOWN',
    'FIXED_TEAM'
);

CREATE TABLE settings (
    id          INTEGER PRIMARY KEY DEFAULT 1,
    mode        game_mode NOT NULL DEFAULT 'INDIVIDUAL',
    courts      INTEGER NOT NULL DEFAULT 2,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE players (
    id          SERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL,
    skill_rank  INTEGER NOT NULL DEFAULT 0,  -- 1=최상위, 숫자 클수록 하위
    team        VARCHAR(10),                 -- THREE_KINGDOMS: A/B/C
  partner_id  INTEGER REFERENCES players(id), -- FIXED_TEAM 파트너
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE matches (
    id          SERIAL PRIMARY KEY,
    mode        game_mode NOT NULL,
    round_num   INTEGER NOT NULL DEFAULT 1,
    court       INTEGER,
    team_a_ids  INTEGER[] NOT NULL,
    team_b_ids  INTEGER[] NOT NULL,
    score_a     INTEGER,
    score_b     INTEGER,
    status      VARCHAR(20) DEFAULT 'pending',  -- pending | completed
    created_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE court_states (
    id          SERIAL PRIMARY KEY,
    court       INTEGER NOT NULL,
    player_ids  INTEGER[] NOT NULL,
    updated_at  TIMESTAMP DEFAULT NOW()
);

CREATE TABLE team_scores (
    id          SERIAL PRIMARY KEY,
    team_name   VARCHAR(10) NOT NULL,
    wins        INTEGER DEFAULT 0,
    losses      INTEGER DEFAULT 0,
    points_for  INTEGER DEFAULT 0,
    points_against INTEGER DEFAULT 0
);

CREATE TABLE player_match_results (
    id          SERIAL PRIMARY KEY,
    player_id   INTEGER REFERENCES players(id),
    match_id    INTEGER REFERENCES matches(id),
    score_diff  INTEGER NOT NULL,  -- 개인 득실차 (INDIVIDUAL 상위 4경기 집계용)
    created_at  TIMESTAMP DEFAULT NOW()
);
