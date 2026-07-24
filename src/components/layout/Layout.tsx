import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { DataProvider } from '../../context/DataContext';
import LanguageSwitcher from './LanguageSwitcher';
import { Menu, Droplets } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <DataProvider>
      <div className="flex h-[100dvh] overflow-hidden bg-[#020617] text-slate-50 font-sans">

        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className="flex-1 min-w-0 flex flex-col lg:pl-[260px] overflow-hidden">
          {/* Top bar */}
          <div className="h-14 shrink-0 border-b border-[#1e293b] bg-[#020617] flex items-center justify-between px-4 lg:px-8">
            {/* Mobile: hamburger + brand */}
            <button
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-[#1e293b] transition-colors"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="lg:hidden flex items-center gap-2">
              <Droplets className="w-5 h-5 text-teal-400" />
              <span className="font-bold text-sm tracking-tight text-white">Water-MaaS</span>
            </div>
            {/* Desktop: spacer */}
            <div className="hidden lg:block" />
            <LanguageSwitcher />
          </div>

          <Outlet />
        </main>
      </div>
    </DataProvider>
  );
}
