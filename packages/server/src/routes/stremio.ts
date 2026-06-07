import { Router } from 'express';
import type { Request, Response } from 'express';
import { getUserConfig } from '../db/index.js';
import { processStreams } from '../services/processor.js';
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
    resources: ['stream'],
    types: ['movie', 'series'],
    catalogs: [],
    idPrefixes: ['tt'],
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
      const streams = await processStreams(userId, type, id, row.config);
      res.setHeader('Cache-Control', 'public, max-age=300');
      res.json({ streams });
    } catch (err) {
      console.error('[stremio] Error processing streams:', err);
      res.json({ streams: [] });
    }
  },
);

// ─── Configure redirect ────────────────────────────────────────────────────────

stremioRouter.get('/:userId/configure', (req: Request, res: Response) => {
  const userId = String(req.params['userId']);
  res.redirect(302, `/configure?userId=${userId}`);
});
