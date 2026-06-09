// ─── Streaming platform catalogs via TMDB ─────────────────────────────────────

const TMDB_BASE = 'https://api.themoviedb.org/3';

const getApiKey = () => process.env['TMDB_API_KEY'] ?? '';
const getRegion  = () => process.env['TMDB_REGION']  ?? 'ES';

// ─── Catalog definitions ──────────────────────────────────────────────────────

export interface StreamingCatalogDef {
  id: string;
  name: string;
  stremioType: 'movie' | 'series';
  mediaType: 'movie' | 'tv';
  providerId: number;
}

export const STREAMING_CATALOGS: StreamingCatalogDef[] = [
  { id: 'aio-netflix-movies', name: 'Netflix — Movies',     stremioType: 'movie',  mediaType: 'movie', providerId: 8 },
  { id: 'aio-netflix-series', name: 'Netflix — Series',     stremioType: 'series', mediaType: 'tv',    providerId: 8 },
  { id: 'aio-disney-movies',  name: 'Disney+ — Movies',     stremioType: 'movie',  mediaType: 'movie', providerId: 337 },
  { id: 'aio-disney-series',  name: 'Disney+ — Series',     stremioType: 'series', mediaType: 'tv',    providerId: 337 },
  { id: 'aio-hbo-movies',     name: 'Max — Movies',         stremioType: 'movie',  mediaType: 'movie', providerId: 1899 },
  { id: 'aio-hbo-series',     name: 'Max — Series',         stremioType: 'series', mediaType: 'tv',    providerId: 1899 },
  { id: 'aio-prime-movies',   name: 'Prime Video — Movies', stremioType: 'movie',  mediaType: 'movie', providerId: 9 },
  { id: 'aio-prime-series',   name: 'Prime Video — Series', stremioType: 'series', mediaType: 'tv',    providerId: 9 },
];

const CATALOG_MAP = new Map(STREAMING_CATALOGS.map(c => [c.id, c]));

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetaItem {
  id: string; type: string; name: string;
  poster?: string; background?: string; description?: string;
  releaseInfo?: string; imdbRating?: string;
}

interface ExternalIds { imdb_id?: string | null }

interface DiscoverItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  overview?: string;
  release_date?: string;
  first_air_date?: string;
  vote_average?: number;
}

// ─── In-memory cache: 6 h TTL ─────────────────────────────────────────────────

const cache = new Map<string, { metas: MetaItem[]; expiresAt: number }>();
const TTL_MS = 6 * 60 * 60 * 1000;

// ─── TMDB helpers ─────────────────────────────────────────────────────────────

async function tmdbGet<T>(path: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${TMDB_BASE}${path}`);
  url.searchParams.set('api_key', getApiKey());
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const res = await fetch(url.toString(), { signal: AbortSignal.timeout(10_000) });
  if (!res.ok) throw new Error(`TMDB ${res.status}: ${path}`);
  return res.json() as Promise<T>;
}

async function resolveImdbId(mediaType: 'movie' | 'tv', tmdbId: number): Promise<string | null> {
  try {
    const data = await tmdbGet<ExternalIds>(`/${mediaType}/${tmdbId}/external_ids`);
    return data.imdb_id ?? null;
  } catch { return null; }
}

// ─── Core fetch ───────────────────────────────────────────────────────────────

async function fetchCatalog(def: StreamingCatalogDef, skip: number): Promise<MetaItem[]> {
  const page = Math.floor(skip / 20) + 1;

  const data = await tmdbGet<{ results: DiscoverItem[] }>(`/discover/${def.mediaType}`, {
    with_watch_providers: String(def.providerId),
    watch_region: getRegion(),
    sort_by: 'popularity.desc',
    page: String(page),
  });

  // Resolve IMDB IDs in parallel
  const resolved = await Promise.all(
    data.results.map(async item => ({
      item,
      imdbId: await resolveImdbId(def.mediaType, item.id),
    })),
  );

  return resolved
    .filter(r => r.imdbId)
    .map(({ item, imdbId }) => ({
      id: imdbId!,
      type: def.stremioType,
      name: (item.title ?? item.name ?? 'Unknown').trim(),
      poster: item.poster_path
        ? `https://image.tmdb.org/t/p/w500${item.poster_path}`
        : undefined,
      background: item.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${item.backdrop_path}`
        : undefined,
      description: item.overview || undefined,
      releaseInfo: (item.release_date ?? item.first_air_date)?.slice(0, 4),
      imdbRating: item.vote_average && item.vote_average > 0
        ? item.vote_average.toFixed(1)
        : undefined,
    }));
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function isStreamingCatalog(id: string): boolean {
  return CATALOG_MAP.has(id);
}

export async function fetchStreamingCatalogMetas(catalogId: string, skip = 0): Promise<MetaItem[]> {
  if (!getApiKey()) return [];
  const key = `${catalogId}:${skip}`;
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.metas;
  const def = CATALOG_MAP.get(catalogId);
  if (!def) return [];
  try {
    const metas = await fetchCatalog(def, skip);
    cache.set(key, { metas, expiresAt: Date.now() + TTL_MS });
    return metas;
  } catch {
    return hit?.metas ?? [];
  }
}
