import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight,
  CheckCircle2, XCircle, Loader2, Store, Link2, ExternalLink,
  Settings, X, Eye, EyeOff,
} from 'lucide-react';
import { api } from '../lib/api';
import type { AddonConfig, MarketplaceAddon, MarketplaceCategory } from '../lib/types';

// ─── Category metadata ────────────────────────────────────────────────────────

const CATEGORIES: Array<{ id: MarketplaceCategory | 'all'; label: string; emoji: string }> = [
  { id: 'all',         label: 'All',         emoji: '✨' },
  { id: 'popular',     label: 'Popular',     emoji: '🔥' },
  { id: 'debrid',      label: 'Debrid',      emoji: '💎' },
  { id: 'torrents',    label: 'Torrents',    emoji: '🧲' },
  { id: 'usenet',      label: 'Usenet',      emoji: '📰' },
  { id: 'anime',       label: 'Anime',       emoji: '🎌' },
  { id: 'self-hosted', label: 'Self-hosted', emoji: '🔧' },
];

// ─── Template substitution ────────────────────────────────────────────────────

function buildUrl(template: string, values: Record<string, string>): string {
  return Object.entries(values).reduce(
    (url, [key, val]) => url.replace(`{${key}}`, encodeURIComponent(val).replace(/%3D/g, '=')),
    template,
  );
}

// ─── Setup dialog ─────────────────────────────────────────────────────────────

