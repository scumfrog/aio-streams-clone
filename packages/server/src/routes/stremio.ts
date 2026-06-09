import { Router } from 'express';
import type { Request, Response } from 'express';
import { getUserConfig } from '../db/index.js';
import { processStreams } from '../services/processor.js';
import { formatStream } from '../services/formatter.js';
import { fetchAnimeCatalog, ANIME_CATALOGS } from '../services/catalog.js';
import { streamRateLimit } from '../middleware/ratelimit.js';
import type { StremioManifest } from '@aio/core';

export const stremioRouter = Router();

// ─── Manifest ─────────────────────────────────────────────────────────────────

stremioRouter.get('/:userId/manifest.json', async (req: Request, res: Response) => {
  const userId = String(req.params['userId']);

  const row = await getUserConfig(userId).catch(() => null);
  if (!row) {
    res.status(404).json({ error: 'Config not found' });
    return;
  }

  const cfg = row.config;
  const enabledCount = (cfg.addons ?? []).filter((a: { enabled: boolean }) => a.enabled).length;

  const manifest: StremioManifest = {
    id: `com.aiostreams.user.${userId}`,
    version: '1.0.0',
    name: cfg.name ? `AIO: ${cfg.name}` : 'AIOStreams Clone',
    description: `Aggregating ${enabledCount} addon(s). Powered by AIOStreams Clone.`,
    resources: ['stream', 'catalog'],
    types: ['movie', 'series', 'anime'],
    catalogs: ANIME_CATALOGS.map(c => ({
      type: 'anime' as const,
      id: c.id,
      name: c.name,
      extra: [{ name: 'skip', isRequired: false }],
    })),
    idPrefixes: ['tt', 'kitsu:'],
    behaviorHints: {
      configurable: true,
      configurationRequired: false,
    },
  };

  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(manifest);
});

// ─── Streams ───────────────────────────────────────────────────────────────────

stremioRouter.get(
  '/:userId/stream/:type/:id.json',
  streamRateLimit,
  async (req: Request, res: Response) => {
    const userId = String(req.params['userId']);
    const type   = String(req.params['type']);
    const id     = String(req.params['id']);

    const row = await getUserConfig(userId).catch(() => null);
    if (!row) {
      res.json({ streams: [] });
      return;
    }

    try {
      const streams = (await processStreams(userId, type, id, row.config)).map(formatStream);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json({ streams });
    } catch (err) {
      console.error('[stremio] Error processing streams:', err);
      res.json({ streams: [] });
    }
  },
);

// ─── Catalog ──────────────────────────────────────────────────────────────────
// Matches both /catalog/:type/:id.json and /catalog/:type/:id/skip=N.json

stremioRouter.get('/:userId/catalog/:type/*', async (req: Request, res: Response) => {
  const type = String(req.params['type']);

  // Only handle anime catalogs; return empty for anything else
  if (type !== 'anime') {
    res.json({ metas: [] });
    return;
  }

  // req.params['0'] = "aio-anime-airing.json" OR "aio-anime-airing/skip=30.json"
  const rawPath = String((req.params as Record<string, string>)['0'] ?? '');
  const segments = rawPath.split('/');
  const catalogId = segments[0].replace(/\.json$/, '');

  // Parse extras (e.g. "skip=30.json" → { skip: "30" })
  const extraStr = segments.slice(1).join('/').replace(/\.json$/, '');
  const extras: Record<string, string> = {};
  if (extraStr) {
    extraStr.split('&').forEach(pair => {
      const [k, v] = pair.split('=');
      if (k && v !== undefined) extras[k] = v;
    });
  }
  const skip = parseInt(extras['skip'] ?? '0', 10) || 0;

  try {
    const metas = await fetchAnimeCatalog(catalogId, skip);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.json({ metas });
  } catch {
    res.json({ metas: [] });
  }
});

// ─── Configure redirect ────────────────────────────────────────────────────────

stremioRouter.get('/:userId/configure', (req: Request, res: Response) => {
  const userId = String(req.params['userId']);
  res.redirect(302, `/configure?userId=${userId}`);
});
