import type { Stream, FilterConfig, Resolution } from './types.js';

const RESOLUTION_ORDER: Record<Resolution, number> = {
  '4K': 4,
  '1080p': 3,
  '720p': 2,
  '480p': 1,
  '360p': 0,
  'Unknown': -1,
};

/**
 * Filter a list of streams according to the user's FilterConfig.
 * Returns only streams that pass every active rule.
 */
export function filterStreams(streams: Stream[], config: FilterConfig): Stream[] {
  if (!config || Object.keys(config).length === 0) return streams;

  return streams.filter(s => {
    // Allowed resolutions whitelist
    if (config.resolutions && config.resolutions.length > 0) {
      if (!config.resolutions.includes(s.resolution)) return false;
    }

    // Minimum resolution threshold (Unknown resolution passes — parser couldn't detect it)
    if (config.minResolution && s.resolution !== 'Unknown') {
      const streamRank = RESOLUTION_ORDER[s.resolution];
      const minRank = RESOLUTION_ORDER[config.minResolution];
      if (streamRank < minRank) return false;
    }

    // Allowed qualities whitelist
    if (config.qualities && config.qualities.length > 0) {
      if (!config.qualities.includes(s.quality)) return false;
    }

    // Maximum file size (GB)
    if (config.maxSizeGb !== undefined && s.size !== undefined) {
      if (s.size > config.maxSizeGb * 1024 ** 3) return false;
    }

    // Minimum seeders
    if (config.minSeeders !== undefined && s.seeders !== undefined) {
      if (s.seeders < config.minSeeders) return false;
    }

    // Require debrid-cached streams only
    if (config.requireCached && !s.cached) return false;

    // Excluded codecs
    if (config.excludeCodecs && config.excludeCodecs.length > 0) {
      if (config.excludeCodecs.includes(s.codec)) return false;
    }

    // Language whitelist (if specified, stream must include at least one)
    if (config.languages && config.languages.length > 0 && s.languages.length > 0) {
      const hasLang = config.languages.some(l => s.languages.includes(l));
      if (!hasLang) return false;
    }

    // 3D stream exclusion
    if (config.exclude3D) {
      const haystack = `${s.name} ${s.title}`.toLowerCase();
      if (/\b(3d|sbs|hsbs|h-sbs|hou|half-ou|half-sbs)\b/.test(haystack)) return false;
    }

    // Keyword exclusion
    if (config.excludeKeywords && config.excludeKeywords.length > 0) {
      const haystack = `${s.name} ${s.title}`.toLowerCase();
      if (config.excludeKeywords.some(kw => haystack.includes(kw.toLowerCase()))) {
        return false;
      }
    }

    // Keyword inclusion (at least one must match)
    if (config.includeKeywords && config.includeKeywords.length > 0) {
      const haystack = `${s.name} ${s.title}`.toLowerCase();
      if (!config.includeKeywords.some(kw => haystack.includes(kw.toLowerCase()))) {
        return false;
      }
    }

    return true;
  });
}
