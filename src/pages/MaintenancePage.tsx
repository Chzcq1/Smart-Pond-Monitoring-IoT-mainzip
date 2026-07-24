import { useData } from '../context/DataContext';
import { Wrench, Search, Factory as FactoryIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import { useState, useMemo } from 'react';
import { useI18n } from '../i18n/I18nContext';

export default function MaintenancePage() {
  const { stations, factories } = useData();
  const { t } = useI18n();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'ok' | 'due-soon' | 'overdue'>('all');

  const maintenanceList = useMemo(() => {
    let list = stations.map(s => {
      const factory = factories.find(f => f.id === s.factoryId);
      return {
        ...s,
        factoryName: factory?.name || 'Unknown',
        maintenance: s.maintenance
      };
    });

    if (statusFilter !== 'all') {
      list = list.filter(s => s.maintenance.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(s => 
        s.name.toLowerCase().includes(term) || 
        s.factoryName.toLowerCase().includes(term)
      );
    }

    // Sort by status severity (overdue first, then due-soon, then ok)
    return list.sort((a, b) => {
      const w = { 'overdue': 3, 'due-soon': 2, 'ok': 1 };
      const statusDiff = w[b.maintenance.status] - w[a.maintenance.status];
      if (statusDiff !== 0) return statusDiff;
      return a.maintenance.remainingDays - b.maintenance.remainingDays;
    });
  }, [stations, factories, statusFilter, searchTerm]);

  const overdueCount = stations.filter(s => s.maintenance.status === 'overdue').length;
  const dueSoonCount = stations.filter(s => s.maintenance.status === 'due-soon').length;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <Wrench className="w-8 h-8 text-teal-400" />
              {t('maintenance.title')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{t('maintenance.description')}</p>
          </div>
          
          <div className="flex gap-4">
            {overdueCount > 0 && (
              <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-rose-400 leading-none">{overdueCount} {t('maintenance.overdue')}</span>
                  <span className="text-[10px] uppercase text-rose-500/70">{t('maintenance.actionRequired')}</span>
                </div>
              </div>
            )}
            {dueSoonCount > 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <div className="flex flex-col">
                  <span className="text-sm font-bold text-amber-400 leading-none">{dueSoonCount} {t('maintenance.dueSoon')}</span>
                  <span className="text-[10px] uppercase text-amber-500/70">{t('maintenance.planAhead')}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-wrap gap-4 shrink-0">
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder={t('maintenance.searchPlaceholder')}
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-[#1e293b] border-none text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none focus:ring-2 focus:ring-teal-500/50 placeholder:text-slate-500"
            />
          </div>
          
          <div className="h-9 w-px bg-[#1e293b] mx-2" />
          
          <div className="flex bg-[#1e293b] rounded-lg p-1">
            <button
              onClick={() => setStatusFilter('all')}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", statusFilter === 'all' ? "bg-[#0f172a] text-white shadow-sm" : "text-slate-400 hover:text-slate-200")}
            >
              {t('maintenance.all')}
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", statusFilter === 'overdue' ? "bg-rose-500/20 text-rose-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
            >
              {t('maintenance.overdue')}
            </button>
            <button
              onClick={() => setStatusFilter('due-soon')}
              className={cn("px-4 py-1.5 rounded-md text-sm font-medium transition-colors", statusFilter === 'due-soon' ? "bg-amber-500/20 text-amber-400 shadow-sm" : "text-slate-400 hover:text-slate-200")}
            >
              {t('maintenance.dueSoon')}
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0f172a] sticky top-0 z-10 border-b border-[#1e293b] shadow-sm">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">{t('maintenance.stationInfo')}</th>
                  <th className="px-6 py-4 font-semibold">{t('maintenance.status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('maintenance.sensorCleaning')}</th>
                  <th className="px-6 py-4 font-semibold">{t('maintenance.systemCalibration')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('maintenance.timeRemaining')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {maintenanceList.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      {t('maintenance.noMatches')}
                    </td>
                  </tr>
                ) : (
                  maintenanceList.map(station => (
                    <tr key={station.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-200 group-hover:text-teal-400 transition-colors">{station.name}</span>
                          <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                            <FactoryIcon className="w-3 h-3" /> {station.factoryName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={station.maintenance.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs font-mono-data">
                           <span className="text-slate-500 mb-0.5">{t('common.last')}: {format(station.maintenance.lastCleaning, 'dd MMM yyyy')}</span>
                           <span className="text-slate-300 font-semibold">{t('common.next')}: {format(station.maintenance.nextCleaning, 'dd MMM yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col text-xs font-mono-data">
                           <span className="text-slate-500 mb-0.5">{t('common.last')}: {format(station.maintenance.lastCalibration, 'dd MMM yyyy')}</span>
                           <span className="text-slate-300 font-semibold">{t('common.next')}: {format(station.maintenance.nextCalibration, 'dd MMM yyyy')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className={cn(
                            "text-xl font-bold font-mono-data leading-none",
                            station.maintenance.status === 'overdue' ? 'text-rose-400' :
                            station.maintenance.status === 'due-soon' ? 'text-amber-400' : 'text-emerald-400'
                          )}>
                            {station.maintenance.remainingDays}
                          </span>
                           <span className="text-[10px] uppercase tracking-wider text-slate-500 mt-1">{t('maintenance.daysLeft')}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
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
  if (status === 'ok') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">{t('common.optimal')}</span>;
  }
  if (status === 'due-soon') {
    return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">{t('common.dueSoon')}</span>;
  }
  return <span className="inline-flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">{t('common.overdue')}</span>;
}
