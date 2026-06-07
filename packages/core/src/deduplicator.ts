import type { Stream } from './types.js';

/**
 * Remove duplicate streams.
 *
 * Deduplication key priority:
 * 1. infoHash (torrent) – most precise
 * 2. behaviorHints.filename – same file from different sources
 * 3. url – direct link
 * 4. name+title – last resort
 *
 * When a duplicate is found, keep the first occurrence (which should already
 * be the best-ranked one after sorting).
 */
export function deduplicateStreams(streams: Stream[]): Stream[] {
  const seen = new Set<string>();

  return streams.filter(s => {
    const key = buildKey(s);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildKey(s: Stream): string {
  if (s.infoHash) return `hash:${s.infoHash.toLowerCase()}`;
  const filename = s.behaviorHints?.filename;
  if (filename) return `file:${filename.toLowerCase()}`;
  if (s.url) return `url:${s.url}`;
  return `name:${s.name.toLowerCase()}|${s.title.toLowerCase()}`;
}
