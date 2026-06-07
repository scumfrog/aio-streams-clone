export type Resolution = '4K' | '1080p' | '720p' | '480p' | '360p' | 'Unknown';
export type Quality = 'BluRay' | 'WEB-DL' | 'WEBRip' | 'BDRip' | 'HDRip' | 'HDTV' | 'CAM' | 'Unknown';
export type Codec = 'x265' | 'x264' | 'AV1' | 'XviD' | 'Unknown';
export type SortCriterion =
  | 'resolution_desc' | 'resolution_asc'
  | 'quality_desc'
  | 'size_desc' | 'size_asc'
  | 'seeders_desc'
  | 'cached_first'
  | 'addon_order';

export interface AddonConfig {
  id: string;
  name: string;
  url: string;
  enabled: boolean;
  timeout?: number;
}

export interface FilterConfig {
  resolutions?: Resolution[];
  minResolution?: Resolution;
  qualities?: Quality[];
  maxSizeGb?: number;
  minSeeders?: number;
  requireCached?: boolean;
  excludeKeywords?: string[];
  includeKeywords?: string[];
  excludeCodecs?: Codec[];
  languages?: string[];
}

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
  maxResults?: number;
}

export interface UserConfigRow {
  id: string;
  config: UserConfig;
  created_at: string;
  updated_at: string;
}

export type MarketplaceCategory = 'popular' | 'debrid' | 'torrents' | 'usenet' | 'anime' | 'self-hosted';

export interface MarketplaceAddon {
  id: string;
  name: string;
  description: string;
  url: string;
  logo?: string;
  tags: string[];
  category: MarketplaceCategory;
  requiresDebrid: boolean;
  configureUrl?: string;
  setupTemplate?: string;
  setupFields?: Array<{
    key: string;
    label: string;
    hint?: string;
    type: 'text' | 'password' | 'select';
    options?: string[];
  }>;
}

export interface AddonStat {
  addon_id: string;
  addon_name: string;
  requests: number;
  avg_streams: number;
  avg_duration_ms: number;
  error_rate: number;
}
