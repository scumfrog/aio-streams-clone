import type { FilterConfig, Resolution, Quality, Codec } from '../lib/types';

const RESOLUTIONS: Resolution[] = ['4K', '1080p', '720p', '480p', '360p'];
const QUALITIES: Quality[] = ['BluRay', 'WEB-DL', 'WEBRip', 'BDRip', 'HDRip', 'HDTV', 'CAM'];
const CODECS: Codec[] = ['x265', 'x264', 'AV1', 'XviD'];
const LANGUAGES = [
  { code: 'en', label: '🇺🇸 English' },
  { code: 'es', label: '🇪🇸 Spanish' },
  { code: 'fr', label: '🇫🇷 French' },
  { code: 'de', label: '🇩🇪 German' },
  { code: 'it', label: '🇮🇹 Italian' },
  { code: 'pt', label: '🇧🇷 Portuguese' },
  { code: 'ja', label: '🇯🇵 Japanese' },
  { code: 'ko', label: '🇰🇷 Korean' },
  { code: 'zh', label: '🇨🇳 Chinese' },
  { code: 'ru', label: '🇷🇺 Russian' },
];

interface Props {
  filters: FilterConfig;
  onChange: (f: FilterConfig) => void;
}

export default function FilterPanel({ filters, onChange }: Props) {
  const update = <K extends keyof FilterConfig>(key: K, value: FilterConfig[K]) =>
    onChange({ ...filters, [key]: value });

  const toggleSet = <T extends string>(current: T[] | undefined, value: T): T[] => {
    const arr = current ?? [];
    return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value];
  };

  return (
    <div className="space-y-6">
      {/* Resolutions */}
      <Section title="Allowed resolutions" hint="Leave empty to allow all">
        <div className="flex flex-wrap gap-2">
          {RESOLUTIONS.map(r => (
            <Toggle
              key={r}
              active={(filters.resolutions ?? []).includes(r)}
              onClick={() => update('resolutions', toggleSet(filters.resolutions, r))}
            >
              {r}
            </Toggle>
          ))}
        </div>
      </Section>

      {/* Minimum resolution */}
      <Section title="Minimum resolution" hint="Exclude anything below this threshold">
        <div className="flex flex-wrap gap-2">
          {[undefined, ...RESOLUTIONS].map(r => (
            <Toggle
              key={r ?? 'any'}
              active={filters.minResolution === r}
              onClick={() => update('minResolution', r)}
            >
              {r ?? 'Any'}
            </Toggle>
          ))}
        </div>
      </Section>

      {/* Qualities */}
      <Section title="Allowed qualities" hint="Leave empty to allow all">
        <div className="flex flex-wrap gap-2">
          {QUALITIES.map(q => (
            <Toggle
              key={q}
              active={(filters.qualities ?? []).includes(q)}
              onClick={() => update('qualities', toggleSet(filters.qualities, q))}
            >
              {q}
            </Toggle>
          ))}
        </div>
      </Section>

      {/* Excluded codecs */}
      <Section title="Excluded codecs">
        <div className="flex flex-wrap gap-2">
          {CODECS.map(c => (
            <Toggle
              key={c}
              active={(filters.excludeCodecs ?? []).includes(c)}
              danger
              onClick={() => update('excludeCodecs', toggleSet(filters.excludeCodecs, c))}
            >
              {c}
            </Toggle>
          ))}
        </div>
      </Section>

      {/* Numeric filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Max file size (GB)">
          <input
            type="number"
            className="input"
            placeholder="No limit"
            min={0}
            value={filters.maxSizeGb ?? ''}
            onChange={e => update('maxSizeGb', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Section>

        <Section title="Min seeders">
          <input
            type="number"
            className="input"
            placeholder="No minimum"
            min={0}
            value={filters.minSeeders ?? ''}
            onChange={e => update('minSeeders', e.target.value ? Number(e.target.value) : undefined)}
          />
        </Section>
      </div>

      {/* Cached streams */}
      <Section title="Debrid cache">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-brand-500 accent-brand-500"
            checked={filters.requireCached ?? false}
            onChange={e => update('requireCached', e.target.checked || undefined)}
          />
          <span className="text-sm text-gray-300">Only show debrid-cached streams</span>
        </label>
      </Section>

      {/* Languages */}
      <Section title="Required languages" hint="If set, streams must include at least one">
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(({ code, label }) => (
            <Toggle
              key={code}
              active={(filters.languages ?? []).includes(code)}
              onClick={() => update('languages', toggleSet(filters.languages, code))}
            >
              {label}
            </Toggle>
          ))}
        </div>
      </Section>

      {/* Keywords */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Section title="Exclude keywords" hint="Comma-separated">
          <KeywordInput
            value={filters.excludeKeywords ?? []}
            onChange={v => update('excludeKeywords', v.length ? v : undefined)}
            placeholder="e.g. HDCAM, DVDSCR"
          />
        </Section>
        <Section title="Include keywords" hint="Stream must match at least one">
          <KeywordInput
            value={filters.includeKeywords ?? []}
            onChange={v => update('includeKeywords', v.length ? v : undefined)}
            placeholder="e.g. REMUX, Atmos"
          />
        </Section>
      </div>
    </div>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-2">
        <span className="text-sm font-medium text-gray-300">{title}</span>
        {hint && <span className="text-xs text-gray-600 ml-2">({hint})</span>}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  children,
  active,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
        active
          ? danger
            ? 'bg-red-900/50 text-red-300 border-red-700'
            : 'bg-brand-900/60 text-brand-300 border-brand-700'
          : 'bg-gray-900 text-gray-500 border-gray-700 hover:border-gray-600 hover:text-gray-300'
      }`}
    >
      {children}
    </button>
  );
}

function KeywordInput({ value, onChange, placeholder }: {
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const text = value.join(', ');
  return (
    <input
      className="input"
      placeholder={placeholder}
      value={text}
      onChange={e => onChange(
        e.target.value.split(',').map(s => s.trim()).filter(Boolean)
      )}
    />
  );
}
