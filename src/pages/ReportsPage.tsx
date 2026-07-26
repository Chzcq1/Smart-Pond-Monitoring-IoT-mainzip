import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useStationHistory } from '../hooks/useSimulatedData';
import { FileText, Factory as FactoryIcon, MapPin, Target, BarChart3, Beaker, Wind, Activity, Droplets } from 'lucide-react';
import { cn } from '../lib/utils';
import StatusBadge from '../components/common/StatusBadge';
import { useI18n } from '../i18n/I18nContext';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts';
import { format } from 'date-fns';

type ReportPeriod = 'today' | '7days' | '30days';

const PERIOD_HOURS: Record<ReportPeriod, number> = { 'today': 24, '7days': 168, '30days': 720 };
const PERIOD_LABELS = { 'today': 'reports.today', '7days': 'reports.last7Days', '30days': 'reports.last30Days' } as const;

const card = 'bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl shadow-sm';
const select = 'w-full bg-gray-100 dark:bg-[#1e293b] border-none text-gray-800 dark:text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 hover:bg-gray-200 dark:hover:bg-[#1e293b]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none';

export default function ReportsPage() {
  const { factories, stations } = useData();
  const { t } = useI18n();
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('7days');

  const handleFactoryChange = (fid: string) => {
    setSelectedFactoryId(fid);
    const s = stations.filter(s => s.factoryId === fid);
    setSelectedStationId(s.length > 0 ? s[0].id : '');
  };

  const factory = useMemo(() => factories.find(f => f.id === selectedFactoryId), [factories, selectedFactoryId]);
  const station = useMemo(() => stations.find(s => s.id === selectedStationId), [stations, selectedStationId]);
  const factoryStations = useMemo(() => stations.filter(s => s.factoryId === selectedFactoryId), [stations, selectedFactoryId]);

  const queryStationId = selectedStationId || stations[0]?.id || '';
  const { history, stats } = useStationHistory(queryStationId, PERIOD_HOURS[selectedPeriod]);

  return (
    <div className="p-6 lg:p-8 flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[1000px] mx-auto space-y-6">

        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <FileText className="w-7 h-7 text-teal-600 dark:text-teal-400" />
            {t('reports.title')}
          </h1>
          <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t('reports.description')}</p>
        </div>

        <div className={cn(card, 'p-6 lg:p-8 space-y-8')}>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Step 1 */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-slate-300 flex items-center justify-center font-bold text-[11px]">1</span>
                {t('reports.selectFacility')}
              </label>
              <select value={selectedFactoryId} onChange={e => handleFactoryChange(e.target.value)} className={select}>
                <option value="" disabled>{t('reports.chooseFacility')}</option>
                {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>

            {/* Step 2 */}
            <div className="space-y-3">
              <label className={cn('text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors', selectedFactoryId ? 'text-gray-400 dark:text-slate-500' : 'text-gray-300 dark:text-slate-700')}>
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px]', selectedFactoryId ? 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-slate-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600')}>2</span>
                {t('reports.selectStation')}
              </label>
              <select value={selectedStationId} onChange={e => setSelectedStationId(e.target.value)} disabled={!selectedFactoryId} className={select}>
                <option value="" disabled>{t('reports.chooseStation')}</option>
                {factoryStations.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>

            {/* Step 3 */}
            <div className="space-y-3">
              <label className={cn('text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors', selectedStationId ? 'text-gray-400 dark:text-slate-500' : 'text-gray-300 dark:text-slate-700')}>
                <span className={cn('w-5 h-5 rounded-full flex items-center justify-center font-bold text-[11px]', selectedStationId ? 'bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-slate-300' : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600')}>3</span>
                {t('reports.selectPeriod')}
              </label>
              <select value={selectedPeriod} onChange={e => setSelectedPeriod(e.target.value as ReportPeriod)} disabled={!selectedStationId} className={select}>
                <option value="today">{t('reports.today')}</option>
                <option value="7days">{t('reports.last7Days')}</option>
                <option value="30days">{t('reports.last30Days')}</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          {factory && station ? (
            <div className="pt-8 border-t border-gray-100 dark:border-[#1e293b] space-y-8">
              <div className="flex flex-col md:flex-row gap-8 justify-between">
                <div className="flex-1 space-y-5">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{t('reports.preview')}</h3>
                      <p className="text-gray-500 dark:text-slate-400 text-sm">{t('reports.previewDescription')}</p>
                    </div>
                    <StatusBadge status={station.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <PreviewDetail icon={FactoryIcon} label={t('reports.facility')} value={factory.name} />
                    <PreviewDetail icon={Target}      label={t('reports.station')}  value={station.name} />
                    <PreviewDetail icon={MapPin}      label={t('reports.location')} value={factory.location} />
                    <PreviewDetail icon={FileText}    label={t('reports.period')}   value={t(PERIOD_LABELS[selectedPeriod])} />
                  </div>

                  <div className="rounded-xl border border-gray-200 dark:border-slate-700/50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-[#1e293b]/80">
                        <tr>
                          <th className="px-4 py-2.5 font-semibold">{t('common.parameter')}</th>
                          <th className="px-4 py-2.5 font-semibold">{t('reports.average')}</th>
                          <th className="px-4 py-2.5 font-semibold text-right">{t('reports.maxDetected')}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]/50 font-mono-data">
                        <PreviewStatRow label="pH"                     stats={stats.ph}              unit="" />
                        <PreviewStatRow label={t('common.temperature')} stats={stats.temperature}    unit="°C" />
                        <PreviewStatRow label="DO"                     stats={stats.dissolvedOxygen} unit="mg/L" />
                        <PreviewStatRow label={t('common.estimatedBOD')} stats={stats.estimatedBOD} unit="mg/L" />
                        <PreviewStatRow label={t('common.turbidity')}  stats={stats.turbidity}      unit="NTU" />
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-end">
                  <button
                    type="button"
                    onClick={() => import('../lib/pdf').then(({ generateStationReport }) =>
                      generateStationReport({ factory, station, history, stats, periodLabel: t(PERIOD_LABELS[selectedPeriod]) })
                    )}
                    className="w-full h-14 bg-teal-500 hover:bg-teal-400 text-white rounded-2xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5"
                  >
                    <FileText className="w-5 h-5" />
                    {t('reports.generatePDF')}
                  </button>
                </div>
              </div>

              {/* Charts */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <BarChart3 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('reports.trendCharts')}</h3>
                  <span className="text-xs text-gray-400 dark:text-slate-500 ml-auto">{history.length} data points</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <MiniChart title="pH"                    icon={Beaker}   data={history} dataKey="ph"              color="#06b6d4" unit=""    min={station.thresholds.phMin}     max={station.thresholds.phMax}     domain={[2, 12]} />
                  <MiniChart title="DO"                    icon={Wind}     data={history} dataKey="dissolvedOxygen" color="#3b82f6" unit="mg/L" min={station.thresholds.doMin}                                       domain={[0, 10]} />
                  <MiniChart title="Estimated BOD"         icon={Activity} data={history} dataKey="estimatedBOD"   color="#10b981" unit="mg/L"                                    max={station.thresholds.bodMax}    domain={[0, 150]} />
                  <MiniChart title={t('common.turbidity')} icon={Droplets} data={history} dataKey="turbidity"      color="#8b5cf6" unit="NTU"                                     max={station.thresholds.turbidityMax} domain={[0, 250]} />
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-8 border-t border-gray-100 dark:border-[#1e293b] flex flex-col items-center justify-center py-12 text-gray-400 dark:text-slate-500">
              <FileText className="w-12 h-12 mb-4 opacity-40" />
              <p>{t('reports.selectPrompt')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PreviewDetail({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
      <div>
        <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold block">{label}</span>
        <span className="text-sm text-gray-700 dark:text-slate-300 font-medium truncate block">{value}</span>
      </div>
    </div>
  );
}

function PreviewStatRow({ label, stats, unit }: { label: string; stats: any; unit: string }) {
  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/50 transition-colors">
      <td className="px-4 py-2 font-sans font-medium text-gray-700 dark:text-slate-300">{label}</td>
      <td className="px-4 py-2 text-gray-500 dark:text-slate-400">{stats.average.toFixed(1)} <span className="text-xs opacity-70">{unit}</span></td>
      <td className="px-4 py-2 text-gray-500 dark:text-slate-400 text-right">{stats.max.toFixed(1)} <span className="text-xs opacity-70">{unit}</span></td>
    </tr>
  );
}

function MiniChart({ title, icon: Icon, data, dataKey, color, unit, min, max, domain }: {
  title: string; icon: any; data: any[]; dataKey: string; color: string; unit: string;
  min?: number; max?: number; domain: [number, number];
}) {
  return (
    <div className="bg-gray-50 dark:bg-[#0a1628] rounded-xl border border-gray-200 dark:border-[#1e293b] p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-4 h-4 text-teal-600 dark:text-teal-400" />
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{title}</span>
        {unit && <span className="text-xs text-gray-400 dark:text-slate-500">({unit})</span>}
        {min !== undefined && <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500">min {min}</span>}
        {max !== undefined && <span className="ml-auto text-[10px] text-gray-400 dark:text-slate-500">max {max}</span>}
      </div>
      <div className="h-[140px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: -24 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="timestamp" tickFormatter={ts => format(new Date(ts), 'HH:mm')} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Space Mono' }} tickMargin={6} interval="preserveStartEnd" />
            <YAxis domain={domain} stroke="#cbd5e1" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'Space Mono' }} tickMargin={4} />
            <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', borderRadius: '8px', fontFamily: 'Space Mono', fontSize: '11px' }} labelFormatter={ts => format(new Date(ts), 'dd MMM HH:mm')} />
            {min !== undefined && <ReferenceLine y={min} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} />}
            {max !== undefined && <ReferenceLine y={max} stroke="#f43f5e" strokeDasharray="3 3" strokeWidth={1} />}
            <Line type="monotone" dataKey={dataKey} stroke={color} strokeWidth={1.5} dot={false} activeDot={{ r: 3, fill: color, strokeWidth: 0 }} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
