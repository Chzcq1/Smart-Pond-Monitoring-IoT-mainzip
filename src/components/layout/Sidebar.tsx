import { Link, useLocation } from 'react-router-dom';
import {
  Activity, AlertTriangle, Droplets, Wrench, FileText, BarChart2, X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { useI18n } from '../../i18n/I18nContext';
import { useData } from '../../context/DataContext';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const location = useLocation();
  const { t } = useI18n();
  const { alerts, stations } = useData();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => { onClose(); }, [location.pathname]); // eslint-disable-line react-hooks/exhaustive-deps

  const activeAlerts = alerts.filter(a => !a.resolved).length;
  const overdueStations = stations.filter(s => s.maintenance.status === 'overdue').length;

  const navGroups = [
    {
      label: t('nav.systemDashboard'),
      items: [
        { href: '/', labelKey: 'nav.overview' as const, icon: BarChart2, badge: 0 },
        { href: '/alerts', labelKey: 'nav.activeAlerts' as const, icon: AlertTriangle, badge: activeAlerts },
        { href: '/maintenance', labelKey: 'nav.maintenance' as const, icon: Wrench, badge: overdueStations },
      ],
    },
    {
      label: t('nav.reportsData'),
      items: [
        { href: '/reports', labelKey: 'nav.reports' as const, icon: FileText, badge: 0 },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'fixed top-0 left-0 bottom-0 w-[260px] flex flex-col z-50 transition-transform duration-300',
        'bg-white dark:bg-[#0f172a]',
        'border-r border-gray-200 dark:border-[#1e293b]',
        'shadow-lg dark:shadow-xl',
        'lg:translate-x-0',
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center px-5 border-b border-gray-200 dark:border-[#1e293b] shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-teal-500 flex items-center justify-center shrink-0 shadow-sm">
            <Droplets className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-bold text-base text-gray-900 dark:text-white">Water-MaaS</span>
            <span className="text-[10px] uppercase tracking-widest text-gray-400 dark:text-slate-500">Mission Control</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto scrollbar-thin">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div className="px-3 pb-2 text-[10px] font-bold tracking-widest text-gray-400 dark:text-slate-500 uppercase">
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = location.pathname === item.href ||
                  (item.href !== '/' && location.pathname.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group',
                      isActive
                        ? 'bg-teal-50 dark:bg-teal-500/10 text-teal-600 dark:text-teal-400'
                        : 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] hover:text-gray-900 dark:hover:text-slate-200',
                    )}
                  >
                    <Icon
                      className={cn('w-5 h-5 shrink-0', isActive ? 'text-teal-600 dark:text-teal-400' : '')}
                      strokeWidth={isActive ? 2.5 : 2}
                    />
                    <span className="font-medium text-sm flex-1">{t(item.labelKey)}</span>
                    {item.badge > 0 && (
                      <span className={cn(
                        'text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none',
                        isActive
                          ? 'bg-teal-500 text-white'
                          : 'bg-rose-100 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400',
                      )}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 dark:border-[#1e293b] shrink-0">
        <div className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-[#020617]/50 px-3 py-2.5 mb-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-teal-500" />
            <span className="text-xs font-semibold text-gray-600 dark:text-slate-300">{t('nav.providerMode')}</span>
          </div>
          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
        </div>
        <div className="text-center font-mono-data text-[11px] text-gray-400 dark:text-slate-500 tracking-wider">
          {format(now, 'dd MMM yyyy')} •{' '}
          <span className="text-gray-600 dark:text-slate-300 font-medium">{format(now, 'HH:mm:ss')}</span>
        </div>
      </div>
    </aside>
  );
}
