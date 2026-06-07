import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  Plus, Trash2, ChevronUp, ChevronDown, ToggleLeft, ToggleRight,
  Search, CheckCircle2, XCircle, Loader2, Store, Link2
} from 'lucide-react';
import { api } from '../lib/api';
import type { AddonConfig, MarketplaceAddon } from '../lib/types';

interface Props {
  addons: AddonConfig[];
  onChange: (addons: AddonConfig[]) => void;
}

type Tab = 'my-addons' | 'marketplace';

export default function AddonManager({ addons, onChange }: Props) {
  const [tab, setTab] = useState<Tab>('my-addons');
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');

  const testMutation = useMutation({
    mutationFn: (url: string) => api.testAddon(url),
  });

  const { data: marketplace } = useQuery({
    queryKey: ['marketplace'],
    queryFn: api.getMarketplace,
    staleTime: Infinity,
  });

  const handleTestAndAdd = async () => {
    if (!customUrl.trim()) return;
    try {
      const result = await testMutation.mutateAsync(customUrl.trim());
      addAddon({
        id: crypto.randomUUID(),
        name: customName.trim() || result.name,
        url: customUrl.trim(),
        enabled: true,
      });
      setCustomUrl('');
      setCustomName('');
    } catch {
      // error shown in UI
    }
  };

  const addFromMarketplace = (m: MarketplaceAddon) => {
    if (addons.find(a => a.url === m.url)) return;
    addAddon({ id: crypto.randomUUID(), name: m.name, url: m.url, enabled: true });
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

  return (
    <div className="space-y-5">
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
          </button>
        ))}
      </div>

      {/* My Addons */}
      {tab === 'my-addons' && (
        <div className="space-y-4">
          {/* Add custom */}
          <div className="card space-y-3">
            <h3 className="text-sm font-semibold text-gray-300">Add addon by URL</h3>
            <div className="flex gap-2">
              <div className="flex-1 space-y-2">
                <input
                  className="input"
                  placeholder="https://torrentio.strem.fun/…"
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
                {testMutation.isPending ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}
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
              <p className="text-sm">No addons yet. Add one above or browse the marketplace.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {addons.map((a, i) => (
                <div
                  key={a.id}
                  className={`card flex items-center gap-3 py-3 transition-opacity ${
                    a.enabled ? 'opacity-100' : 'opacity-50'
                  }`}
                >
                  {/* Reorder */}
                  <div className="flex flex-col gap-0.5">
                    <button className="btn-ghost p-0.5" onClick={() => moveAddon(a.id, 'up')} disabled={i === 0}>
                      <ChevronUp size={14} />
                    </button>
                    <button className="btn-ghost p-0.5" onClick={() => moveAddon(a.id, 'down')} disabled={i === addons.length - 1}>
                      <ChevronDown size={14} />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-200 truncate">{a.name}</div>
                    <div className="text-xs text-gray-500 truncate font-mono">{a.url}</div>
                  </div>

                  {/* Toggle */}
                  <button onClick={() => toggleAddon(a.id)} className="text-gray-500 hover:text-gray-300 transition-colors">
                    {a.enabled ? (
                      <ToggleRight size={22} className="text-brand-400" />
                    ) : (
                      <ToggleLeft size={22} />
                    )}
                  </button>

                  {/* Remove */}
                  <button className="btn-danger p-1.5" onClick={() => removeAddon(a.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Marketplace */}
      {tab === 'marketplace' && (
        <div className="space-y-3">
          {!marketplace && (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-brand-400" size={24} />
            </div>
          )}
          {marketplace?.map(m => {
            const isAdded = addons.some(a => a.url === m.url);
            return (
              <div key={m.id} className="card flex items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-medium text-gray-200">{m.name}</span>
                    {m.tags.map(t => (
                      <span key={t} className="badge-gray text-xs">{t}</span>
                    ))}
                    {m.requiresDebrid && (
                      <span className="badge-indigo text-xs">debrid</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{m.description}</p>
                </div>
                <button
                  onClick={() => addFromMarketplace(m)}
                  disabled={isAdded}
                  className={isAdded ? 'btn-secondary opacity-50 cursor-default' : 'btn-primary shrink-0'}
                >
                  {isAdded ? (
                    <><CheckCircle2 size={14} /> Added</>
                  ) : (
                    <><Plus size={14} /> Add</>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
