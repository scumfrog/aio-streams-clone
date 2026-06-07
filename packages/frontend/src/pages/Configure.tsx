import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  ChevronLeft, ChevronRight, Check, Copy, ExternalLink, BarChart3,
  Layers, Filter, ArrowUpDown, Download, Loader2, Info, X,
} from 'lucide-react';
import { api, buildInstallUrl, buildManifestUrl } from '../lib/api';
import type { UserConfig, AddonConfig, FilterConfig, SortConfig, SortCriterion } from '../lib/types';
import AddonManager from '../components/AddonManager';
import FilterPanel from '../components/FilterPanel';
import SortPanel from '../components/SortPanel';
import QuickStart from '../components/QuickStart';

// ─── Step definitions ─────────────────────────────────────────────────────────

const STEPS = [
  { id: 'addons', label: 'Addons', icon: Layers },
  { id: 'filters', label: 'Filters', icon: Filter },
  { id: 'sorting', label: 'Sorting', icon: ArrowUpDown },
  { id: 'install', label: 'Install', icon: Download },
] as const;

type StepId = typeof STEPS[number]['id'];

// ─── Default config ───────────────────────────────────────────────────────────

const DEFAULT_CONFIG: UserConfig = {
  name: '',
  addons: [],
  filters: {},
  sorting: { criteria: ['cached_first', 'resolution_desc', 'quality_desc', 'seeders_desc'] },
  maxResults: 50,
};

// ─── Configure page ───────────────────────────────────────────────────────────

