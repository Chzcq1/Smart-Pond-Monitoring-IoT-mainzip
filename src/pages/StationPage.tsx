import { useState, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useStationHistory } from '../hooks/useSimulatedData';
import { ChevronLeft, Wrench, AlertTriangle, Calendar, Clock, Activity, Thermometer, Wind, Droplets, Beaker } from 'lucide-react';
import StatusBadge from '../components/common/StatusBadge';
import { format } from 'date-fns';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { cn } from '../lib/utils';
import { useI18n } from '../i18n/I18nContext';
import { alertMessageTranslationKeys, stationDescriptionTranslationKeys } from '../i18n/translations';

type Period = '24h' | '7d' | '30d';

const PERIOD_HOURS = { '24h': 24, '7d': 168, '30d': 720 };

const card = 'bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl shadow-sm';

export default function StationPage() {
  const { stationId } = useParams<{ stationId: string }>();
  const navigate = useNavigate();
  const { stations, factories, alerts } = useData();
  const { t } = useI18n();
  const [period, setPeriod] = useState<Period>('24h');

  const station = useMemo(() => stations.find(s => s.id === stationId), [stations, stationId]);
  const factory = useMemo(() => station ? factories.find(f => f.id === station.factoryId) : null, [factories, station]);
  const stationAlerts = useMemo(() => alerts.filter(a => a.stationId === stationId && !a.resolved), [alerts, stationId]);

  const { history, stats } = useStationHistory(stationId || '', PERIOD_HOURS[period]);

  if (!station || !factory) {
    return (
      <div className="p-8 flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('station.notFound')}</h2>
        <button onClick={() => navigate('/')} className="text-teal-600 dark:text-teal-400 hover:underline">
          {t('common.returnToOverview')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 pb-20 flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[1400px] mx-auto space-y-6">

        <Link
          to={`/factory/${factory.id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.backTo')} {factory.name}
        </Link>

        {/* Station Header */}
        <div className={cn(card, 'p-6 lg:p-8 flex flex-col lg:flex-row gap-8 justify-between relative overflow-hidden')}>
          {station.status === 'critical' && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />}
          {station.status === 'warning'  && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />}

          <div className="flex-1 space-y-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{station.name}</h1>
              <p className="text-gray-500 dark:text-slate-400 mt-1">
                {t(stationDescriptionTranslationKeys[station.id] ?? 'stationDescription.st01')}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <StatusBadge status={station.status} size="lg" />
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-slate-400 bg-gray-100 dark:bg-[#1e293b] px-3 py-1.5 rounded-lg">
                <Clock className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span className="font-mono-data">{t('common.updated')}: {format(station.lastUpdated, 'HH:mm:ss')}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <LiveMetric title="pH"                         value={station.current.ph.toFixed(2)}                  unit="" />
            <LiveMetric title={t('common.temperatureShort')} value={station.current.temperature.toFixed(1)}        unit="°C" />
            <LiveMetric title={t('common.do')}              value={station.current.dissolvedOxygen.toFixed(2)}    unit="mg/L" />
            <LiveMetric title={t('common.bod')}             value={station.current.estimatedBOD.toFixed(1)}       unit="mg/L" />
            <LiveMetric title="Turb"                        value={station.current.turbidity.toFixed(1)}          unit="NTU" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Charts */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">{t('station.historicalTrends')}</h2>
              <div className="flex p-1 bg-gray-100 dark:bg-[#0f172a] rounded-xl border border-gray-200 dark:border-[#1e293b] gap-1">
                {(['24h', '7d', '30d'] as Period[]).map(p => (
                  <button
                    key={p}
                    onClick={() => setPeriod(p)}
                    className={cn(
                      'px-4 py-1.5 rounded-lg text-sm font-semibold uppercase tracking-wider transition-colors',
                      period === p
                        ? 'bg-white dark:bg-[#1e293b] text-teal-600 dark:text-teal-400 shadow-sm'
                        : 'text-gray-400 dark:text-slate-500 hover:text-gray-700 dark:hover:text-slate-300',
                    )}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <ChartCard title={t('station.phLevel')}           data={history} dataKey="ph"              color="#06b6d4" unit=""    min={station.thresholds.phMin}          max={station.thresholds.phMax}          domain={[2, 12]}   icon={Beaker} />
              <ChartCard title={t('common.temperature')}        data={history} dataKey="temperature"     color="#f59e0b" unit="°C"                                           max={station.thresholds.temperatureMax}  domain={[10, 50]}  icon={Thermometer} />
              <ChartCard title={t('station.dissolvedOxygen')}   data={history} dataKey="dissolvedOxygen" color="#3b82f6" unit="mg/L" min={station.thresholds.doMin}                                                  domain={[0, 10]}   icon={Wind} />
              <ChartCard title={t('station.estimatedBOD')}      data={history} dataKey="estimatedBOD"    color="#10b981" unit="mg/L"                                         max={station.thresholds.bodMax}          domain={[0, 150]}  icon={Activity} />
              <ChartCard title={t('common.turbidity')}          data={history} dataKey="turbidity"       color="#8b5cf6" unit="NTU"                                          max={station.thresholds.turbidityMax}    domain={[0, 250]}  icon={Droplets} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">

            {stationAlerts.length > 0 && (
              <div className="bg-rose-50 dark:bg-rose-500/5 border border-rose-200 dark:border-rose-500/20 rounded-2xl p-5">
                <h3 className="text-rose-600 dark:text-rose-400 font-bold flex items-center gap-2 mb-4">
                  <AlertTriangle className="w-5 h-5" /> {t('station.activeAlerts')} ({stationAlerts.length})
                </h3>
                <div className="space-y-3">
                  {stationAlerts.map(alert => (
                    <div key={alert.id} className="bg-white dark:bg-[#0f172a]/80 rounded-xl p-3 border border-rose-200 dark:border-rose-500/30">
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">{alert.type}</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-data">{format(alert.timestamp, 'HH:mm')}</span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-slate-300">{t(alertMessageTranslationKeys[alert.id] ?? 'alerts.message')}</p>
                      <div className="mt-2 text-xs font-mono-data text-gray-500 dark:text-slate-400">
                        {t('common.value')}: <span className="text-rose-500 font-bold">{alert.value.toFixed(1)}</span> ({t('common.limit')}: {alert.threshold})
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Maintenance Schedule */}
            <div className={cn(card, 'p-5')}>
              <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2 mb-4">
                <Wrench className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {t('station.maintenanceSchedule')}
              </h3>
              <div className="space-y-4">
                <MaintenanceItem title={t('station.sensorCleaning')}   last={station.maintenance.lastCleaning}   next={station.maintenance.nextCleaning}   lastLabel={t('station.last')} nextLabel={t('station.next')} />
                <MaintenanceItem title={t('station.systemCalibration')} last={station.maintenance.lastCalibration} next={station.maintenance.nextCalibration} lastLabel={t('station.last')} nextLabel={t('station.next')} />
              </div>
              <div className="mt-5 pt-4 border-t border-gray-100 dark:border-[#1e293b] flex items-center justify-between">
                <span className="text-sm text-gray-500 dark:text-slate-400">{t('common.status')}</span>
                <span className={cn('font-bold text-sm uppercase tracking-wider',
                  station.maintenance.status === 'ok'       ? 'text-emerald-600 dark:text-emerald-400' :
                  station.maintenance.status === 'due-soon' ? 'text-amber-600 dark:text-amber-400' :
                                                              'text-rose-600 dark:text-rose-400',
                )}>
                  {station.maintenance.status === 'ok' ? t('common.optimal') :
                   station.maintenance.status === 'due-soon' ? t('common.dueSoon') : t('common.overdue')}
                </span>
              </div>
            </div>

            {/* Stats Table */}
            <div className={cn(card, 'overflow-hidden')}>
              <div className="p-4 border-b border-gray-100 dark:border-[#1e293b]">
                <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {t('station.periodStatistics')}
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-[#1e293b]/50">
                    <tr>
                      <th className="px-4 py-3 font-semibold">{t('station.sensor')}</th>
                      <th className="px-4 py-3 font-semibold">{t('station.average')}</th>
                      <th className="px-4 py-3 font-semibold">{t('station.min')}</th>
                      <th className="px-4 py-3 font-semibold">{t('station.max')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]">
                    <StatRow label="pH"                         stats={stats.ph} />
                    <StatRow label={t('common.temperatureShort')} stats={stats.temperature} />
                    <StatRow label={t('common.do')}              stats={stats.dissolvedOxygen} />
                    <StatRow label={t('common.bod')}             stats={stats.estimatedBOD} />
                    <StatRow label={t('common.turbidity')}       stats={stats.turbidity} />
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

function LiveMetric({ title, value, unit }: { title: string; value: string; unit: string }) {
  return (
    <div className="bg-gray-50 dark:bg-[#1e293b]/50 rounded-xl p-4 border border-gray-200 dark:border-[#1e293b] flex flex-col gap-1">
      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">{title}</span>
      <div className="flex items-baseline gap-1">
        <span className="text-xl font-bold font-mono-data text-gray-900 dark:text-white">{value}</span>
        {unit && <span className="text-xs text-gray-400 dark:text-slate-400 font-mono-data">{unit}</span>}
      </div>
    </div>
  );
}

function MaintenanceItem({ title, last, next, lastLabel, nextLabel }: { title: string; last: Date; next: Date; lastLabel: string; nextLabel: string }) {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-700 dark:text-slate-300 mb-2">{title}</h4>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: lastLabel, date: last, accent: false },
          { label: nextLabel, date: next, accent: true },
        ].map(({ label, date, accent }) => (
          <div key={label} className="bg-gray-50 dark:bg-[#1e293b]/50 p-2 rounded-lg flex items-center gap-2">
            <Calendar className={`w-3 h-3 ${accent ? 'text-teal-600 dark:text-teal-500' : 'text-gray-400 dark:text-slate-500'}`} />
            <div>
              <span className={`text-[9px] uppercase ${accent ? 'text-teal-600 dark:text-teal-500' : 'text-gray-400 dark:text-slate-500'}`}>{label}</span>
              <p className="text-gray-700 dark:text-slate-300 font-mono-data">{format(date, 'dd MMM')}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatRow({ label, stats }: { label: string; stats: any }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/30 transition-colors font-mono-data">
      <td className="px-4 py-3 font-sans font-medium text-gray-700 dark:text-slate-300">{label}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{stats.average.toFixed(1)}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{stats.min.toFixed(1)}</td>
      <td className="px-4 py-3 text-gray-600 dark:text-slate-400">{stats.max.toFixed(1)}</td>
    </tr>
  );
}

function ChartCard({ title, data, dataKey, color, unit, min, max, domain, icon: Icon }: any) {
  const { t } = useI18n();
  return (
    <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-[#1e293b] p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-900 dark:text-white font-bold flex items-center gap-2">
          <Icon className="w-5 h-5 text-teal-600 dark:text-teal-400" /> {title}
          {unit && <span className="text-gray-400 dark:text-slate-500 font-normal text-sm">({unit})</span>}
        </h3>
        <div className="flex gap-3 text-xs font-mono-data text-gray-400 dark:text-slate-500">
          {min !== undefined && <span>{t('station.minThreshold')}: <span className="text-gray-700 dark:text-slate-300">{min}</span></span>}
          {max !== undefined && <span>{t('station.maxThreshold')}: <span className="text-gray-700 dark:text-slate-300">{max}</span></span>}
        </div>
      </div>
      <div className="h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={ts => format(new Date(ts), 'HH:mm')} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Mono' }} tickMargin={8} />
            <YAxis domain={domain} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'Space Mono' }} tickMargin={8} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '10px', fontFamily: 'Space Mono', fontSize: '11px', boxShadow: '0 4px 12px rgba(0,0,0,.1)' }}
              itemStyle={{ color: '#0f172a' }}
              labelStyle={{ color: '#64748b', marginBottom: '4px' }}
              labelFormatter={ts => format(new Date(ts), 'dd MMM yyyy HH:mm')}
            />
            {min !== undefined && <ReferenceLine y={min} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} />}
            {max !== undefined && <ReferenceLine y={max} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} />}
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} dot={false} activeDot={{ r: 4, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
