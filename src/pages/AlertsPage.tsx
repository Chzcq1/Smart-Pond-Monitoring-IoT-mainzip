import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Search, Filter, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import type { AlertSeverity } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { alertMessageTranslationKeys } from '../i18n/translations';

export default function AlertsPage() {
  const { alerts, factories } = useData();
  const { t } = useI18n();
  const [severityFilter, setSeverityFilter] = useState<AlertSeverity | 'all'>('all');
  const [factoryFilter, setFactoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'resolved'>('all');

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(a => severityFilter === 'all' || a.severity === severityFilter)
      .filter(a => factoryFilter === 'all' || a.factoryId === factoryFilter)
      .filter(a => statusFilter === 'all' || (statusFilter === 'active' ? !a.resolved : a.resolved))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }, [alerts, severityFilter, factoryFilter, statusFilter]);

  const activeCount = alerts.filter(a => !a.resolved).length;
  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">
        
        {/* Header & Stats */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
              <ShieldAlert className="w-8 h-8 text-rose-500" />
              {t('alerts.title')}
            </h1>
            <p className="text-slate-400 text-sm mt-1">{t('alerts.description')}</p>
          </div>
          
          <div className="flex gap-4">
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-5 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono-data text-white leading-none">{criticalCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">{t('alerts.criticalActive')}</span>
              </div>
            </div>
            <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl px-5 py-3 flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold font-mono-data text-white leading-none">{activeCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mt-1">{t('alerts.totalActive')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex flex-wrap gap-4">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
            <Filter className="w-4 h-4" /> {t('alerts.filters')}
          </div>
          <div className="h-6 w-px bg-[#1e293b] mx-2" />
          
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value as any)}
            className="bg-[#1e293b] border-none text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="all">{t('alerts.allStatus')}</option>
            <option value="active">{t('alerts.activeOnly')}</option>
            <option value="resolved">{t('alerts.resolved')}</option>
          </select>

          <select 
            value={severityFilter} 
            onChange={e => setSeverityFilter(e.target.value as any)}
            className="bg-[#1e293b] border-none text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="all">{t('alerts.allSeverities')}</option>
            <option value="critical">{t('common.critical')}</option>
            <option value="warning">{t('common.warning')}</option>
          </select>

          <select 
            value={factoryFilter} 
            onChange={e => setFactoryFilter(e.target.value)}
            className="bg-[#1e293b] border-none text-white text-sm rounded-lg px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/50"
          >
            <option value="all">{t('alerts.allFacilities')}</option>
            {factories.map(f => (
              <option key={f.id} value={f.id}>{f.name}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl flex-1 flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-[#0f172a] sticky top-0 z-10 border-b border-[#1e293b] shadow-sm">
                <tr className="text-[10px] uppercase tracking-wider text-slate-500">
                  <th className="px-6 py-4 font-semibold">{t('alerts.status')}</th>
                  <th className="px-6 py-4 font-semibold">{t('alerts.severity')}</th>
                  <th className="px-6 py-4 font-semibold">{t('alerts.time')}</th>
                  <th className="px-6 py-4 font-semibold">{t('alerts.facilityStation')}</th>
                  <th className="px-6 py-4 font-semibold">{t('alerts.message')}</th>
                  <th className="px-6 py-4 font-semibold text-right">{t('alerts.valueVsLimit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1e293b]">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      {t('alerts.noMatches')}
                    </td>
                  </tr>
                ) : (
                  filteredAlerts.map(alert => (
                    <tr key={alert.id} className="hover:bg-[#1e293b]/30 transition-colors group">
                      <td className="px-6 py-4">
                        {alert.resolved ? (
                          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-bold uppercase tracking-wider">
                            <CheckCircle className="w-4 h-4" /> {t('alerts.resolved')}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-amber-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                            <Activity className="w-4 h-4" /> {t('alerts.active')}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md border",
                          alert.severity === 'critical' 
                            ? "bg-rose-500/10 text-rose-400 border-rose-500/20" 
                            : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                        )}>
                          {alert.severity}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-mono-data text-xs text-slate-400 whitespace-nowrap">
                        {format(alert.timestamp, 'dd MMM HH:mm')}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-200">{alert.factoryName}</span>
                          <span className="text-xs text-slate-500">{alert.stationName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col max-w-md">
                           <span className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">{alert.type} {t('alerts.parameter')}</span>
                           <span className="text-sm text-slate-400 line-clamp-2">{t(alertMessageTranslationKeys[alert.id] ?? 'alerts.message')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right font-mono-data whitespace-nowrap">
                        <div className="flex flex-col items-end">
                          <span className={cn("font-bold text-base", alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400')}>
                            {alert.value.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider mt-0.5">
                             {t('common.limit')}: {alert.threshold}
                          </span>
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