export default function Configure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const userId = searchParams.get('userId');

  const [step, setStep] = useState<StepId>('addons');
  const [config, setConfig] = useState<UserConfig>(DEFAULT_CONFIG);
  const [savedId, setSavedId] = useState<string | null>(userId);
  const [copied, setCopied] = useState<'install' | 'manifest' | null>(null);
  const [showQuickStart, setShowQuickStart] = useState(!userId);
  const [presetTip, setPresetTip] = useState<string | null>(null);

  // Load existing config if editing
  const { isLoading, data: existingRow } = useQuery({
    queryKey: ['config', userId],
    queryFn: () => api.getConfig(userId!),
    enabled: !!userId,
  });

  useEffect(() => {
    if (existingRow) {
      setConfig(existingRow.config);
      setSavedId(existingRow.id);
    }
  }, [existingRow]);

  const saveMutation = useMutation({
    mutationFn: () =>
      savedId
        ? api.updateConfig(savedId, config)
        : api.createConfig(config),
    onSuccess: (row) => {
      setSavedId(row.id);
    },
  });

  const currentStepIndex = STEPS.findIndex(s => s.id === step);

  const goNext = useCallback(async () => {
    if (step === 'sorting') {
      // Save before going to install step
      const row = await saveMutation.mutateAsync();
      setSavedId(row.id);
      setStep('install');
    } else {
      const nextStep = STEPS[currentStepIndex + 1];
      if (nextStep) setStep(nextStep.id);
    }
  }, [step, currentStepIndex, saveMutation]);

  const goPrev = useCallback(() => {
    const prevStep = STEPS[currentStepIndex - 1];
    if (prevStep) setStep(prevStep.id);
  }, [currentStepIndex]);

  const handlePresetApply = (
    addons: AddonConfig[],
    filters: FilterConfig,
    sorting: SortConfig,
    maxResults: number,
    tip?: string,
  ) => {
    setConfig(c => ({ ...c, addons, filters, sorting, maxResults }));
    setShowQuickStart(false);
    if (tip) setPresetTip(tip);
  };

  const copyToClipboard = async (text: string, type: 'install' | 'manifest') => {
    await navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-brand-400" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="btn-ghost">
            <ChevronLeft size={16} />
            Home
          </button>
          <span className="text-sm font-medium text-gray-300">
            {config.name || 'New Configuration'}
          </span>
          {savedId && (
            <button
              onClick={() => navigate(`/dashboard/${savedId}`)}
              className="btn-ghost text-xs"
            >
              <BarChart3 size={14} />
              Analytics
            </button>
          )}
        </div>
      </header>

      {/* Stepper */}
      <div className="border-b border-gray-800">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((s, i) => {
              const Icon = s.icon;
              const isActive = s.id === step;
              const isDone = STEPS.findIndex(x => x.id === step) > i;
              return (
                <div key={s.id} className="flex items-center flex-1">
                  <button
                    onClick={() => isDone ? setStep(s.id) : undefined}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                      isActive ? 'text-brand-400' :
                      isDone ? 'text-gray-400 cursor-pointer hover:text-gray-200' :
                      'text-gray-600 cursor-default'
                    }`}
                  >
                    <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full border text-xs ${
                      isActive ? 'border-brand-500 bg-brand-900/50 text-brand-300' :
                      isDone ? 'border-gray-600 bg-gray-800 text-gray-400' :
                      'border-gray-700 text-gray-600'
                    }`}>
                      {isDone ? <Check size={12} /> : <Icon size={12} />}
                    </span>
                    <span className="hidden sm:block">{s.label}</span>
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-px mx-3 ${isDone ? 'bg-gray-700' : 'bg-gray-800'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-8">
        {/* Config name (always visible) */}
        {step !== 'install' && (
          <div className="mb-6">
            <label className="label">Configuration name (optional)</label>
            <input
              className="input max-w-xs"
              placeholder="e.g. My 4K setup"
              value={config.name ?? ''}
              onChange={e => setConfig(c => ({ ...c, name: e.target.value }))}
            />
          </div>
        )}

        {step === 'addons' && (
          <>
            {showQuickStart && (
              <QuickStart
                onApply={handlePresetApply}
                onSkip={() => setShowQuickStart(false)}
              />
            )}
            {presetTip && (
              <div className="flex items-start gap-3 px-4 py-3 bg-brand-900/30 border border-brand-800/50 rounded-xl mb-5 text-sm text-brand-200">
                <Info size={15} className="shrink-0 mt-0.5 text-brand-400" />
                <span className="flex-1">{presetTip}</span>
                <button
                  onClick={() => setPresetTip(null)}
                  className="shrink-0 text-brand-500 hover:text-brand-300 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            )}
            <AddonManager
              addons={config.addons}
              onChange={addons => setConfig(c => ({ ...c, addons }))}
            />
          </>
        )}

        {step === 'filters' && (
          <FilterPanel
            filters={config.filters}
            onChange={filters => setConfig(c => ({ ...c, filters }))}
          />
        )}

        {step === 'sorting' && (
          <SortPanel
            sorting={config.sorting}
            onChange={sorting => setConfig(c => ({ ...c, sorting }))}
          />
        )}

        {step === 'install' && savedId && (
          <InstallStep
            userId={savedId}
            config={config}
            copied={copied}
            onCopy={copyToClipboard}
            onEdit={() => setStep('addons')}
          />
        )}

        {step === 'install' && !savedId && (
          <div className="card text-center py-12 text-gray-500">
            <Loader2 className="animate-spin mx-auto mb-3 text-brand-400" size={24} />
            Saving configuration…
          </div>
        )}
      </main>

      {/* Footer nav */}
      {step !== 'install' && (
        <footer className="border-t border-gray-800 bg-gray-900/50">
          <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
            <button
              className="btn-secondary"
              onClick={goPrev}
              disabled={currentStepIndex === 0}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            <span className="text-xs text-gray-600">
              Step {currentStepIndex + 1} of {STEPS.length}
            </span>

            <button
              className="btn-primary"
              onClick={goNext}
              disabled={saveMutation.isPending}
            >
              {saveMutation.isPending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : step === 'sorting' ? (
                'Save & Install'
              ) : (
                <>Next <ChevronRight size={16} /></>
              )}
            </button>
          </div>
        </footer>
      )}
    </div>
  );
}

// ─── Install step ─────────────────────────────────────────────────────────────

function InstallStep({
  userId,
  config,
  copied,
  onCopy,
  onEdit,
}: {
  userId: string;
  config: UserConfig;
  copied: 'install' | 'manifest' | null;
  onCopy: (text: string, type: 'install' | 'manifest') => void;
  onEdit: () => void;
}) {
  const installUrl = buildInstallUrl(userId);
  const manifestUrl = buildManifestUrl(userId);

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-100 mb-1">Your config is ready!</h2>
        <p className="text-sm text-gray-400 mb-5">
          Install the addon in Stremio by clicking the button below, or copy the manifest URL
          to add it manually.
        </p>

        <div className="space-y-4">
          {/* Install button */}
          <a
            href={installUrl}
            className="btn-primary w-full justify-center text-base py-3"
          >
            <ExternalLink size={18} />
            Install in Stremio
          </a>

          {/* Manifest URL */}
          <div>
            <label className="label">Manifest URL</label>
            <div className="flex gap-2">
              <input className="input font-mono text-xs" readOnly value={manifestUrl} />
              <button
                className="btn-secondary shrink-0"
                onClick={() => onCopy(manifestUrl, 'manifest')}
              >
                {copied === 'manifest' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>

          {/* Stremio protocol URL */}
          <div>
            <label className="label">Stremio install URL</label>
            <div className="flex gap-2">
              <input className="input font-mono text-xs" readOnly value={installUrl} />
              <button
                className="btn-secondary shrink-0"
                onClick={() => onCopy(installUrl, 'install')}
              >
                {copied === 'install' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-300 mb-3">Configuration summary</h3>
        <dl className="space-y-2 text-sm">
          <Row label="Name" value={config.name || '—'} />
          <Row label="Enabled addons" value={config.addons.filter(a => a.enabled).length} />
          <Row label="Max results" value={config.maxResults ?? 50} />
          <Row label="Cached only" value={config.filters?.requireCached ? 'Yes' : 'No'} />
          <Row label="Min resolution" value={config.filters?.minResolution ?? 'Any'} />
          <Row label="Sort order" value={(config.sorting?.criteria ?? []).join(' → ')} />
        </dl>
      </div>

      <div className="flex gap-3">
        <button className="btn-secondary flex-1" onClick={onEdit}>
          Edit configuration
        </button>
        <a href="/configure" className="btn-ghost">
          New config
        </a>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex justify-between">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-gray-200 font-medium text-right max-w-xs truncate">{String(value)}</dd>
    </div>
  );
}
