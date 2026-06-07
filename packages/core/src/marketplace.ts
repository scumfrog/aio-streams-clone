import type { MarketplaceAddon } from './types.js';

export const MARKETPLACE_ADDONS: MarketplaceAddon[] = [
  {
    id: 'torrentio',
    name: 'Torrentio',
    description:
      'The most popular Stremio addon. Aggregates torrents from multiple trackers and supports all major debrid services.',
    url: 'https://torrentio.strem.fun',
    tags: ['torrents', 'debrid', 'popular'],
    requiresDebrid: false,
    setupTemplate: 'https://torrentio.strem.fun/{CONFIG}',
    setupFields: [
      {
        key: 'CONFIG',
        label: 'Torrentio config string (from torrentio.strem.fun/configure)',
        type: 'text',
      },
    ],
  },
  {
    id: 'knaben',
    name: 'Knaben',
    description: 'Large torrent search index with 500M+ torrents.',
    url: 'https://knaben.strem.fun',
    tags: ['torrents'],
    requiresDebrid: false,
  },
  {
    id: 'mediafusion',
    name: 'MediaFusion',
    description: 'Multi-source addon with torrent and debrid support. Open source and self-hostable.',
    url: 'https://mediafusion.elfhosted.com',
    tags: ['torrents', 'debrid', 'open-source'],
    requiresDebrid: false,
  },
  {
    id: 'torbox-addon',
    name: 'TorBox Addon',
    description: 'Official TorBox debrid addon for Stremio.',
    url: 'https://stremio.torbox.app',
    tags: ['debrid', 'torbox'],
    requiresDebrid: true,
    setupFields: [
      { key: 'API_KEY', label: 'TorBox API Key', type: 'password' },
    ],
  },
  {
    id: 'comet',
    name: 'Comet',
    description: 'Fast, open-source debrid-first addon. Self-hostable.',
    url: 'https://comet.elfhosted.com',
    tags: ['debrid', 'open-source', 'fast'],
    requiresDebrid: true,
  },
  {
    id: 'jackettio',
    name: 'Jackettio',
    description: 'Connects your Jackett instance to Stremio with debrid support.',
    url: 'https://jackettio.elfhosted.com',
    tags: ['jackett', 'debrid', 'self-hosted'],
    requiresDebrid: false,
    setupFields: [
      { key: 'JACKETT_URL', label: 'Jackett URL', type: 'text' },
      { key: 'JACKETT_KEY', label: 'Jackett API Key', type: 'password' },
    ],
  },
  {
    id: 'easynews',
    name: 'Easynews+',
    description: 'Usenet-based streams via Easynews subscription.',
    url: 'https://b89262c192b0-easynews.baby-beamup.club',
    tags: ['usenet', 'easynews'],
    requiresDebrid: false,
    setupFields: [
      { key: 'USERNAME', label: 'Easynews username', type: 'text' },
      { key: 'PASSWORD', label: 'Easynews password', type: 'password' },
    ],
  },
];
