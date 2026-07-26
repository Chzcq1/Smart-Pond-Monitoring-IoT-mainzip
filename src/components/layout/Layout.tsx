import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DataProvider } from '../../context/DataContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, Sun, Moon, Bell, ChevronRight, Droplets } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useI18n } from '../../i18n/I18nContext';
import type { TranslationKey } from '../../i18n/translations';

const ROUTE_META: Record<string, { crumbs: TranslationKey[]; titleKey: TranslationKey }> = {
  '/':            { crumbs: ['nav.overview'], titleKey: 'overview.title' },
  '/alerts':      { crumbs: ['nav.activeAlerts'], titleKey: 'alerts.title' },
  '/maintenance': { crumbs: ['nav.maintenance'], titleKey: 'maintenance.title' },
  '/reports':     { crumbs: ['nav.reportsData', 'nav.reports'], titleKey: 'reports.title' },
};

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { t } = useI18n();
  const location = useLocation();

  const meta = ROUTE_META[location.pathname] ?? ROUTE_META['/'];

  return (
    <DataProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-gray-50 dark:bg-[#020617] text-gray-900 dark:text-slate-50 font-sans">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 flex flex-col lg:pl-[260px] overflow-hidden">
          {/* Top bar */}
          <header className="h-14 shrink-0 bg-white dark:bg-[#0f172a] border-b border-gray-200 dark:border-[#1e293b] flex items-center justify-between px-4 lg:px-6 gap-4">

            {/* Left: hamburger + breadcrumbs */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors shrink-0"
                onClick={() => setSidebarOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Mobile brand */}
              <div className="lg:hidden flex items-center gap-2 shrink-0">
                <div className="w-7 h-7 rounded-lg bg-teal-500 flex items-center justify-center">
                  <Droplets className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm text-gray-900 dark:text-white">Water-MaaS</span>
              </div>

              {/* Desktop breadcrumbs */}
              <nav className="hidden lg:flex items-center gap-1.5 text-sm min-w-0">
                <span className="text-gray-400 dark:text-slate-500 shrink-0">หน้าหลัก</span>
                {meta.crumbs.map((key, i) => (
                  <span key={i} className="flex items-center gap-1.5 min-w-0">
                    <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-slate-600 shrink-0" />
                    <span className={
                      i === meta.crumbs.length - 1
                        ? 'text-gray-900 dark:text-slate-100 font-semibold truncate'
                        : 'text-gray-500 dark:text-slate-400 truncate'
                    }>
                      {t(key)}
                    </span>
                  </span>
                ))}
              </nav>
            </div>

            {/* Right: actions */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Notification bell */}
              <button
                className="relative p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0f172a]" />
              </button>

              {/* Theme toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-xl text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#1e293b] transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <LanguageSwitcher />
            </div>
          </header>

          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
