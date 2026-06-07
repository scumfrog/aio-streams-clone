import type { Stream, ParsedStream, Resolution, Quality, Codec, AudioFormat } from './types.js';

// ─── Resolution ───────────────────────────────────────────────────────────────

const RESOLUTION_MAP: Array<[RegExp, Resolution]> = [
  [/\b(4K|2160p|UHD)\b/i, '4K'],
  [/\b1080p\b/i, '1080p'],
  [/\b720p\b/i, '720p'],
  [/\b480p\b/i, '480p'],
  [/\b360p\b/i, '360p'],
];

function parseResolution(text: string): Resolution {
  for (const [re, res] of RESOLUTION_MAP) {
    if (re.test(text)) return res;
  }
  return 'Unknown';
}

// ─── Quality ──────────────────────────────────────────────────────────────────

const QUALITY_MAP: Array<[RegExp, Quality]> = [
  [/\bBlu-?Ray\b/i, 'BluRay'],
  [/\bWEB-?DL\b/i, 'WEB-DL'],
  [/\bWEB-?Rip\b/i, 'WEBRip'],
  [/\bBD-?Rip\b/i, 'BDRip'],
  [/\bHD-?Rip\b/i, 'HDRip'],
  [/\bHDTV\b/i, 'HDTV'],
  [/\b(CAM|HDCAM|HDTS|TELESYNC|TS)\b/i, 'CAM'],
];

function parseQuality(text: string): Quality {
  for (const [re, q] of QUALITY_MAP) {
    if (re.test(text)) return q;
  }
  return 'Unknown';
}

// ─── Codec ────────────────────────────────────────────────────────────────────

const CODEC_MAP: Array<[RegExp, Codec]> = [
  [/\b(x265|H\.?265|HEVC)\b/i, 'x265'],
  [/\b(x264|H\.?264|AVC)\b/i, 'x264'],
  [/\bAV1\b/i, 'AV1'],
  [/\bXviD\b/i, 'XviD'],
];

function parseCodec(text: string): Codec {
  for (const [re, c] of CODEC_MAP) {
    if (re.test(text)) return c;
  }
  return 'Unknown';
}

// ─── Audio ────────────────────────────────────────────────────────────────────

const AUDIO_MAP: Array<[RegExp, AudioFormat]> = [
  [/\bAtmos\b/i, 'Atmos'],
  [/\bTrueHD\b/i, 'TrueHD'],
  [/\bDTS-?HD\b/i, 'DTS-HD'],
  [/\bDTS\b/i, 'DTS'],
  [/\bEAC-?3\b/i, 'EAC3'],
  [/\bAC-?3\b/i, 'AC3'],
  [/\bAAC\b/i, 'AAC'],
  [/\bMP3\b/i, 'MP3'],
];

function parseAudio(text: string): AudioFormat {
  for (const [re, a] of AUDIO_MAP) {
    if (re.test(text)) return a;
  }
  return 'Unknown';
}

// ─── HDR ──────────────────────────────────────────────────────────────────────

const HDR_PATTERNS: Array<[RegExp, string]> = [
  [/\bDolby.?Vision\b/i, 'DV'],
  [/\b(DoVi|DV)\b/, 'DV'],
  [/\bHDR10\+/i, 'HDR10+'],
  [/\bHDR10\b/i, 'HDR10'],
  [/\bHDR\b/i, 'HDR'],
  [/\bHLG\b/i, 'HLG'],
];

function parseHdr(text: string): string[] {
  const found: string[] = [];
  for (const [re, label] of HDR_PATTERNS) {
    if (re.test(text) && !found.includes(label)) found.push(label);
  }
  return found;
}

// ─── Size ─────────────────────────────────────────────────────────────────────

const SIZE_RE = /(?:💾\s*)?(\d+(?:[.,]\d+)?)\s*(TB|GB|MB)/i;

