import { Router } from 'express';
import type { Request, Response } from 'express';
import { z } from 'zod';
import {
  getUserConfig,
  createUserConfig,
  updateUserConfig,
  deleteUserConfig,
  getAddonStats,
} from '../db/index.js';
import { fetchAddonManifest } from '../services/addon.js';
import { MARKETPLACE_ADDONS } from '@aio/core';
import { apiRateLimit } from '../middleware/ratelimit.js';

export const apiRouter = Router();
apiRouter.use(apiRateLimit);

// ─── Health ────────────────────────────────────────────────────────────────────

apiRouter.get('/health', (_req, res) => {
  res.json({ status: 'ok', version: '1.0.0', timestamp: new Date().toISOString() });
});

// ─── Config CRUD ──────────────────────────────────────────────────────────────

apiRouter.get('/config/:id', async (req: Request, res: Response) => {
  const id = String(req.params['id']);
  const row = await getUserConfig(id).catch(() => null);
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

const configBodySchema = z.object({
  name: z.string().max(80).optional(),
  addons: z.array(z.object({
    id: z.string(),
    name: z.string(),
    url: z.string().url(),
    enabled: z.boolean(),
    timeout: z.number().int().min(1000).max(60_000).optional(),
  })).default([]),
  filters: z.object({
    resolutions: z.array(z.string()).optional(),
    minResolution: z.string().optional(),
    qualities: z.array(z.string()).optional(),
    maxSizeGb: z.number().positive().optional(),
    minSeeders: z.number().int().min(0).optional(),
    requireCached: z.boolean().optional(),
    excludeKeywords: z.array(z.string()).optional(),
    includeKeywords: z.array(z.string()).optional(),
    excludeCodecs: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
  }).default({}),
  sorting: z.object({
    criteria: z.array(z.string()).default(['cached_first', 'resolution_desc', 'quality_desc']),
  }).default({}),
  debrid: z.object({
    provider: z.enum(['real-debrid', 'alldebrid', 'premiumize', 'torbox', 'offcloud']),
    apiKey: z.string(),
  }).optional(),
  maxResults: z.number().int().min(1).max(500).optional(),
});

apiRouter.post('/config', async (req: Request, res: Response) => {
  const parsed = configBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid config', details: parsed.error.flatten() });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await createUserConfig(parsed.data as any);
  res.status(201).json(row);
});

apiRouter.put('/config/:id', async (req: Request, res: Response) => {
  const id = String(req.params['id']);
  const parsed = configBodySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: 'Invalid config', details: parsed.error.flatten() });
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = await updateUserConfig(id, parsed.data as any);
  if (!row) { res.status(404).json({ error: 'Not found' }); return; }
  res.json(row);
});

apiRouter.delete('/config/:id', async (req: Request, res: Response) => {
  await deleteUserConfig(String(req.params['id'])).catch(() => null);
  res.status(204).end();
});

// ─── Addon testing ────────────────────────────────────────────────────────────

apiRouter.post('/test-addon', async (req: Request, res: Response) => {
  const { url } = req.body as { url?: string };
  if (!url) { res.status(400).json({ error: 'url is required' }); return; }

  const manifest = await fetchAddonManifest(url);
  if (!manifest) {
    res.status(400).json({ error: 'Could not reach addon or invalid manifest' });
    return;
  }

  res.json({ ok: true, ...manifest });
});

// ─── Marketplace ──────────────────────────────────────────────────────────────

apiRouter.get('/marketplace', (_req, res) => {
  res.json(MARKETPLACE_ADDONS);
});

// ─── Analytics ────────────────────────────────────────────────────────────────

apiRouter.get('/stats/:userId', async (req: Request, res: Response) => {
  const stats = await getAddonStats(String(req.params['userId'])).catch(() => []);
  res.json(stats);
});
