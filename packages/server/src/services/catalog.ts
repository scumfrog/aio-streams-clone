// ─── Anime catalog via Kitsu public API ───────────────────────────────────────

const KITSU_API = 'https://kitsu.io/api/edge';

interface KitsuAttributes {
  canonicalTitle: string;
  titles: Record<string, string>;
  synopsis: string | null;
  posterImage?: { large?: string; original?: string };
  coverImage?: { large?: string; original?: string };
  startDate?: string;
  averageRating?: string;
}

interface KitsuItem { id: string; attributes: KitsuAttributes }

export interface StremioMetaItem {
  id: string;
  type: string;
  name: string;
  poster?: string;
  background?: string;
  description?: string;
  releaseInfo?: string;
  imdbRating?: string;
}

// ─── Catalog definitions (exposed in manifest) ────────────────────────────────

export const ANIME_CATALOGS = [
  { id: 'aio-anime-airing',    name: 'Anime — Airing Now' },
  { id: 'aio-anime-popular',   name: 'Anime — Most Popular' },
  { id: 'aio-anime-top-rated', name: 'Anime — Top Rated' },
];

// ─── In-memory cache (1 h TTL) ────────────────────────────────────────────────

const cache = new Map<string, { metas: StremioMetaItem[]; expiresAt: number }>();
const TTL_MS = 60 * 60 * 1000;

function toMeta(item: KitsuItem): StremioMetaItem {
  const a = item.attributes;
  const name = a.titles['en'] || a.titles['en_jp'] || a.canonicalTitle;
  return {
    id: `kitsu:${item.id}`,
    type: 'series',
    name,
    poster: a.posterImage?.large ?? a.posterImage?.original,
    background: a.coverImage?.large ?? a.coverImage?.original,
    description: a.synopsis ?? undefined,
    releaseInfo: a.startDate?.slice(0, 4),
    imdbRating: a.averageRating
      ? (parseFloat(a.averageRating) / 10).toFixed(1)
      : undefined,
  };
}

async function kitsuFetch(qs: string): Promise<StremioMetaItem[]> {
  const res = await fetch(`${KITSU_API}/anime?${qs}`, {
    headers: { Accept: 'application/vnd.api+json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) throw new Error(`Kitsu HTTP ${res.status}`);
  const json = (await res.json()) as { data: KitsuItem[] };
  return (json.data ?? []).map(toMeta);
}

async function cached(key: string, qs: string): Promise<StremioMetaItem[]> {
  const hit = cache.get(key);
  if (hit && Date.now() < hit.expiresAt) return hit.metas;
  try {
    const metas = await kitsuFetch(qs);
    cache.set(key, { metas, expiresAt: Date.now() + TTL_MS });
    return metas;
  } catch {
    return hit?.metas ?? [];
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function fetchAnimeCatalog(
  catalogId: string,
  skip = 0,
): Promise<StremioMetaItem[]> {
  const base = `page[limit]=20&page[offset]=${skip}`;

  switch (catalogId) {
    case 'aio-anime-airing':
      return cached(
        `airing:${skip}`,
        `${base}&filter[status]=current&sort=-userCount`,
      );
    case 'aio-anime-popular':
      return cached(`popular:${skip}`, `${base}&sort=-userCount`);
    case 'aio-anime-top-rated':
      return cached(
        `top-rated:${skip}`,
        `${base}&sort=-averageRating&filter[averageRating]=70..`,
      );
    default:
      return [];
  }
}
