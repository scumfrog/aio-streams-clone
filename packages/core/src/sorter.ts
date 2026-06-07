import type { Stream, SortCriterion, Resolution, Quality } from './types.js';

const RESOLUTION_RANK: Record<Resolution, number> = {
  '4K': 4,
  '1080p': 3,
  '720p': 2,
  '480p': 1,
  '360p': 0,
  'Unknown': -1,
};

const QUALITY_RANK: Record<Quality, number> = {
  BluRay: 7,
  'WEB-DL': 6,
  WEBRip: 5,
  BDRip: 4,
  HDRip: 3,
  HDTV: 2,
  CAM: 0,
  Unknown: -1,
};

type Comparator = (a: Stream, b: Stream) => number;

const COMPARATORS: Record<SortCriterion, Comparator> = {
  resolution_desc: (a, b) =>
    RESOLUTION_RANK[b.resolution] - RESOLUTION_RANK[a.resolution],

  resolution_asc: (a, b) =>
    RESOLUTION_RANK[a.resolution] - RESOLUTION_RANK[b.resolution],

  quality_desc: (a, b) =>
    QUALITY_RANK[b.quality] - QUALITY_RANK[a.quality],

  size_desc: (a, b) => (b.size ?? 0) - (a.size ?? 0),

  size_asc: (a, b) => (a.size ?? 0) - (b.size ?? 0),

  seeders_desc: (a, b) => (b.seeders ?? 0) - (a.seeders ?? 0),

  cached_first: (a, b) => (b.cached ? 1 : 0) - (a.cached ? 1 : 0),

  // Preserves insertion order (addons are already ordered by user preference)
  addon_order: () => 0,
};

/**
 * Sort streams according to an ordered list of criteria.
 * Each criterion is tried in turn; later criteria only apply when
 * earlier ones are equal.
 */
export function sortStreams(streams: Stream[], criteria: SortCriterion[]): Stream[] {
  if (!criteria || criteria.length === 0) return streams;

  return [...streams].sort((a, b) => {
    for (const criterion of criteria) {
      const cmp = COMPARATORS[criterion];
      if (!cmp) continue;
      const result = cmp(a, b);
      if (result !== 0) return result;
    }
    return 0;
  });
}
