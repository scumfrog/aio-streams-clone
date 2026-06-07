import type { MarketplaceAddon } from './types.js';

export const MARKETPLACE_ADDONS: MarketplaceAddon[] = [

  // ─── 🔥 Popular ─────────────────────────────────────────────────────────────

  {
    id: 'torrentio',
    name: 'Torrentio',
    description: 'The most popular Stremio addon. Aggregates torrents from 15+ trackers (YTS, EZTV, RARBG, 1337x…). Works without debrid but cache detection requires one.',
    url: 'https://torrentio.strem.fun',
    category: 'popular',
    tags: ['torrents', 'popular'],
    requiresDebrid: false,
    configureUrl: 'https://torrentio.strem.fun/configure',
  },
  {
    id: 'mediafusion',
    name: 'MediaFusion',
    description: 'Open-source multi-source addon supporting torrents, debrid, and live TV. Highly configurable via its web UI.',
    url: 'https://mediafusion.elfhosted.com',
    category: 'popular',
    tags: ['torrents', 'debrid', 'open-source'],
    requiresDebrid: false,
    configureUrl: 'https://mediafusion.elfhosted.com/configure',
  },
  {
    id: 'comet',
    name: 'Comet',
    description: 'Fast, open-source debrid-first Stremio addon. Prioritises cached torrents and supports all major debrid providers.',
    url: 'https://comet.elfhosted.com',
    category: 'popular',
    tags: ['debrid', 'open-source', 'fast', 'popular'],
    requiresDebrid: true,
    configureUrl: 'https://comet.elfhosted.com/configure',
  },

  // ─── 💎 Real-Debrid ──────────────────────────────────────────────────────────

  {
    id: 'torrentio-rd',
    name: 'Torrentio + Real-Debrid',
    description: 'Torrentio optimised for Real-Debrid — 12 top trackers (YTS, RARBG, 1337x…), sorted by quality+size, 20 results per query.',
    url: '',
    category: 'debrid',
    tags: ['torrents', 'real-debrid', 'popular'],
    requiresDebrid: true,
    setupTemplate: 'https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,horriblesubs,nyaasi,tokyotosho,anidex|sort=qualitysize|limit=20|realdebrid={RD_API_KEY}',
    setupFields: [
      {
        key: 'RD_API_KEY',
        label: 'Real-Debrid API Key',
        hint: 'Get it at real-debrid.com/apitoken',
        type: 'password',
      },
    ],
  },
  {
    id: 'comet-rd',
    name: 'Comet + Real-Debrid',
    description: 'Comet configured for Real-Debrid. Get your config URL from the Comet configure page.',
    url: '',
    category: 'debrid',
    tags: ['debrid', 'real-debrid', 'fast'],
    requiresDebrid: true,
    setupTemplate: '{COMET_URL}',
    setupFields: [
      {
        key: 'COMET_URL',
        label: 'Comet configured URL',
        hint: 'Generate at comet.elfhosted.com/configure then paste the full URL here',
        type: 'text',
      },
    ],
  },
  {
    id: 'knightcrawler-rd',
    name: 'KnightCrawler + Real-Debrid',
    description: 'Stremio addon with extensive torrent search. Configure with your Real-Debrid key for cached streams.',
    url: '',
    category: 'debrid',
    tags: ['torrents', 'real-debrid'],
    requiresDebrid: true,
    setupTemplate: 'https://knightcrawler.elfhosted.com/{RD_API_KEY}',
    setupFields: [
      {
        key: 'RD_API_KEY',
        label: 'Real-Debrid API Key',
        hint: 'Get it at real-debrid.com/apitoken',
        type: 'password',
      },
    ],
  },

  // ─── 💎 AllDebrid ────────────────────────────────────────────────────────────

  {
    id: 'torrentio-ad',
    name: 'Torrentio + AllDebrid',
    description: 'Torrentio pre-configured for AllDebrid.',
    url: '',
    category: 'debrid',
    tags: ['torrents', 'alldebrid'],
    requiresDebrid: true,
    setupTemplate: 'https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,horriblesubs,nyaasi,tokyotosho,anidex|sort=qualitysize|limit=20|alldebrid={AD_API_KEY}',
    setupFields: [
      {
        key: 'AD_API_KEY',
        label: 'AllDebrid API Key',
        hint: 'Get it at alldebrid.com/apikeys',
        type: 'password',
      },
    ],
  },

  // ─── 💎 Premiumize ───────────────────────────────────────────────────────────

  {
    id: 'torrentio-pm',
    name: 'Torrentio + Premiumize',
    description: 'Torrentio pre-configured for Premiumize.',
    url: '',
    category: 'debrid',
    tags: ['torrents', 'premiumize'],
    requiresDebrid: true,
    setupTemplate: 'https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,horriblesubs,nyaasi,tokyotosho,anidex|sort=qualitysize|limit=20|premiumize={PM_API_KEY}',
    setupFields: [
      {
        key: 'PM_API_KEY',
        label: 'Premiumize API Key',
        hint: 'Get it at app.premiumize.me/account',
        type: 'password',
      },
    ],
  },

  // ─── 💎 TorBox ───────────────────────────────────────────────────────────────

  {
    id: 'torrentio-tb',
    name: 'Torrentio + TorBox',
    description: 'Torrentio pre-configured for TorBox.',
    url: '',
    category: 'debrid',
    tags: ['torrents', 'torbox'],
    requiresDebrid: true,
    setupTemplate: 'https://torrentio.strem.fun/providers=yts,eztv,rarbg,1337x,thepiratebay,kickasstorrents,torrentgalaxy,magnetdl,horriblesubs,nyaasi,tokyotosho,anidex|sort=qualitysize|limit=20|torbox={TB_API_KEY}',
    setupFields: [
      {
        key: 'TB_API_KEY',
        label: 'TorBox API Key',
        hint: 'Get it at torbox.app/settings',
        type: 'password',
      },
    ],
  },
  {
    id: 'torbox-official',
    name: 'TorBox Official Addon',
    description: 'Official TorBox Stremio addon with your personal library.',
    url: '',
    category: 'debrid',
    tags: ['debrid', 'torbox'],
    requiresDebrid: true,
    setupTemplate: 'https://stremio.torbox.app/{TB_API_KEY}',
    setupFields: [
      {
        key: 'TB_API_KEY',
        label: 'TorBox API Key',
        hint: 'Get it at torbox.app/settings',
        type: 'password',
      },
    ],
  },

  // ─── 🧲 Torrents ─────────────────────────────────────────────────────────────

  {
    id: 'knaben',
    name: 'Knaben',
    description: 'Large public torrent index with 500M+ torrents. No debrid required.',
    url: 'https://knaben.strem.fun',
    category: 'torrents',
    tags: ['torrents', 'public'],
    requiresDebrid: false,
  },
  {
    id: 'zilean',
    name: 'Zilean',
    description: 'Search torrents from Zilean time-based torrent index. Useful for recent releases.',
    url: 'https://zilean.elfhosted.com',
    category: 'torrents',
    tags: ['torrents', 'recent'],
    requiresDebrid: false,
  },
  {
    id: 'peerflix',
    name: 'Peerflix',
    description: 'Stream torrents directly without a debrid. Supports WebTorrent for in-browser streaming.',
    url: 'https://peerflix-addon.onrender.com',
    category: 'torrents',
    tags: ['torrents', 'direct', 'no-debrid'],
    requiresDebrid: false,
  },
  {
    id: 'torrentgalaxy',
    name: 'TorrentGalaxy',
    description: 'TorrentGalaxy (TGx) search addon with large library.',
    url: 'https://torrentgalaxy.strem.fun',
    category: 'torrents',
    tags: ['torrents'],
    requiresDebrid: false,
  },

  // ─── 📰 Usenet ────────────────────────────────────────────────────────────────

  {
    id: 'easynews',
    name: 'Easynews+',
    description: 'High-quality Usenet streams via your Easynews subscription. Fast and reliable.',
    url: '',
    category: 'usenet',
    tags: ['usenet', 'easynews'],
    requiresDebrid: false,
    setupTemplate: 'https://b89262c192b0-easynews.baby-beamup.club/{USERNAME}/{PASSWORD}',
    setupFields: [
      { key: 'USERNAME', label: 'Easynews username', hint: 'Your easynews.com username', type: 'text' },
      { key: 'PASSWORD', label: 'Easynews password', hint: 'Your easynews.com password', type: 'password' },
    ],
  },

  // ─── 🎌 Anime ─────────────────────────────────────────────────────────────────

  {
    id: 'animetosho',
    name: 'AnimeTosho',
    description: 'Anime-specific addon with excellent subtitle support and large archive.',
    url: 'https://animetosho.org/stremio',
    category: 'anime',
    tags: ['anime', 'subtitles'],
    requiresDebrid: false,
  },
  {
    id: 'seadex',
    name: 'SeaDex',
    description: 'Best-release anime tracker. Finds the highest-quality encode for each anime.',
    url: 'https://seadex.strem.fun',
    category: 'anime',
    tags: ['anime', 'best-releases'],
    requiresDebrid: false,
  },
  {
    id: 'animepahe',
    name: 'AnimePahe',
    description: 'Anime streams from AnimePahe. Smaller file sizes, good quality.',
    url: 'https://animepahe.strem.fun',
    category: 'anime',
    tags: ['anime'],
    requiresDebrid: false,
  },

  // ─── 🔧 Self-hosted ───────────────────────────────────────────────────────────

  {
    id: 'jackettio',
    name: 'Jackettio',
    description: 'Connect your self-hosted Jackett instance to Stremio with optional debrid support.',
    url: '',
    category: 'self-hosted',
    tags: ['jackett', 'self-hosted'],
    requiresDebrid: false,
    configureUrl: 'https://jackettio.elfhosted.com/configure',
    setupTemplate: 'https://jackettio.elfhosted.com/{JACKETT_ID}',
    setupFields: [
      {
        key: 'JACKETT_ID',
        label: 'Jackettio config ID',
        hint: 'Generate at jackettio.elfhosted.com/configure',
        type: 'text',
      },
    ],
  },
  {
    id: 'prowlarr',
    name: 'Prowlarr',
    description: 'Use your self-hosted Prowlarr as a Stremio stream source.',
    url: '',
    category: 'self-hosted',
    tags: ['prowlarr', 'self-hosted'],
    requiresDebrid: false,
    setupTemplate: 'https://prowlarr-stremio.elfhosted.com/{PROWLARR_API_KEY}',
    setupFields: [
      {
        key: 'PROWLARR_API_KEY',
        label: 'Prowlarr API Key',
        hint: 'Found in Prowlarr → Settings → General',
        type: 'password',
      },
    ],
  },
  {
    id: 'annatar',
    name: 'Annatar',
    description: 'Self-hostable indexer bridge addon with Prowlarr/Jackett support.',
    url: 'https://annatar.elfhosted.com',
    category: 'self-hosted',
    tags: ['self-hosted', 'indexer'],
    requiresDebrid: false,
    configureUrl: 'https://annatar.elfhosted.com/configure',
  },
];
