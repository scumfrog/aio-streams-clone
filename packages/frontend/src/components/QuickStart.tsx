import { useState } from 'react';
import { Zap, ChevronRight, CheckCircle2 } from 'lucide-react';
import type { AddonConfig, FilterConfig, SortConfig } from '../lib/types';

// ─── Preset definitions ───────────────────────────────────────────────────────

interface PresetDef {
  id: string;
  name: string;
  description: string;
  icon: string;
  badge?: string;
  addons: Array<{ name: string; url: string }>;
  filters: FilterConfig;
  sorting: SortConfig;
  maxResults: number;
  tip?: string;
}

const PRESETS: PresetDef[] = [
  {
    id: '4k-debrid',
    name: '4K + Debrid',
    description: 'Maximum quality cached streams. Best with Real-Debrid or AllDebrid.',
    icon: '💎',
    badge: 'Popular',
    addons: [
      { name: 'MediaFusion', url: 'https://mediafusion.elfhosted.com' },
    ],
    filters: { minResolution: '4K', requireCached: true },
    sorting: { criteria: ['cached_first', 'resolution_desc', 'quality_desc', 'size_desc'] },
    maxResults: 20,
    tip: 'Add Torrentio+RD and Comet+RD from the Marketplace for the best cached results.',
  },
  {
    id: 'best-quality',
    name: 'Best Quality',
    description: 'Highest quality streams from top trackers. No debrid required.',
    icon: '🏆',
    addons: [
      { name: 'Torrentio', url: 'https://torrentio.strem.fun' },
      { name: 'MediaFusion', url: 'https://mediafusion.elfhosted.com' },
      { name: 'Knaben', url: 'https://knaben.strem.fun' },
    ],
    filters: { minResolution: '1080p', minSeeders: 10 },
    sorting: { criteria: ['resolution_desc', 'quality_desc', 'seeders_desc', 'size_desc'] },
    maxResults: 30,
  },
  {
    id: 'anime',
    name: 'Anime',
    description: 'Best-quality encodes from dedicated anime trackers with subtitle support.',
    icon: '🎌',
    addons: [
      { name: 'AnimeTosho', url: 'https://animetosho.org/stremio' },
      { name: 'SeaDex', url: 'https://seadex.strem.fun' },
      { name: 'AnimePahe', url: 'https://animepahe.strem.fun' },
    ],
    filters: {},
    sorting: { criteria: ['cached_first', 'resolution_desc', 'quality_desc', 'seeders_desc'] },
    maxResults: 30,
    tip: 'Also add Torrentio+RD from the Marketplace for instant cached anime streams.',
  },
  {
    id: 'lightweight',
    name: 'Lightweight',
    description: 'Small files, highly seeded. Great for limited bandwidth or older devices.',
    icon: '⚡',
    addons: [
      { name: 'Torrentio', url: 'https://torrentio.strem.fun' },
      { name: 'Peerflix', url: 'https://peerflix-addon.onrender.com' },
    ],
    filters: { maxSizeGb: 4, minSeeders: 50, minResolution: '720p' },
    sorting: { criteria: ['seeders_desc', 'size_asc', 'resolution_desc'] },
    maxResults: 20,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

interface Props {
  onApply: (
    addons: AddonConfig[],
    filters: FilterConfig,
    sorting: SortConfig,
    maxResults: number,
    tip?: string,
  ) => void;
  onSkip: () => void;
}

export default function QuickStart({ onApply, onSkip }: Props) {
  const [applied, setApplied] = useState<string | null>(null);

  const handlePreset = (preset: PresetDef) => {
    const addons: AddonConfig[] = preset.addons.map(a => ({
      id: crypto.randomUUID(),
      name: a.name,
      url: a.url,
      enabled: true,
    }));
    setApplied(preset.id);
    onApply(addons, preset.filters, preset.sorting, preset.maxResults, preset.tip);
  };

  if (applied) return null;

  return (
    <div className="mb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-gray-100 flex items-center gap-2">
            <Zap size={16} className="text-brand-400" />
            Quick Start
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Pick a preset to get started in seconds, or build your own below.
          </p>
        </div>
        <button className="btn-ghost text-xs" onClick={onSkip}>
          Skip
          <ChevronRight size={12} />
        </button>
      </div>

      {/* Preset grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {PRESETS.map(preset => (
          <button
            key={preset.id}
            onClick={() => handlePreset(preset)}
            className="card text-left hover:border-brand-700 transition-all group p-4"
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl leading-none mt-0.5">{preset.icon}</span>
              <div className="flex-1 min-w-0">
                {/* Name + badge */}
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-sm text-gray-100 group-hover:text-brand-300 transition-colors">
                    {preset.name}
                  </span>
                  {preset.badge && (
                    <span className="badge-indigo text-xs">{preset.badge}</span>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-500 leading-relaxed mb-2">
                  {preset.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1">
                  {preset.addons.map(a => (
                    <span
                      key={a.name}
                      className="text-xs bg-gray-800 text-gray-400 rounded px-1.5 py-0.5"
                    >
                      {a.name}
                    </span>
                  ))}
                  {preset.filters.minResolution && (
                    <span className="text-xs bg-gray-800 text-brand-400 rounded px-1.5 py-0.5">
                      {preset.filters.minResolution}+
                    </span>
                  )}
                  {preset.filters.requireCached && (
                    <span className="text-xs bg-gray-800 text-emerald-400 rounded px-1.5 py-0.5 flex items-center gap-1">
                      <CheckCircle2 size={10} />
                      Cached only
                    </span>
                  )}
                  {preset.filters.maxSizeGb && (
                    <span className="text-xs bg-gray-800 text-amber-400 rounded px-1.5 py-0.5">
                      ≤{preset.filters.maxSizeGb} GB
                    </span>
                  )}
                </div>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 mt-6 mb-2">
        <div className="flex-1 h-px bg-gray-800" />
        <span className="text-xs text-gray-600">or build your own</span>
        <div className="flex-1 h-px bg-gray-800" />
      </div>
    </div>
  );
}
