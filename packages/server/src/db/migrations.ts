export const MIGRATIONS = [
  {
    name: '001_create_user_configs',
    sql: `
      CREATE TABLE IF NOT EXISTS user_configs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        config JSONB NOT NULL DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `,
  },
  {
    name: '002_create_stream_cache',
    sql: `
      CREATE TABLE IF NOT EXISTS stream_cache (
        cache_key TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_stream_cache_expires ON stream_cache (expires_at);
    `,
  },
  {
    name: '003_create_analytics',
    sql: `
      CREATE TABLE IF NOT EXISTS addon_requests (
        id BIGSERIAL PRIMARY KEY,
        user_id UUID NOT NULL,
        addon_id TEXT NOT NULL,
        addon_name TEXT NOT NULL,
        streams_returned INT NOT NULL DEFAULT 0,
        duration_ms INT NOT NULL DEFAULT 0,
        error TEXT,
        requested_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_addon_requests_user ON addon_requests (user_id, requested_at DESC);
    `,
  },
];
