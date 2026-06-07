import pg from 'pg';
import { MIGRATIONS } from './migrations.js';
import { config } from '../config.js';
import type { UserConfig } from '@aio/core';

const { Pool } = pg;

let pool: pg.Pool | null = null;

// ─── In-memory fallback (no DATABASE_URL) ────────────────────────────────────

const memUsers = new Map<string, { id: string; config: UserConfig; created_at: Date; updated_at: Date }>();
const memCache = new Map<string, { data: unknown; expires_at: number }>();

// ─── Init ─────────────────────────────────────────────────────────────────────

export async function initDb(): Promise<void> {
  if (!config.databaseUrl) {
    console.log('[db] No DATABASE_URL – using in-memory store');
    return;
  }

  pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.nodeEnv === 'production' ? { rejectUnauthorized: false } : false,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

  // Test connection
  const client = await pool.connect();
  try {
    await runMigrations(client);
    console.log('[db] PostgreSQL connected & migrations applied');
  } finally {
    client.release();
  }
}

async function runMigrations(client: pg.PoolClient): Promise<void> {
  await client.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ DEFAULT NOW()
    )
  `);

  for (const m of MIGRATIONS) {
    const { rows } = await client.query(
      'SELECT 1 FROM _migrations WHERE name = $1',
      [m.name],
    );
    if (rows.length === 0) {
      await client.query(m.sql);
      await client.query('INSERT INTO _migrations (name) VALUES ($1)', [m.name]);
      console.log(`[db] Applied migration: ${m.name}`);
    }
  }
}

// ─── User configs ─────────────────────────────────────────────────────────────

export async function getUserConfig(id: string) {
  if (!pool) return memUsers.get(id) ?? null;

  const { rows } = await pool.query(
    'SELECT id, config, created_at, updated_at FROM user_configs WHERE id = $1',
    [id],
  );
  return rows[0] ?? null;
}

export async function createUserConfig(cfg: UserConfig): Promise<{ id: string; config: UserConfig }> {
  if (!pool) {
    const id = crypto.randomUUID();
    const record = { id, config: cfg, created_at: new Date(), updated_at: new Date() };
    memUsers.set(id, record);
    return record;
  }

  const { rows } = await pool.query(
    'INSERT INTO user_configs (config) VALUES ($1) RETURNING id, config, created_at, updated_at',
    [JSON.stringify(cfg)],
  );
  return rows[0];
}

export async function updateUserConfig(id: string, cfg: UserConfig) {
  if (!pool) {
    const existing = memUsers.get(id);
    if (!existing) return null;
    const updated = { ...existing, config: cfg, updated_at: new Date() };
    memUsers.set(id, updated);
    return updated;
  }

  const { rows } = await pool.query(
    `UPDATE user_configs SET config = $2, updated_at = NOW()
     WHERE id = $1 RETURNING id, config, created_at, updated_at`,
    [id, JSON.stringify(cfg)],
  );
  return rows[0] ?? null;
}

export async function deleteUserConfig(id: string): Promise<void> {
  if (!pool) { memUsers.delete(id); return; }
  await pool.query('DELETE FROM user_configs WHERE id = $1', [id]);
}

// ─── Stream cache ─────────────────────────────────────────────────────────────

export async function getCachedStreams(key: string): Promise<unknown | null> {
  if (!pool) {
    const entry = memCache.get(key);
    if (!entry || Date.now() > entry.expires_at) { memCache.delete(key); return null; }
    return entry.data;
  }

  const { rows } = await pool.query(
    'SELECT data FROM stream_cache WHERE cache_key = $1 AND expires_at > NOW()',
    [key],
  );
  return rows[0]?.data ?? null;
}

export async function setCachedStreams(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  if (!pool) {
    memCache.set(key, { data, expires_at: Date.now() + ttlSeconds * 1000 });
    return;
  }

  await pool.query(
    `INSERT INTO stream_cache (cache_key, data, expires_at)
     VALUES ($1, $2, NOW() + ($3 || ' seconds')::INTERVAL)
     ON CONFLICT (cache_key) DO UPDATE SET data = EXCLUDED.data, expires_at = EXCLUDED.expires_at`,
    [key, JSON.stringify(data), ttlSeconds],
  );
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export interface AddonStat {
  addon_id: string;
  addon_name: string;
  requests: number;
  avg_streams: number;
  avg_duration_ms: number;
  error_rate: number;
}

export async function recordAddonRequest(opts: {
  userId: string;
  addonId: string;
  addonName: string;
  streamsReturned: number;
  durationMs: number;
  error?: string;
}): Promise<void> {
  if (!pool) return; // skip analytics in memory mode

  await pool.query(
    `INSERT INTO addon_requests
       (user_id, addon_id, addon_name, streams_returned, duration_ms, error)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [opts.userId, opts.addonId, opts.addonName, opts.streamsReturned, opts.durationMs, opts.error ?? null],
  );
}

export async function getAddonStats(userId: string): Promise<AddonStat[]> {
  if (!pool) return [];

  const { rows } = await pool.query<AddonStat>(
    `SELECT
       addon_id,
       addon_name,
       COUNT(*)::int AS requests,
       ROUND(AVG(streams_returned))::int AS avg_streams,
       ROUND(AVG(duration_ms))::int AS avg_duration_ms,
       ROUND(COUNT(*) FILTER (WHERE error IS NOT NULL) * 100.0 / NULLIF(COUNT(*),0), 1)::float AS error_rate
     FROM addon_requests
     WHERE user_id = $1 AND requested_at > NOW() - INTERVAL '7 days'
     GROUP BY addon_id, addon_name
     ORDER BY requests DESC`,
    [userId],
  );
  return rows;
}
