import type { Stream } from '@aio/core';

function fmtSize(bytes: number): string {
  if (bytes >= 1024 ** 4) return `${(bytes / 1024 ** 4).toFixed(1)} TB`;
  if (bytes >= 1024 ** 3) return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
  if (bytes >= 1024 ** 2) return `${(bytes / 1024 ** 2).toFixed(0)} MB`;
  return `${bytes} B`;
}

const DEBRID_RE = /\[(RD|AD|PM|TB|OC)([+⚡✓]?)\]/;

function extractBadge(rawName: string): string {
  const m = rawName.match(DEBRID_RE);
  if (m) return `⚡${m[1]}`;
  if (/⚡/.test(rawName)) return '⚡';
  return '';
}

function shortAddonName(addonName: string): string {
  return addonName.split(/\s*\+\s*/)[0].trim();
}

/**
 * Replaces raw addon name/title with a clean, structured display format.
 * name:  "Torrentio ⚡RD\n4K · BluRay · DV/HDR10"
 * title: "x265 · DTS-HD · 66.3 GB · 👤 11"
 */
export function formatStream(s: Stream): Stream {
  const addonShort = shortAddonName(s.addonName ?? 'Unknown');
  const badge = s.cached ? extractBadge(s.name) : '';

  // Line 1 of name: "Torrentio ⚡RD" or "AnimeTosho"
  const line1 = badge ? `${addonShort} ${badge}` : addonShort;

  // Line 2 of name: "4K · WEB-DL · DV/HDR10"
  const resParts: string[] = [];
  if (s.resolution !== 'Unknown') resParts.push(s.resolution);
  if (s.quality !== 'Unknown') resParts.push(s.quality);
  if (s.hdr.length > 0) resParts.push(s.hdr.join('/'));
  const line2 = resParts.join(' · ');

  const name = line2 ? `${line1}\n${line2}` : line1;

  // Title: codec · audio · size · seeders
  const titleParts: string[] = [];
  if (s.codec !== 'Unknown') titleParts.push(s.codec);
  if (s.audio !== 'Unknown') titleParts.push(s.audio);
  if (s.size !== undefined) titleParts.push(fmtSize(s.size));
  if (s.seeders !== undefined) titleParts.push(`👤 ${s.seeders}`);

  const title = titleParts.length > 0 ? titleParts.join(' · ') : s.title;

  return { ...s, name, title };
}
