// ─── Stream types ────────────────────────────────────────────────────────────

export type Resolution = '4K' | '1080p' | '720p' | '480p' | '360p' | 'Unknown';
export type Quality = 'BluRay' | 'WEB-DL' | 'WEBRip' | 'BDRip' | 'HDRip' | 'HDTV' | 'CAM' | 'Unknown';
export type Codec = 'x265' | 'x264' | 'AV1' | 'XviD' | 'Unknown';
export type AudioFormat = 'Atmos' | 'TrueHD' | 'DTS-HD' | 'DTS' | 'EAC3' | 'AC3' | 'AAC' | 'MP3' | 'Unknown';

export interface ParsedStream {
  resolution: Resolution;
  quality: Quality;
  codec: Codec;
  audio: AudioFormat;
  hdr: string[];       // ['HDR10', 'DV', etc.]
  size?: number;       // bytes
  seeders?: number;
  cached: boolean;
  languages: string[];
  audioChannels?: string;  // '7.1' | '5.1' | '2.0' etc.
  group?: string;          // release group
}

export interface Stream extends ParsedStream {
  // Stremio protocol fields
  name: string;
  title: string;
  url?: string;
  infoHash?: string;
  fileIdx?: number;
  sources?: string[];
  behaviorHints?: {
    bingeGroup?: string;
    proxyHeaders?: Record<string, string>;
    notWebReady?: boolean;
    filename?: string;
  };
  // Added by aggregator
  addonId?: string;
  addonName?: string;
}

// ─── Config types ─────────────────────────────────────────────────────────────

export interface AddonConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  timeout?: number;   // ms, default 15000
}

export interface FilterConfig {
  resolutions?: Resolution[];
  minResolution?: Resolution;
  qualities?: Quality[];
  maxSizeGb?: number;
  minSeeders?: number;
  requireCached?: boolean;
  cachedFirst?: boolean;
  excludeKeywords?: string[];
  includeKeywords?: string[];
  excludeCodecs?: Codec[];
  languages?: string[];
  exclude3D?: boolean;
}

export type SortCriterion =
  | 'resolution_desc'
  | 'resolution_asc'
  | 'quality_desc'
  | 'size_desc'
  | 'size_asc'
  | 'seeders_desc'
  | 'cached_first'
  | 'addon_order';

export interface SortConfig {
  criteria: SortCriterion[];
}

export interface DebridConfig {
  provider: 'real-debrid' | 'alldebrid' | 'premiumize' | 'torbox' | 'offcloud';
  apiKey: string;
}

export interface UserConfig {
  name?: string;
  addons: AddonConfig[];
  filters: FilterConfig;
  sorting: SortConfig;
  debrid?: DebridConfig;
  maxResults?: number;  // per type, default 20
}

// ─── Stremio manifest ─────────────────────────────────────────────────────────

export interface StremioManifest {
  id: string;
  version: string;
  name: string;
  description: string;
  resources: string[];
  types: string[];
  catalogs: StremiosCatalog[];
  idPrefixes?: string[];
  behaviorHints?: {
    configurable?: boolean;
    configurationRequired?: boolean;
    adult?: boolean;
  };
  logo?: string;
  background?: string;
}

export interface StremiosCatalog {
  type: string;
  id: string;
  name: string;
  extra?: Array<{
    name: string;
    isRequired?: boolean;
    options?: string[];
  }>;
}

// ─── Marketplace ──────────────────────────────────────────────────────────────

export type MarketplaceCategory = 'popular' | 'debrid' | 'torrents' | 'usenet' | 'anime' | 'self-hosted';

export interface MarketplaceAddon {
  id: string;
  name: string;
  description: string;
  /** Base URL – empty string when URL is built from a setupTemplate */
  url: string;
  logo?: string;
  tags: string[];
  category: MarketplaceCategory;
  requiresDebrid: boolean;
  /** Link to the addon's own configure page (opens in new tab) */
  configureUrl?: string;
  /** URL template – {FIELD_KEY} placeholders get replaced by user input */
  setupTemplate?: string;
  setupFields?: Array<{
    key: string;
    label: string;
    hint?: string;
    type: 'text' | 'password' | 'select';
    options?: string[];
  }>;
}
