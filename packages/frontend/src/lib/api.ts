import type { UserConfig, UserConfigRow, MarketplaceAddon, AddonStat } from './types';

const BASE = '/api';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? `HTTP ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

// ─── Config ───────────────────────────────────────────────────────────────────

export const api = {
  getConfig: (id: string) =>
    request<UserConfigRow>(`/config/${id}`),

  createConfig: (config: UserConfig) =>
    request<UserConfigRow>('/config', { method: 'POST', body: JSON.stringify(config) }),

  updateConfig: (id: string, config: UserConfig) =>
    request<UserConfigRow>(`/config/${id}`, { method: 'PUT', body: JSON.stringify(config) }),

  deleteConfig: (id: string) =>
    request<void>(`/config/${id}`, { method: 'DELETE' }),

  testAddon: (url: string) =>
    request<{ ok: boolean; name: string; version: string; types: string[] }>(
      '/test-addon',
      { method: 'POST', body: JSON.stringify({ url }) },
    ),

  getMarketplace: () =>
    request<MarketplaceAddon[]>('/marketplace'),

  getStats: (userId: string) =>
    request<AddonStat[]>(`/stats/${userId}`),
};

// ─── Stremio install URL ──────────────────────────────────────────────────────

export function buildInstallUrl(userId: string): string {
  const base = window.location.origin;
  return `stremio://${new URL(base).host}/${userId}/manifest.json`;
}

export function buildManifestUrl(userId: string): string {
  const base = window.location.origin;
  return `${base}/${userId}/manifest.json`;
}
