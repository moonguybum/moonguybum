-- 수정회 테니스 월례회 매니저 — SQLite 스키마

CREATE TABLE IF NOT EXISTS settings (
    id          INTEGER PRIMARY KEY CHECK (id = 1),
    mode        TEXT NOT NULL DEFAULT 'INDIVIDUAL',
    courts      INTEGER NOT NULL DEFAULT 2,
    updated_at  TEXT
);

INSERT OR IGNORE INTO settings (id, mode, courts) VALUES (1, 'INDIVIDUAL', 2);

CREATE TABLE IF NOT EXISTS players (
    id          INTEGER PRIMARY KEY,
    name        TEXT NOT NULL,
    skill_rank  INTEGER NOT NULL DEFAULT 0,
    team        TEXT,
    partner_id  INTEGER
);

CREATE TABLE IF NOT EXISTS matches (
    id            INTEGER PRIMARY KEY,
    mode          TEXT NOT NULL,
    round_num     INTEGER NOT NULL DEFAULT 1,
    court         INTEGER,
    team_a_ids    TEXT NOT NULL,
    team_b_ids    TEXT NOT NULL,
    team_a_label  TEXT,
    team_b_label  TEXT,
    score_a       INTEGER,
    score_b       INTEGER,
    status        TEXT DEFAULT 'pending'
);

CREATE TABLE IF NOT EXISTS court_states (
    court       INTEGER PRIMARY KEY,
    label       TEXT,
    player_ids  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS meta (
    key   TEXT PRIMARY KEY,
    value TEXT NOT NULL
);
