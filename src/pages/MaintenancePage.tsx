import { useData } from '../context/DataContext';
import { Wrench, Search, Factory as FactoryIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useState, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext';

const card = 'bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl shadow-sm';

export default function MaintenancePage() {
  const { stations, factories } = useData();
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'due-soon' | 'overdue'>('all');

  const maintenanceList = useMemo(() => {
    let list = stations.map(s => {
      const factory = factories.find(f => f.id === s.factoryId);
      return { ...s, factoryName: factory?.name || 'Unknown' };
    });

    if (statusFilter !== 'all') {
      list = list.filter(s => s.maintenance.status === statusFilter);
    }
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(term) || s.factoryName.toLowerCase().includes(term),
      );
    }
    return list.sort((a, b) => {
      const w = { overdue: 3, 'due-soon': 2, ok: 1 };
      const d = w[b.maintenance.status] - w[a.maintenance.status];
      return d !== 0 ? d : a.maintenance.remainingDays - b.maintenance.remainingDays;
    });
  }, [stations, factories, statusFilter, searchTerm]);

  const overdueCount = stations.filter(s => s.maintenance.status === 'overdue').length;
  const dueSoonCount = stations.filter(s => s.maintenance.status === 'due-soon').length;

  return (
    <div className="p-6 lg:p-8 flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <Wrench className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              {t('maintenance.title')}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t('maintenance.description')}</p>
          </div>
          <div className="flex gap-3 flex-wrap">
            {overdueCount > 0 && (
              <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <div>
                  <span className="text-sm font-bold text-rose-600 dark:text-rose-400">{overdueCount} {t('maintenance.overdue')}</span>
                  <span className="text-[10px] uppercase text-rose-400 dark:text-rose-500/70 block">{t('maintenance.actionRequired')}</span>
                </div>
              </div>
            )}
            {dueSoonCount > 0 && (
              <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div>
                  <span className="text-sm font-bold text-amber-600 dark:text-amber-400">{dueSoonCount} {t('maintenance.dueSoon')}</span>
                  <span className="text-[10px] uppercase text-amber-400 dark:text-amber-500/70 block">{t('maintenance.planAhead')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className={cn(card, 'p-4 flex flex-wrap gap-4 items-center')}>
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder={t('maintenance.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-gray-100 dark:bg-[#1e293b] border-none text-gray-800 dark:text-white text-sm rounded-xl pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 placeholder:text-gray-400 dark:placeholder:text-slate-500"
            />
          </div>

          <div className="h-9 w-px bg-gray-200 dark:bg-[#1e293b]" />

          <div className="flex bg-gray-100 dark:bg-[#1e293b] rounded-xl p-1 gap-1">
            {([
              ['all', t('maintenance.all')],
              ['overdue', t('maintenance.overdue')],
              ['due-soon', t('maintenance.dueSoon')],
            ] as const).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setStatusFilter(val)}
                className={cn(
                  'px-4 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  statusFilter === val
                    ? val === 'overdue'
                      ? 'bg-rose-500 text-white'
                      : val === 'due-soon'
                        ? 'bg-amber-500 text-white'
                        : 'bg-white dark:bg-[#0f172a] text-gray-900 dark:text-white shadow-sm'
                    : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className={cn(card, 'overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-gray-200 dark:border-[#1e293b] bg-gray-50 dark:bg-[#0f172a]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500">
                  <th className="px-6 py-3.5 font-semibold">{t('maintenance.stationInfo')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('maintenance.status')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('maintenance.sensorCleaning')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('maintenance.systemCalibration')}</th>
                  <th className="px-6 py-3.5 font-semibold text-right">{t('maintenance.timeRemaining')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]">
                {maintenanceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      {t('maintenance.noMatches')}
                    </td>
                  </tr>
                ) : maintenanceList.map(station => (
                  <tr key={station.id} className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-bold text-gray-800 dark:text-slate-200 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {station.name}
                        </span>
                        <span className="text-xs text-gray-400 dark:text-slate-500 flex items-center gap-1 mt-0.5">
                          <FactoryIcon className="w-3 h-3" /> {station.factoryName}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={station.maintenance.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs font-mono-data">
                        <span className="text-gray-400 dark:text-slate-500 mb-0.5">{t('common.last')}: {format(station.maintenance.lastCleaning, 'dd MMM yyyy')}</span>
                        <span className="text-gray-700 dark:text-slate-300 font-semibold">{t('common.next')}: {format(station.maintenance.nextCleaning, 'dd MMM yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col text-xs font-mono-data">
                        <span className="text-gray-400 dark:text-slate-500 mb-0.5">{t('common.last')}: {format(station.maintenance.lastCalibration, 'dd MMM yyyy')}</span>
                        <span className="text-gray-700 dark:text-slate-300 font-semibold">{t('common.next')}: {format(station.maintenance.nextCalibration, 'dd MMM yyyy')}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        'text-xl font-bold font-mono-data leading-none',
                        station.maintenance.status === 'overdue' ? 'text-rose-500' :
                        station.maintenance.status === 'due-soon' ? 'text-amber-500' : 'text-emerald-500',
                      )}>
                        {station.maintenance.remainingDays}
                      </span>
                      <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 block mt-1">
                        {t('maintenance.daysLeft')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

function StatusPill({ status }: { status: 'ok' | 'due-soon' | 'overdue' }) {
  const { t } = useI18n();
  const configs = {
    ok:       'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/20',
    'due-soon': 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
    overdue:  'bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-500/20 animate-pulse',
  };
  const labels = { ok: t('common.optimal'), 'due-soon': t('common.dueSoon'), overdue: t('common.overdue') };
  return (
    <span className={cn('inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border', configs[status])}>
      {labels[status]}
    </span>
  );
}
