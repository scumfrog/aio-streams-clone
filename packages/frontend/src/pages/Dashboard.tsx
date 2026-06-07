import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, BarChart3, Activity, Zap, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../lib/api';
import type { AddonStat } from '../lib/types';

export default function Dashboard() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();

  const { data: stats, isLoading, error } = useQuery({
    queryKey: ['stats', userId],
    queryFn: () => api.getStats(userId!),
    enabled: !!userId,
    refetchInterval: 30_000,
  });

  const { data: row } = useQuery({
    queryKey: ['config', userId],
    queryFn: () => api.getConfig(userId!),
    enabled: !!userId,
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(`/configure?userId=${userId}`)} className="btn-ghost">
            <ChevronLeft size={16} />
            Configure
          </button>
          <span className="text-sm font-medium text-gray-300">
            <BarChart3 size={14} className="inline mr-2 text-brand-400" />
            {row?.config.name ?? 'Analytics'} · Last 7 days
          </span>
          <div className="w-24" />
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        {isLoading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="animate-spin text-brand-400" size={28} />
          </div>
        )}

        {error && (
          <div className="card text-center py-10 text-gray-500">
            <AlertTriangle className="mx-auto mb-3 text-amber-500" size={24} />
            <p>Could not load analytics. Stats require a PostgreSQL database.</p>
          </div>
        )}

        {stats && stats.length === 0 && (
          <div className="card text-center py-10 text-gray-500">
            <Activity className="mx-auto mb-3 opacity-30" size={28} />
            <p>No data yet. Install the addon in Stremio and search for something!</p>
          </div>
        )}

        {stats && stats.length > 0 && (
          <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <StatCard
                icon={<Activity size={18} className="text-brand-400" />}
                label="Total requests"
                value={stats.reduce((s, a) => s + a.requests, 0).toLocaleString()}
              />
              <StatCard
                icon={<Zap size={18} className="text-emerald-400" />}
                label="Avg streams"
                value={
                  stats.length
                    ? Math.round(stats.reduce((s, a) => s + a.avg_streams, 0) / stats.length)
                    : 0
                }
              />
              <StatCard
                icon={<BarChart3 size={18} className="text-blue-400" />}
                label="Active addons"
                value={stats.length}
              />
              <StatCard
                icon={<AlertTriangle size={18} className="text-amber-400" />}
                label="Avg error rate"
                value={`${
                  stats.length
                    ? (stats.reduce((s, a) => s + a.error_rate, 0) / stats.length).toFixed(1)
                    : 0
                }%`}
              />
            </div>

            {/* Per-addon table */}
            <div className="card overflow-hidden p-0">
              <div className="px-5 py-4 border-b border-gray-800">
                <h2 className="font-semibold text-gray-200">Addon performance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-800">
                      <th className="px-5 py-3">Addon</th>
                      <th className="px-5 py-3 text-right">Requests</th>
                      <th className="px-5 py-3 text-right">Avg streams</th>
                      <th className="px-5 py-3 text-right">Avg latency</th>
                      <th className="px-5 py-3 text-right">Error rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(stats as AddonStat[]).map((a) => (
                      <tr key={a.addon_id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                        <td className="px-5 py-3 font-medium text-gray-200">{a.addon_name}</td>
                        <td className="px-5 py-3 text-right text-gray-400">{a.requests.toLocaleString()}</td>
                        <td className="px-5 py-3 text-right">
                          <span className={a.avg_streams > 0 ? 'text-emerald-400' : 'text-gray-600'}>
                            {a.avg_streams}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right text-gray-400">{a.avg_duration_ms}ms</td>
                        <td className="px-5 py-3 text-right">
                          <span className={a.error_rate > 10 ? 'text-red-400' : a.error_rate > 2 ? 'text-amber-400' : 'text-gray-500'}>
                            {a.error_rate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) {
  return (
    <div className="card">
      <div className="mb-3">{icon}</div>
      <div className="text-2xl font-bold text-gray-100">{value}</div>
      <div className="text-xs text-gray-500 mt-0.5">{label}</div>
    </div>
  );
}
