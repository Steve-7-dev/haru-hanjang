-- Confirm-lock for today's shot: survives post deletion so re-upload stays blocked.
ALTER TABLE posts ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS daily_shot_locks (
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  day_key TEXT NOT NULL,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, day_key)
);

CREATE INDEX IF NOT EXISTS daily_shot_locks_day_key_idx ON daily_shot_locks(day_key);
