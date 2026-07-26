import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { ShieldAlert, AlertTriangle, CheckCircle, Filter, Activity } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../lib/utils';
import type { AlertSeverity } from '../types';
import { useI18n } from '../i18n/I18nContext';
import { alertMessageTranslationKeys } from '../i18n/translations';

const card = 'bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl shadow-sm';
const select = 'bg-gray-100 dark:bg-[#1e293b] border-none text-gray-800 dark:text-white text-sm rounded-xl px-3 py-1.5 outline-none focus:ring-2 focus:ring-teal-500/50';

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
    <div className="p-6 lg:p-8 flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-[1400px] mx-auto w-full space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <ShieldAlert className="w-7 h-7 text-rose-500" />
              {t('alerts.title')}
            </h1>
            <p className="text-gray-500 dark:text-slate-400 text-sm mt-1">{t('alerts.description')}</p>
          </div>
          <div className="flex gap-3">
            <div className={cn(card, 'px-5 py-3 flex items-center gap-3')}>
              <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-rose-500" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono-data text-gray-900 dark:text-white leading-none block">{criticalCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">{t('alerts.criticalActive')}</span>
              </div>
            </div>
            <div className={cn(card, 'px-5 py-3 flex items-center gap-3')}>
              <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
              </div>
              <div>
                <span className="text-2xl font-bold font-mono-data text-gray-900 dark:text-white leading-none block">{activeCount}</span>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">{t('alerts.totalActive')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className={cn(card, 'p-4 flex flex-wrap gap-3 items-center')}>
          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-slate-400">
            <Filter className="w-4 h-4" /> {t('alerts.filters')}
          </div>
          <div className="h-6 w-px bg-gray-200 dark:bg-[#1e293b]" />
          <select value={statusFilter}   onChange={e => setStatusFilter(e.target.value as any)}   className={select}>
            <option value="all">{t('alerts.allStatus')}</option>
            <option value="active">{t('alerts.activeOnly')}</option>
            <option value="resolved">{t('alerts.resolved')}</option>
          </select>
          <select value={severityFilter} onChange={e => setSeverityFilter(e.target.value as any)} className={select}>
            <option value="all">{t('alerts.allSeverities')}</option>
            <option value="critical">{t('common.critical')}</option>
            <option value="warning">{t('common.warning')}</option>
          </select>
          <select value={factoryFilter}  onChange={e => setFactoryFilter(e.target.value)}         className={select}>
            <option value="all">{t('alerts.allFacilities')}</option>
            {factories.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>
        </div>

        {/* Table */}
        <div className={cn(card, 'overflow-hidden')}>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="border-b border-gray-200 dark:border-[#1e293b]">
                <tr className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 bg-gray-50 dark:bg-[#0f172a]">
                  <th className="px-6 py-3.5 font-semibold">{t('alerts.status')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('alerts.severity')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('alerts.time')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('alerts.facilityStation')}</th>
                  <th className="px-6 py-3.5 font-semibold">{t('alerts.message')}</th>
                  <th className="px-6 py-3.5 font-semibold text-right">{t('alerts.valueVsLimit')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-[#1e293b]">
                {filteredAlerts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-400 dark:text-slate-500">
                      {t('alerts.noMatches')}
                    </td>
                  </tr>
                ) : filteredAlerts.map(alert => (
                  <tr key={alert.id} className="hover:bg-gray-50 dark:hover:bg-[#1e293b]/30 transition-colors">
                    <td className="px-6 py-4">
                      {alert.resolved ? (
                        <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-500 text-xs font-bold uppercase tracking-wider">
                          <CheckCircle className="w-4 h-4" /> {t('alerts.resolved')}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-500 text-xs font-bold uppercase tracking-wider animate-pulse">
                          <Activity className="w-4 h-4" /> {t('alerts.active')}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        'px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-lg border',
                        alert.severity === 'critical'
                          ? 'bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-500/20'
                          : 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-500/20',
                      )}>
                        {alert.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-mono-data text-xs text-gray-500 dark:text-slate-400 whitespace-nowrap">
                      {format(alert.timestamp, 'dd MMM HH:mm')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-gray-800 dark:text-slate-200">{alert.factoryName}</span>
                        <span className="text-xs text-gray-400 dark:text-slate-500">{alert.stationName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col max-w-md">
                        <span className="text-xs font-bold text-gray-500 dark:text-slate-300 uppercase tracking-wider mb-1">
                          {alert.type} {t('alerts.parameter')}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-slate-400 line-clamp-2">
                          {t(alertMessageTranslationKeys[alert.id] ?? 'alerts.message')}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono-data whitespace-nowrap">
                      <span className={cn('font-bold text-base', alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500')}>
                        {alert.value.toFixed(1)}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-slate-500 uppercase tracking-wider block mt-0.5">
                        {t('common.limit')}: {alert.threshold}
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
