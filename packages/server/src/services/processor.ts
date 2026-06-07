import { parseStream, filterStreams, sortStreams, deduplicateStreams } from '@aio/core';
import type { Stream, UserConfig, SortCriterion } from '@aio/core';
import { fetchStreamsFromAddon } from './addon.js';
import { getCachedStreams, setCachedStreams, recordAddonRequest } from '../db/index.js';
import { config as appConfig } from '../config.js';

const DEFAULT_SORT: SortCriterion[] = ['cached_first', 'resolution_desc', 'quality_desc', 'seeders_desc'];

export async function processStreams(
  userId: string,
  type: string,
  id: string,
  userConfig: UserConfig,
): Promise<Stream[]> {
  const cacheKey = `streams:${userId}:${type}:${id}`;

  const cached = await getCachedStreams(cacheKey);
  if (cached) return cached as Stream[];

  const enabledAddons = userConfig.addons.filter(a => a.enabled);
  if (enabledAddons.length === 0) return [];

  // Fetch from all addons concurrently
  const results = await Promise.allSettled(
    enabledAddons.map(async addon => {
      const result = await fetchStreamsFromAddon(
        addon.url,
        type,
        id,
        addon.timeout ?? appConfig.maxAddonTimeout,
      );

      // Fire-and-forget analytics (don't await)
      recordAddonRequest({
        userId,
        addonId: addon.id,
        addonName: addon.name,
        streamsReturned: result.streams.length,
        durationMs: result.durationMs,
        error: result.error,
      }).catch(() => { /* ignore */ });

      return result.streams
        .slice(0, appConfig.maxStreamsPerAddon)
        .map(raw => ({
          ...parseStream(raw as Record<string, unknown>),
          addonId: addon.id,
          addonName: addon.name,
        }));
    }),
  );

  let streams: Stream[] = [];
  for (const r of results) {
    if (r.status === 'fulfilled') streams.push(...r.value);
  }

  // Pipeline: deduplicate → filter → sort → limit
  streams = deduplicateStreams(streams);
  streams = filterStreams(streams, userConfig.filters ?? {});
  streams = sortStreams(streams, userConfig.sorting?.criteria ?? DEFAULT_SORT);

  const maxResults = userConfig.maxResults ?? appConfig.maxTotalResults;
  streams = streams.slice(0, maxResults);

  await setCachedStreams(cacheKey, streams, appConfig.streamCacheTtl);
  return streams;
}
