import { ChevronUp, ChevronDown, X, Plus } from 'lucide-react';
import type { SortConfig, SortCriterion } from '../lib/types';

const ALL_CRITERIA: Array<{ value: SortCriterion; label: string; description: string }> = [
  { value: 'cached_first', label: 'Cached first', description: 'Debrid-cached streams appear before uncached' },
  { value: 'resolution_desc', label: 'Resolution ↓', description: 'Highest resolution first (4K → 360p)' },
  { value: 'resolution_asc', label: 'Resolution ↑', description: 'Lowest resolution first' },
  { value: 'quality_desc', label: 'Quality ↓', description: 'Best encode quality first (BluRay > CAM)' },
  { value: 'size_desc', label: 'Size ↓', description: 'Largest files first' },
  { value: 'size_asc', label: 'Size ↑', description: 'Smallest files first' },
  { value: 'seeders_desc', label: 'Seeders ↓', description: 'Most seeded torrents first' },
  { value: 'addon_order', label: 'Addon order', description: 'Preserve the order addons were configured' },
];

const PRESETS: Array<{ name: string; criteria: SortCriterion[] }> = [
  {
    name: '4K Debrid',
    criteria: ['cached_first', 'resolution_desc', 'quality_desc'],
  },
  {
    name: 'Best quality',
    criteria: ['quality_desc', 'resolution_desc', 'size_desc'],
  },
  {
    name: 'Lightweight',
    criteria: ['resolution_desc', 'size_asc', 'seeders_desc'],
  },
  {
    name: 'Best seeded',
    criteria: ['seeders_desc', 'resolution_desc', 'quality_desc'],
  },
];

interface Props {
  sorting: SortConfig;
  onChange: (s: SortConfig) => void;
}

export default function SortPanel({ sorting, onChange }: Props) {
  const criteria = sorting.criteria ?? [];

  const add = (c: SortCriterion) => {
    if (criteria.includes(c)) return;
    onChange({ criteria: [...criteria, c] });
  };

  const remove = (c: SortCriterion) =>
    onChange({ criteria: criteria.filter(x => x !== c) });

  const move = (idx: number, dir: 'up' | 'down') => {
    const arr = [...criteria];
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= arr.length) return;
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onChange({ criteria: arr });
  };

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div>
        <span className="text-sm font-medium text-gray-300 mb-2 block">Quick presets</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => onChange({ criteria: p.criteria })}
              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-700 text-gray-400
                         hover:border-brand-700 hover:text-brand-300 hover:bg-brand-900/20 transition-colors"
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active criteria */}
      <div>
        <span className="text-sm font-medium text-gray-300 mb-2 block">Sort order</span>
        {criteria.length === 0 ? (
          <div className="card text-center py-8 text-gray-600 text-sm">
            Add criteria below, or choose a preset above
          </div>
        ) : (
          <div className="space-y-2">
            {criteria.map((c, i) => {
              const def = ALL_CRITERIA.find(d => d.value === c);
              return (
                <div key={c} className="card flex items-center gap-3 py-3">
                  <span className="text-xs font-mono text-gray-600 w-5 text-center">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-gray-200">{def?.label ?? c}</div>
                    <div className="text-xs text-gray-500">{def?.description}</div>
                  </div>
                  <div className="flex gap-0.5">
                    <button className="btn-ghost p-1" onClick={() => move(i, 'up')} disabled={i === 0}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="btn-ghost p-1" onClick={() => move(i, 'down')} disabled={i === criteria.length - 1}>
                      <ChevronDown size={14} />
                    </button>
                    <button className="btn-ghost p-1 text-red-500 hover:text-red-400" onClick={() => remove(c)}>
                      <X size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add criteria */}
      <div>
        <span className="text-sm font-medium text-gray-300 mb-2 block">Available criteria</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {ALL_CRITERIA.filter(d => !criteria.includes(d.value)).map(d => (
            <button
              key={d.value}
              onClick={() => add(d.value)}
              className="card flex items-center gap-3 py-3 text-left hover:border-gray-700 transition-colors"
            >
              <Plus size={14} className="text-brand-400 shrink-0" />
              <div>
                <div className="text-sm font-medium text-gray-300">{d.label}</div>
                <div className="text-xs text-gray-600">{d.description}</div>
              </div>
            </button>
          ))}
        </div>
        {ALL_CRITERIA.every(d => criteria.includes(d.value)) && (
          <p className="text-sm text-gray-600 text-center py-4">All criteria are active</p>
        )}
      </div>
    </div>
  );
}
