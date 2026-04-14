-- Performance indexes for common queries

-- monthly_snapshots: user lookups + date ordering
CREATE INDEX IF NOT EXISTS idx_monthly_snapshots_user_month ON monthly_snapshots(user_id, month DESC);

-- simulation_history: user lookups + date ordering
CREATE INDEX IF NOT EXISTS idx_simulation_history_user_date ON simulation_history(user_id, created_at DESC);

-- menu_costs: user lookups
CREATE INDEX IF NOT EXISTS idx_menu_costs_user ON menu_costs(user_id);

-- game_rankings: score leaderboard + season
CREATE INDEX IF NOT EXISTS idx_game_rankings_score ON game_rankings(score DESC);
CREATE INDEX IF NOT EXISTS idx_game_rankings_season ON game_rankings(season, score DESC);

-- posts: community feed ordering
CREATE INDEX IF NOT EXISTS idx_posts_created ON posts(created_at DESC);

-- simulation_shares: community feed
CREATE INDEX IF NOT EXISTS idx_shares_created ON simulation_shares(created_at DESC);

-- tool_saves: user + tool lookups
-- (already has unique index on user_id, tool_key)

-- HQ tables
CREATE INDEX IF NOT EXISTS idx_hq_mett_user ON hq_mett(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_hq_metrics_user ON hq_metrics(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_hq_goals_user ON hq_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_hq_tasks_user ON hq_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_hq_aar_user ON hq_aar(user_id, date DESC);
