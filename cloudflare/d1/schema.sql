CREATE TABLE IF NOT EXISTS posts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  publish_date TEXT NOT NULL,
  header_image TEXT,
  images TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_kana TEXT NOT NULL DEFAULT '',
  last_name_kana TEXT NOT NULL DEFAULT '',
  grade INTEGER NOT NULL,
  position TEXT NOT NULL,
  school TEXT NOT NULL,
  admission_type TEXT NOT NULL DEFAULT '',
  image TEXT,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS staff (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  first_name_kana TEXT NOT NULL DEFAULT '',
  last_name_kana TEXT NOT NULL DEFAULT '',
  position TEXT NOT NULL,
  school TEXT NOT NULL,
  image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  image TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tournaments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  location TEXT NOT NULL,
  is_active INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY,
  tournament_id TEXT NOT NULL,
  team1_id TEXT,
  team2_id TEXT,
  team1_name TEXT NOT NULL,
  team2_name TEXT NOT NULL,
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL,
  court_number TEXT,
  start_time TEXT,
  end_time TEXT,
  round TEXT,
  notes TEXT,
  year INTEGER NOT NULL,
  result TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS match_games (
  id TEXT PRIMARY KEY,
  match_id TEXT NOT NULL,
  game_type TEXT NOT NULL,
  game_number INTEGER NOT NULL,
  team1_player1 TEXT NOT NULL,
  team1_player2 TEXT,
  team2_player1 TEXT NOT NULL,
  team2_player2 TEXT,
  team1_score INTEGER NOT NULL DEFAULT 0,
  team2_score INTEGER NOT NULL DEFAULT 0,
  result TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS annual_schedules (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  tournament_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS opponent_players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  team_name TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(name, team_name)
);

CREATE TABLE IF NOT EXISTS maintenance_settings (
  id TEXT PRIMARY KEY,
  is_maintenance_mode INTEGER NOT NULL DEFAULT 0,
  maintenance_message TEXT NOT NULL,
  updated_at TEXT,
  updated_by TEXT
);

CREATE TABLE IF NOT EXISTS media_assets (
  id TEXT PRIMARY KEY,
  object_key TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  size INTEGER NOT NULL DEFAULT 0,
  content_type TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_publish_date ON posts (publish_date DESC);
CREATE INDEX IF NOT EXISTS idx_players_usage_grade_name ON players (usage_count DESC, grade DESC, last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_staff_position_name ON staff (position, last_name, first_name);
CREATE INDEX IF NOT EXISTS idx_teams_name ON teams (name);
CREATE INDEX IF NOT EXISTS idx_tournaments_start_date ON tournaments (start_date DESC);
CREATE INDEX IF NOT EXISTS idx_matches_start_time ON matches (start_time DESC);
CREATE INDEX IF NOT EXISTS idx_match_games_match_id ON match_games (match_id, game_number);
CREATE INDEX IF NOT EXISTS idx_annual_schedules_date ON annual_schedules (date ASC);
CREATE INDEX IF NOT EXISTS idx_opponent_players_usage ON opponent_players (team_name, usage_count DESC, name);

INSERT OR IGNORE INTO maintenance_settings (id, is_maintenance_mode, maintenance_message)
VALUES ('default', 0, 'メンテナンス中です。しばらくお待ちください。');
