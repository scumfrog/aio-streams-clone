import type { Stream } from '@aio/core';

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── Icon maps ────────────────────────────────────────────────────────────────

const RES_ICON: Record<string, string> = {
  '4K':    '💎',
  '1080p': '🔷',
  '720p':  '🔹',
  '480p':  '📺',
  '360p':  '📺',
};

const QUALITY_ICON: Record<string, string> = {
  'BluRay': '🎬',
  'WEB-DL': '🌐',
  'WEBRip': '🌐',
  'BDRip':  '📀',
  'HDRip':  '📀',
  'HDTV':   '📡',
  'CAM':    '🎥',
};

const LANG_FLAG: Record<string, string> = {
  en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
  it: '🇮🇹', pt: '🇧🇷', ja: '🇯🇵', ko: '🇰🇷',
  zh: '🇨🇳', ru: '🇷🇺', hi: '🇮🇳', ar: '🇸🇦',
};

// ─── Main formatter ───────────────────────────────────────────────────────────

/**
 * Replaces raw addon name/title with a clean, icon-rich display format:
 *
 * name:
 *   ⚡RD · Torrentio
 *   💎 4K · 🌐 WEB-DL · DV/HDR10
 *   💾 66.3 GB · x265 · 🔊 DTS-HD 7.1
 *   🇬🇧 🇪🇸
 *
 * title: 👤 11   (seeders, if available)
 */
export function formatStream(s: Stream): Stream {
  const addonShort = shortAddonName(s.addonName ?? 'Unknown');
  const badge = s.cached ? extractBadge(s.name) : '';

  // ── Line 1: source + cached badge ────────────────────────────────────────
  const line1 = badge ? `${badge} · ${addonShort}` : addonShort;

  // ── Line 2: resolution · quality · HDR ───────────────────────────────────
  const line2Parts: string[] = [];
  if (s.resolution !== 'Unknown') {
    const icon = RES_ICON[s.resolution] ?? '';
    line2Parts.push(`${icon} ${s.resolution}`.trim());
  }
  if (s.quality !== 'Unknown') {
    const icon = QUALITY_ICON[s.quality] ?? '';
    line2Parts.push(`${icon} ${s.quality}`.trim());
  }
  if (s.hdr.length > 0) line2Parts.push(s.hdr.join('/'));
  const line2 = line2Parts.join(' · ');

  // ── Line 3: size · codec · audio ─────────────────────────────────────────
  const line3Parts: string[] = [];
  if (s.size !== undefined) line3Parts.push(`💾 ${fmtSize(s.size)}`);
  if (s.codec !== 'Unknown') line3Parts.push(s.codec);
  const audioParts = [
    s.audio !== 'Unknown' ? s.audio : '',
    s.audioChannels ?? '',
  ].filter(Boolean);
  if (audioParts.length > 0) line3Parts.push(`🔊 ${audioParts.join(' ')}`);
  const line3 = line3Parts.join(' · ');

  // ── Line 4: language flags (only when detected) ───────────────────────────
  const flags = s.languages
    .map(l => LANG_FLAG[l])
    .filter(Boolean)
    .join(' ');

  // ── Assemble name ─────────────────────────────────────────────────────────
  const name = [line1, line2, line3, flags].filter(Boolean).join('\n');

  // ── Title: seeders ────────────────────────────────────────────────────────
  const title = s.seeders !== undefined ? `👤 ${s.seeders}` : '';

  return { ...s, name, title };
}