function parseSize(text: string): number | undefined {
  const m = text.match(SIZE_RE);
  if (!m) return undefined;
  const val = parseFloat(m[1].replace(',', '.'));
  const unit = m[2].toUpperCase();
  if (unit === 'TB') return val * 1024 ** 4;
  if (unit === 'GB') return val * 1024 ** 3;
  if (unit === 'MB') return val * 1024 ** 2;
  return undefined;
}

// ─── Seeders ──────────────────────────────────────────────────────────────────

const SEEDERS_RE = /(?:👥\s*|[Ss]eed(?:er)?s?[:\s]+)(\d+)/;

function parseSeeders(text: string): number | undefined {
  const m = text.match(SEEDERS_RE);
  return m ? parseInt(m[1], 10) : undefined;
}

// ─── Cached ───────────────────────────────────────────────────────────────────

function parseCached(text: string): boolean {
  // [RD+], [AD+], [PM+], [TB+] — Torrentio cached stream format
  // [RD], [AD] etc. — other debrid indicators
  // ⚡, +✓ — generic cached symbols
  // [RD+], [RD⚡], [AD+], [PM+], [TB+] — Torrentio / Comet cached format
  return /\[(RD|AD|PM|TB|OC)[+⚡✓]?\]/.test(text) ||
    /⚡/.test(text) ||
    /\b(cached|\+✓)\b/i.test(text) ||
    /\bRD\+\s|AD\+\s|PM\+\s|TB\+\s/.test(text);
}

// ─── Languages ────────────────────────────────────────────────────────────────

const LANG_MAP: Record<string, string> = {
  '🇺🇸': 'en', '🇬🇧': 'en',
  '🇪🇸': 'es', '🇲🇽': 'es',
  '🇫🇷': 'fr',
  '🇩🇪': 'de',
  '🇮🇹': 'it',
  '🇵🇹': 'pt', '🇧🇷': 'pt',
  '🇯🇵': 'ja',
  '🇰🇷': 'ko',
  '🇨🇳': 'zh',
  '🇷🇺': 'ru',
};

const LANG_CODE_RE = /\b(ENG|SPA|FRE|GER|ITA|POR|JPN|KOR|CHI|RUS|HIN|ARA)\b/g;

const LANG_CODE_MAP: Record<string, string> = {
  ENG: 'en', SPA: 'es', FRE: 'fr', GER: 'de', ITA: 'it',
  POR: 'pt', JPN: 'ja', KOR: 'ko', CHI: 'zh', RUS: 'ru',
  HIN: 'hi', ARA: 'ar',
};

function parseLanguages(text: string): string[] {
  const langs = new Set<string>();
  for (const [emoji, code] of Object.entries(LANG_MAP)) {
    if (text.includes(emoji)) langs.add(code);
  }
  for (const m of text.matchAll(LANG_CODE_RE)) {
    const code = LANG_CODE_MAP[m[1]];
    if (code) langs.add(code);
  }
  return [...langs];
}

// ─── Release group ────────────────────────────────────────────────────────────

const GROUP_RE = /[-.]([A-Za-z0-9]{2,10})(?:\s|$)/;

function parseGroup(name: string): string | undefined {
  const m = name.match(GROUP_RE);
  return m ? m[1] : undefined;
}

// ─── Main export ──────────────────────────────────────────────────────────────

/**
 * Parses Stremio stream metadata from a raw stream object.
 * Combines `name` and `title` for scanning.
 */
export function parseStream(raw: Record<string, unknown>): Stream {
  const name = String(raw['name'] ?? '');
  const title = String(raw['title'] ?? '');
  const combined = `${name} ${title}`;

  const parsed: ParsedStream = {
    resolution: parseResolution(combined),
    quality: parseQuality(combined),
    codec: parseCodec(combined),
    audio: parseAudio(combined),
    hdr: parseHdr(combined),
    size: parseSize(combined),
    seeders: parseSeeders(combined),
    cached: parseCached(combined),
    languages: parseLanguages(combined),
    group: parseGroup(name),
  };

  return {
    ...(raw as object),
    name,
    title,
    ...parsed,
  } as Stream;
}
