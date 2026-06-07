import { config } from '../config.js';

export interface RawStream {
  name: string;
  title: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  sources?: string[];
  behaviorHints?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface AddonFetchResult {
  streams: RawStream[];
  durationMs: number;
  error?: string;
}

/**
 * Fetch raw streams from a single Stremio addon URL.
 * Normalises the base URL, builds the stream endpoint, and handles errors gracefully.
 */
export async function fetchStreamsFromAddon(
  baseUrl: string,
  type: string,
  id: string,
  timeout = config.maxAddonTimeout,
): Promise<AddonFetchResult> {
  // Encode pipe characters (used by Torrentio-style config URLs, invalid per RFC 3986)
  const normalised = baseUrl.replace(/\/+$/, '').replace(/\|/g, '%7C');
  const streamUrl = normalised.endsWith('/stream')
    ? `${normalised}/${type}/${id}.json`
    : `${normalised}/stream/${type}/${id}.json`;

  const start = Date.now();

  try {
    const res = await fetch(streamUrl, {
      signal: AbortSignal.timeout(timeout),
      headers: { 'User-Agent': 'AIOStreams-Clone/1.0.0' },
    });

    const durationMs = Date.now() - start;

    if (!res.ok) {
      return { streams: [], durationMs, error: `HTTP ${res.status}` };
    }

    const json = await res.json() as { streams?: unknown[] };
    const streams = (Array.isArray(json.streams) ? json.streams : []) as RawStream[];

    return { streams, durationMs };
  } catch (err: unknown) {
    return {
      streams: [],
      durationMs: Date.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Fetch and validate the manifest of an addon URL.
 * Returns the manifest fields we care about.
 */
export async function fetchAddonManifest(url: string): Promise<{
  name: string;
  version: string;
  types: string[];
  resources: string[];
} | null> {
  const normalised = url.replace(/\/+$/, '');
  const manifestUrl = `${normalised}/manifest.json`;

  try {
    const res = await fetch(manifestUrl, {
      signal: AbortSignal.timeout(10_000),
      headers: { 'User-Agent': 'AIOStreams-Clone/1.0.0' },
    });
    if (!res.ok) return null;
    const json = await res.json() as { name?: string; version?: string; types?: string[]; resources?: string[] };
    return {
      name: String(json.name ?? 'Unknown'),
      version: String(json.version ?? '0.0.0'),
      types: Array.isArray(json.types) ? json.types as string[] : [],
      resources: Array.isArray(json.resources) ? json.resources as string[] : [],
    };
  } catch {
    return null;
  }
}
