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

CREATE TABLE IF NOT EXISTS monthly_records (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    year        INTEGER NOT NULL,
    month       INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    title       TEXT NOT NULL,
    mode        TEXT NOT NULL,
    note        TEXT,
    held_at     TEXT NOT NULL,
    created_at  TEXT NOT NULL,
    UNIQUE(year, month)
);

CREATE TABLE IF NOT EXISTS monthly_results (
    id                INTEGER PRIMARY KEY AUTOINCREMENT,
    monthly_record_id INTEGER NOT NULL,
    player_id         INTEGER,
    player_name       TEXT NOT NULL,
    rank              INTEGER NOT NULL,
    award_points      INTEGER NOT NULL DEFAULT 0,
    score_diff        INTEGER DEFAULT 0,
    wins              INTEGER DEFAULT 0,
    losses            INTEGER DEFAULT 0,
    FOREIGN KEY (monthly_record_id) REFERENCES monthly_records(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_monthly_records_year ON monthly_records(year);
CREATE INDEX IF NOT EXISTS idx_monthly_results_record ON monthly_results(monthly_record_id);
