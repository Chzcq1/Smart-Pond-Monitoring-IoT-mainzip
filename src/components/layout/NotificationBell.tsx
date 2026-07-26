import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, AlertTriangle, ShieldAlert, X, ArrowRight } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../i18n/I18nContext';
import { alertMessageTranslationKeys } from '../../i18n/translations';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { alerts } = useData();
  const { t } = useI18n();
  const navigate = useNavigate();

  const active = alerts
    .filter(a => !a.resolved)
    .sort((a, b) => {
      // critical first, then by time
      if (a.severity !== b.severity) return a.severity === 'critical' ? -1 : 1;
      return b.timestamp.getTime() - a.timestamp.getTime();
    });

  const criticalCount = active.filter(a => a.severity === 'critical').length;
  const totalCount = active.length;

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  // Close on Escape
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className={cn(
          'relative p-2 rounded-xl transition-colors',
          open
            ? 'bg-gray-100 dark:bg-[#1e293b] text-gray-700 dark:text-slate-200'
            : 'text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1e293b]',
        )}
        aria-label="Notifications"
        aria-expanded={open}
      >
        <Bell className="w-5 h-5" />
        {totalCount > 0 && (
          <span className={cn(
            'absolute top-1 right-1 min-w-[16px] h-4 px-0.5 flex items-center justify-center rounded-full text-[10px] font-bold text-white ring-2 ring-white dark:ring-[#0f172a] leading-none',
            criticalCount > 0 ? 'bg-rose-500' : 'bg-amber-500',
          )}>
            {totalCount}
          </span>
        )}
      </button>

      {open && (
        <div className={cn(
          'absolute right-0 top-full mt-2 w-80 z-50',
          'bg-white dark:bg-[#0f172a]',
          'border border-gray-200 dark:border-[#1e293b]',
          'rounded-2xl shadow-xl overflow-hidden',
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-500 dark:text-slate-400" />
              <span className="font-bold text-sm text-gray-900 dark:text-white">
                {t('alerts.title')}
              </span>
              {totalCount > 0 && (
                <span className={cn(
                  'text-[10px] font-bold px-1.5 py-0.5 rounded-full',
                  criticalCount > 0
                    ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400'
                    : 'bg-amber-100 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400',
                )}>
                  {totalCount}
                </span>
              )}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Alert list */}
          <div className="max-h-[340px] overflow-y-auto scrollbar-thin">
            {active.length === 0 ? (
              <div className="py-10 flex flex-col items-center text-gray-400 dark:text-slate-500">
                <Bell className="w-8 h-8 mb-2 opacity-40" />
                <p className="text-sm">ไม่มีการแจ้งเตือนที่ใช้งานอยู่</p>
              </div>
            ) : (
              active.map(alert => (
                <div
                  key={alert.id}
                  className="px-4 py-3 border-b border-gray-50 dark:border-[#1e293b] last:border-0 hover:bg-gray-50 dark:hover:bg-[#1e293b]/40 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5',
                      alert.severity === 'critical'
                        ? 'bg-rose-50 dark:bg-rose-500/10'
                        : 'bg-amber-50 dark:bg-amber-500/10',
                    )}>
                      {alert.severity === 'critical'
                        ? <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                        : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={cn(
                          'text-[10px] font-bold uppercase tracking-wider',
                          alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500',
                        )}>
                          {alert.severity}
                        </span>
                        <span className="text-gray-300 dark:text-slate-600">·</span>
                        <span className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-data">
                          {format(alert.timestamp, 'dd MMM HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-slate-200 truncate">
                        {alert.factoryName}
                        <span className="text-gray-400 dark:text-slate-500 font-normal"> · </span>
                        {alert.stationName}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {t(alertMessageTranslationKeys[alert.id] ?? 'alerts.message')}
                      </p>
                      <div className="mt-1 text-[10px] font-mono-data text-gray-400 dark:text-slate-500">
                        {alert.type}: <span className={cn('font-bold', alert.severity === 'critical' ? 'text-rose-500' : 'text-amber-500')}>{alert.value.toFixed(1)}</span>
                        {' '}({t('common.limit')}: {alert.threshold})
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {active.length > 0 && (
            <div className="px-4 py-3 border-t border-gray-100 dark:border-[#1e293b] bg-gray-50 dark:bg-[#020617]/50">
              <button
                onClick={() => { setOpen(false); navigate('/alerts'); }}
                className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 transition-colors"
              >
                {t('alerts.title')} ทั้งหมด <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
