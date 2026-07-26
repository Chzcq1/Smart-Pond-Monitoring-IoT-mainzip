import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useDashboardSummary } from '../hooks/useSimulatedData';
import FactoryCard from '../components/dashboard/FactoryCard';
import StatusBadge from '../components/common/StatusBadge';
import type { Station } from '../types';
import {
  Activity, AlertTriangle, CheckCircle, Factory, ShieldAlert, Droplets, ChevronRight,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n/I18nContext';
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';

// Static 12-month trend data (mock visualization)
const TREND_DATA = [
  { month: 'ส.ค.', alerts: 3, resolved: 2 },
  { month: 'ก.ย.', alerts: 5, resolved: 4 },
  { month: 'ต.ค.', alerts: 4, resolved: 4 },
  { month: 'พ.ย.', alerts: 6, resolved: 5 },
  { month: 'ธ.ค.', alerts: 3, resolved: 3 },
  { month: 'ม.ค.', alerts: 7, resolved: 5 },
  { month: 'ก.พ.', alerts: 4, resolved: 4 },
  { month: 'มี.ค.', alerts: 5, resolved: 4 },
  { month: 'เม.ย.', alerts: 8, resolved: 6 },
  { month: 'พ.ค.', alerts: 6, resolved: 6 },
  { month: 'มิ.ย.', alerts: 4, resolved: 3 },
  { month: 'ก.ค.', alerts: 9, resolved: 5 },
];

const PIE_COLORS: Record<string, string> = {
  online:   '#10b981',
  warning:  '#f59e0b',
  critical: '#f43f5e',
  offline:  '#94a3b8',
};

export default function OverviewPage() {
  const { factories, stations } = useData();
  const { t } = useI18n();
  const summary = useDashboardSummary(stations);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | 'all'>('all');

  const filteredStations = useMemo(() => {
    if (selectedFactoryId === 'all') return stations;
    return stations.filter(s => s.factoryId === selectedFactoryId);
  }, [stations, selectedFactoryId]);

  const pieData = useMemo(() => [
    { name: t('common.online'),   value: summary.online,   key: 'online' },
    { name: t('common.warning'),  value: summary.warning,  key: 'warning' },
    { name: t('common.critical'), value: summary.critical, key: 'critical' },
    { name: t('common.offline'),  value: summary.offline,  key: 'offline' },
  ].filter(d => d.value > 0), [summary, t]);

  const overdueCount = stations.filter(s => s.maintenance?.status === 'overdue').length;

  return (
    <div className="flex-1 overflow-y-auto scrollbar-thin">
      {/* Greeting banner */}
      <div className="bg-teal-600 dark:bg-teal-800 px-6 py-5 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Droplets className="w-6 h-6" />
              {t('overview.title')} 👋
            </h1>
            <p className="text-teal-100 text-sm mt-1">
              {format(new Date(), 'dd MMMM yyyy • HH:mm')} — {t('overview.description')}
            </p>
          </div>
          {overdueCount > 0 && (
            <div className="bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl">
              {t('maintenance.overdue')}: {overdueCount} {t('maintenance.actionRequired')}
            </div>
          )}
        </div>
      </div>

      <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title={t('overview.totalFactories')} value={factories.length}  icon={Factory}     color="text-gray-700 dark:text-slate-300"   iconBg="bg-gray-100 dark:bg-slate-800" />
          <StatCard title={t('overview.onlineDevices')}  value={summary.online}   icon={CheckCircle} color="text-emerald-600 dark:text-emerald-400" iconBg="bg-emerald-50 dark:bg-emerald-500/10" />
          <StatCard title={t('overview.warningDevices')} value={summary.warning}  icon={AlertTriangle} color="text-amber-600 dark:text-amber-400" iconBg="bg-amber-50 dark:bg-amber-500/10" />
          <StatCard title={t('overview.criticalDevices')} value={summary.critical} icon={ShieldAlert} color="text-rose-600 dark:text-rose-400"  iconBg="bg-rose-50 dark:bg-rose-500/10" pulse={summary.critical > 0} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trend Line Chart */}
          <div className="lg:col-span-2 bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <h2 className="font-bold text-gray-900 dark:text-white">{t('overview.trend12months')}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{t('overview.alertsVsResolved')}</p>
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
                  />
                  <Line type="monotone" dataKey="alerts"   name={t('nav.activeAlerts')} stroke="#f43f5e" strokeWidth={2} dot={{ r: 3, fill: '#f43f5e', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                  <Line type="monotone" dataKey="resolved" name={t('alerts.resolved')}  stroke="#10b981" strokeWidth={2} dot={{ r: 3, fill: '#10b981', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 mt-3 justify-center">
              <LegendItem color="#f43f5e" label={t('nav.activeAlerts')} />
              <LegendItem color="#10b981" label={t('alerts.resolved')} />
            </div>
          </div>

          {/* Status Donut Chart */}
          <div className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl p-5 shadow-sm">
            <div className="mb-2">
              <h2 className="font-bold text-gray-900 dark:text-white">{t('overview.statusBreakdown')}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{format(new Date(), 'd MMM yyyy')}</p>
            </div>
            <div className="h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                    {pieData.map(entry => (
                      <Cell key={entry.key} fill={PIE_COLORS[entry.key]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1.5 mt-1">
              {pieData.map(d => (
                <div key={d.key} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[d.key] }} />
                    <span className="text-xs text-gray-600 dark:text-slate-400">{d.name}</span>
                  </div>
                  <span className="font-bold font-mono-data text-xs text-gray-900 dark:text-slate-200">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Factory Cards */}
        <section className="space-y-3">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900 dark:text-white">{t('overview.factories')}</h2>
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5">{t('overview.factoryDescription')}</p>
            </div>
            <span className="text-xs text-gray-400 dark:text-slate-500 font-mono-data">{factories.length} {t('overview.facilities')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {factories.map(factory => (
              <FactoryCard key={factory.id} factory={factory} stations={stations.filter(s => s.factoryId === factory.id)} />
            ))}
          </div>
        </section>

        {/* Station Filters + Grid */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            {[{ id: 'all' as const, name: t('overview.allFacilities') }, ...factories].map(f => (
              <button
                key={f.id}
                onClick={() => setSelectedFactoryId(f.id)}
                className={cn(
                  'px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap border',
                  selectedFactoryId === f.id
                    ? 'bg-teal-500 text-white border-teal-500 shadow-sm'
                    : 'bg-white dark:bg-[#0f172a] text-gray-600 dark:text-slate-400 border-gray-200 dark:border-[#1e293b] hover:border-teal-400 dark:hover:border-teal-500/50',
                )}
              >
                {f.name}
              </button>
            ))}
          </div>

          {filteredStations.length === 0 ? (
            <div className="py-20 text-center flex flex-col items-center">
              <Factory className="w-12 h-12 text-gray-300 dark:text-slate-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-slate-300">{t('overview.noStations')}</h3>
              <p className="text-gray-400 dark:text-slate-500 text-sm mt-1">{t('overview.noStationsDescription')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStations.map(station => (
                <StationMiniCard
                  key={station.id}
                  station={station}
                  factoryName={factories.find(f => f.id === station.factoryId)?.name}
                />
              ))}
            </div>
          )}
        </section>

      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function StatCard({ title, value, icon: Icon, color, iconBg, pulse }: {
  title: string; value: number; icon: any; color: string; iconBg: string; pulse?: boolean;
}) {
  return (
    <div className={cn(
      'rounded-2xl border border-gray-200 dark:border-[#1e293b] bg-white dark:bg-[#0f172a] p-5 flex items-center justify-between shadow-sm relative overflow-hidden',
    )}>
      {pulse && <div className="absolute inset-0 bg-rose-500/5 animate-pulse pointer-events-none" />}
      <div className="flex flex-col gap-1 z-10">
        <span className="text-xs font-semibold text-gray-500 dark:text-slate-400">{title}</span>
        <span className={cn('text-4xl font-bold font-mono-data leading-none', color)}>{value}</span>
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center z-10', iconBg, color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="w-3 h-1.5 rounded-full" style={{ backgroundColor: color }} />
      <span className="text-xs text-gray-500 dark:text-slate-400">{label}</span>
    </div>
  );
}

function StationMiniCard({ station, factoryName }: { station: Station; factoryName?: string }) {
  const { t } = useI18n();
  return (
    <div className={cn(
      'bg-white dark:bg-[#0f172a] rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-shadow',
      station.status === 'critical'
        ? 'border-rose-300 dark:border-rose-500/30'
        : station.status === 'warning'
          ? 'border-amber-300 dark:border-amber-500/30'
          : 'border-gray-200 dark:border-[#1e293b]',
    )}>
      {station.status === 'critical' && <div className="h-1 bg-rose-500" />}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <p className="font-bold text-gray-900 dark:text-slate-100 text-sm truncate">{station.name}</p>
            {factoryName && (
              <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-0.5 truncate">{factoryName}</p>
            )}
          </div>
          <StatusBadge status={station.status} size="sm" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <MetricPill label="pH"   value={station.current.ph.toFixed(2)} />
          <MetricPill label="Temp" value={`${station.current.temperature.toFixed(1)}°C`} />
          <MetricPill label="DO"   value={`${station.current.dissolvedOxygen.toFixed(1)} mg/L`} />
          <MetricPill label="BOD"  value={`${station.current.estimatedBOD.toFixed(1)} mg/L`} />
        </div>
      </div>
      <div className="border-t border-gray-100 dark:border-[#1e293b] bg-gray-50 dark:bg-[#020617]/30 px-4 py-2.5 flex justify-between items-center">
        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-data uppercase">
          {t('common.updated')}{' '}
          {station.lastUpdated instanceof Date
            ? station.lastUpdated.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })
            : ''}
        </span>
        <Link
          to={`/station/${station.id}`}
          className="text-teal-600 dark:text-teal-400 text-[11px] font-bold flex items-center gap-0.5 hover:gap-1.5 transition-all"
        >
          {t('factory.viewDashboard')} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function MetricPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-gray-50 dark:bg-slate-800/50 rounded-lg px-2.5 py-1.5">
      <span className="text-gray-400 dark:text-slate-500 text-[10px] block leading-none mb-0.5">{label}</span>
      <span className="font-mono-data font-bold text-gray-800 dark:text-slate-200 text-[11px] leading-none">{value}</span>
    </div>
  );
}
