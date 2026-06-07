import { useNavigate } from 'react-router-dom';
import { Zap, Filter, ArrowUpDown, Shield, Layers, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Layers,
    title: '80+ Addons',
    description: 'Aggregate streams from any Stremio addon via URL. Built-in marketplace with the most popular sources.',
  },
  {
    icon: Filter,
    title: 'Advanced Filtering',
    description: 'Filter by resolution, quality, codec, size, seeders, cached status, language, and custom keywords.',
  },
  {
    icon: ArrowUpDown,
    title: 'Smart Sorting',
    description: 'Sort by resolution, quality, file size, seeders or debrid cache. Chain multiple criteria.',
  },
  {
    icon: Shield,
    title: 'Debrid Ready',
    description: 'Configure Real-Debrid, AllDebrid, Premiumize, or TorBox once—applied across all addons.',
  },
  {
    icon: Zap,
    title: 'Fast & Cached',
    description: 'Results cached in PostgreSQL. Stream lookups return in milliseconds after first hit.',
  },
  {
    icon: BarChart3,
    title: 'Analytics',
    description: 'See which addons deliver the most streams, their speed, and error rates over 7 days.',
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero */}
      <header className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center">
        <div className="mb-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-900/60 border border-brand-800/50 text-brand-300 text-xs font-medium">
          <Zap size={12} className="text-brand-400" />
          One addon to rule them all
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-4">
          <span className="text-white">AIO</span>
          <span className="text-brand-400">Streams</span>
          <span className="text-gray-500 text-3xl sm:text-4xl font-normal ml-3">Clone</span>
        </h1>

        <p className="max-w-lg text-gray-400 text-lg mb-10">
          Aggregate every Stremio addon into a single super-addon. Filter, sort, deduplicate
          and cache streams—all from one configuration page.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <button className="btn-primary text-base px-6 py-3" onClick={() => navigate('/configure')}>
            Create your config
          </button>
          <a
            href="https://github.com/Viren070/AIOStreams"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary text-base px-6 py-3"
          >
            View original project
          </a>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-5xl mx-auto w-full px-4 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="card hover:border-gray-700 transition-colors">
              <div className="mb-3 inline-flex p-2 rounded-lg bg-brand-900/40 text-brand-400">
                <Icon size={18} />
              </div>
              <h3 className="font-semibold text-gray-100 mb-1">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-gray-600 pb-8">
        Improved clone of{' '}
        <a href="https://github.com/Viren070/AIOStreams" className="text-gray-500 hover:text-gray-400 underline">
          AIOStreams by Viren070
        </a>{' '}
        · MIT &amp; GPLv3
      </footer>
    </div>
  );
}