function SetupDialog({
  addon,
  onConfirm,
  onClose,
}: {
  addon: MarketplaceAddon;
  onConfirm: (url: string, name: string) => void;
  onClose: () => void;
}) {
  const [values, setValues] = useState<Record<string, string>>({});
  const [showPwd, setShowPwd] = useState<Record<string, boolean>>({});

  const fields = addon.setupFields ?? [];
  const allFilled = fields.every(f => (values[f.key] ?? '').trim() !== '');

  const handleConfirm = () => {
    const url = addon.setupTemplate ? buildUrl(addon.setupTemplate, values) : addon.url;
    onConfirm(url, addon.name);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-300 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="mb-5">
          <h2 className="text-lg font-semibold text-gray-100">{addon.name}</h2>
          <p className="text-sm text-gray-500 mt-1">{addon.description}</p>
        </div>

        <div className="space-y-4">
          {fields.map(f => (
            <div key={f.key}>
              <label className="label">{f.label}</label>
              <div className="relative">
                <input
                  className="input pr-10"
                  type={f.type === 'password' && !showPwd[f.key] ? 'password' : 'text'}
                  placeholder={f.hint ?? ''}
                  value={values[f.key] ?? ''}
                  onChange={e => setValues(v => ({ ...v, [f.key]: e.target.value }))}
                />
                {f.type === 'password' && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                    onClick={() => setShowPwd(s => ({ ...s, [f.key]: !s[f.key] }))}
                  >
                    {showPwd[f.key] ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                )}
              </div>
              {f.hint && (
                <p className="text-xs text-gray-600 mt-1">{f.hint}</p>
              )}
            </div>
          ))}
        </div>

        {addon.configureUrl && (
          <a
            href={addon.configureUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 mt-4 transition-colors"
          >
            <ExternalLink size={12} />
            Open official configure page
          </a>
        )}

        <div className="flex gap-3 mt-6">
          <button className="btn-secondary flex-1" onClick={onClose}>Cancel</button>
          <button
            className="btn-primary flex-1"
            onClick={handleConfirm}
            disabled={!allFilled}
          >
            Add addon
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

interface Props {
  addons: AddonConfig[];
  onChange: (addons: AddonConfig[]) => void;
}

type Tab = 'my-addons' | 'marketplace';

export default function AddonManager({ addons, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('my-addons');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [activeCategory, setActiveCategory] = useState<MarketplaceCategory | 'all'>('all');
  const [setupAddon, setSetupAddon] = useState<MarketplaceAddon | null>(null);

  const testMutation = useMutation({
    mutationFn: (url: string) => api.testAddon(url),
  });

  const { data: marketplace } = useQuery({
    queryKey: ['marketplace'],
    queryFn: api.getMarketplace,
    staleTime: Infinity,
  });

  // Filtered marketplace list
  const visibleAddons = (marketplace ?? []).filter(
    m => activeCategory === 'all' || m.category === activeCategory,
  );

  // ─── Handlers ──────────────────────────────────────────────────────────────

  const handleTestAndAdd = async () => {
    if (!customUrl.trim()) return;
    try {
      const result = await testMutation.mutateAsync(customUrl.trim());
      addAddon({ id: crypto.randomUUID(), name: customName.trim() || result.name, url: customUrl.trim(), enabled: true });
      setCustomUrl('');
      setCustomName('');
    } catch { /* error shown in UI */ }
  };

  const handleMarketplaceAdd = (m: MarketplaceAddon) => {
    if (addons.some(a => a.url === m.url && m.url !== '')) return;
    if (m.setupFields && m.setupFields.length > 0) {
      setSetupAddon(m);
    } else {
      addAddon({ id: crypto.randomUUID(), name: m.name, url: m.url, enabled: true });
    }
  };

  const handleSetupConfirm = (url: string, name: string) => {
    addAddon({ id: crypto.randomUUID(), name, url, enabled: true });
    setSetupAddon(null);
  };

  const addAddon = (a: AddonConfig) => onChange([...addons, a]);
  const removeAddon = (id: string) => onChange(addons.filter(a => a.id !== id));
  const toggleAddon = (id: string) =>
    onChange(addons.map(a => a.id === id ? { ...a, enabled: !a.enabled } : a));

  const moveAddon = (id: string, dir: 'up' | 'down') => {
    const idx = addons.findIndex(a => a.id === id);
    if (idx < 0) return;
    const newIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= addons.length) return;
    const arr = [...addons];
    [arr[idx], arr[newIdx]] = [arr[newIdx], arr[idx]];
    onChange(arr);
  };

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">
      {/* Setup dialog */}
      {setupAddon && (
        <SetupDialog
          addon={setupAddon}
          onConfirm={handleSetupConfirm}
          onClose={() => setSetupAddon(null)}
        />
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-gray-900 rounded-lg border border-gray-800 w-fit">
        {([['my-addons', 'My Addons', Link2], ['marketplace', 'Marketplace', Store]] as const).map(([id, label, Icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              tab === id ? 'bg-gray-800 text-gray-100' : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            <Icon size={14} />
            {label}
            {id === 'my-addons' && addons.length > 0 && (
              <span className="ml-0.5 text-xs bg-gray-700 text-gray-400 rounded-full px-1.5 py-0.5">
                {addons.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── My Addons tab ─────────────────────────────────────────────────────── */}
      {tab === 'my-addons' && (
        <div className="space-y-4">
          {/* Add by URL */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Add addon by URL</h3>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <input
                  className="input"
                  placeholder="https://torrentio.strem.fun/realdebrid=…"
                  value={customUrl}
                  onChange={e => setCustomUrl(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTestAndAdd()}
                />
                <input
                  className="input"
                  placeholder="Custom name (auto-detected if left empty)"
                  value={customName}
                  onChange={e => setCustomName(e.target.value)}
                />
              </div>
              <button
                className="btn-primary self-start"
                onClick={handleTestAndAdd}
                disabled={!customUrl.trim() || testMutation.isPending}
              >
                {testMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Add
              </button>
            </div>

            {testMutation.isError && (
              <div className="flex items-center gap-2 text-xs text-red-400">
                <XCircle size={14} />
                {(testMutation.error as Error).message}
              </div>
            )}
            {testMutation.isSuccess && (
              <div className="flex items-center gap-2 text-xs text-emerald-400">
                <CheckCircle2 size={14} />
                Addon verified: {testMutation.data.name} v{testMutation.data.version}
              </div>
            )}
          </div>

          {/* Addon list */}
          {addons.length === 0 ? (
            <div className="card text-center py-10 text-gray-600">
              <Plus className="mx-auto mb-2 opacity-30" size={24} />
              <p className="text-sm">No addons yet. Add one above or browse the Marketplace.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((a, i) => (
                <div
                  key={a.id}
                  className={`card flex items-center gap-3 py-3 transition-opacity ${a.enabled ? '' : 'opacity-50'}`}
                >
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button className="btn-ghost p-0.5" onClick={() => moveAddon(a.id, 'up')} disabled={i === 0}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="btn-ghost p-0.5" onClick={() => moveAddon(a.id, 'down')} disabled={i === addons.length - 1}>
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-200 truncate">{a.name}</div>
                    <div className="text-xs text-gray-500 truncate font-mono">{a.url}</div>
                  </div>

                  <button onClick={() => toggleAddon(a.id)} className="text-gray-500 hover:text-gray-300 transition-colors shrink-0">
                    {a.enabled
                      ? <ToggleRight size={22} className="text-brand-400" />
                      : <ToggleLeft size={22} />}
                  </button>

                  <button className="btn-danger p-1.5 shrink-0" onClick={() => removeAddon(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── Marketplace tab ───────────────────────────────────────────────────── */}
      {tab === 'marketplace' && (
        <div className="space-y-4">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  activeCategory === cat.id
                    ? 'bg-brand-900/60 text-brand-300 border-brand-700'
                    : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
                }`}
              >
                {cat.emoji} {cat.label}
                {cat.id !== 'all' && marketplace && (
                  <span className="ml-1 opacity-60">
                    {marketplace.filter(m => m.category === cat.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Addon cards */}
          {!marketplace && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-400" size={24} />
            </div>
          )}

          {marketplace && visibleAddons.length === 0 && (
            <div className="card text-center py-10 text-gray-600 text-sm">
              No addons in this category yet.
            </div>
          )}

          <div className="space-y-2">
            {visibleAddons.map(m => {
              const isAdded = m.url !== ''
                ? addons.some(a => a.url === m.url)
                : addons.some(a => a.name === m.name);
              const hasSetup = (m.setupFields?.length ?? 0) > 0;
              const categoryMeta = CATEGORIES.find(c => c.id === m.category);

              return (
                <div key={m.id} className="card flex items-start gap-4 hover:border-gray-700 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center flex-wrap gap-1.5 mb-1">
                      <span className="font-medium text-sm text-gray-100">{m.name}</span>
                      {categoryMeta && categoryMeta.id !== 'all' && (
                        <span className="badge-gray text-xs">{categoryMeta.emoji} {categoryMeta.label}</span>
                      )}
                      {m.requiresDebrid && (
                        <span className="badge-indigo text-xs">💎 debrid</span>
                      )}
                      {hasSetup && (
                        <span className="badge bg-amber-900/40 text-amber-400 border border-amber-800/50 text-xs">
                          <Settings size={10} className="mr-1" />setup
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">{m.description}</p>
                    {m.configureUrl && !hasSetup && (
                      <a
                        href={m.configureUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-brand-400 hover:text-brand-300 mt-1.5 transition-colors"
                      >
                        <ExternalLink size={10} />
                        Configure externally
                      </a>
                    )}
                  </div>

                  <button
                    onClick={() => handleMarketplaceAdd(m)}
                    disabled={isAdded}
                    className={`shrink-0 ${isAdded ? 'btn-secondary opacity-50 cursor-default' : 'btn-primary'}`}
                  >
                    {isAdded ? (
                      <><CheckCircle2 size={14} /> Added</>
                    ) : hasSetup ? (
                      <><Settings size={14} /> Setup</>
                    ) : (
                      <><Plus size={14} /> Add</>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
