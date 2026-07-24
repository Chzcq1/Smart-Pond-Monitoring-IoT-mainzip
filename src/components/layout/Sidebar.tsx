import { Link, useLocation } from 'react-router-dom';
import { Activity, AlertTriangle, Droplets, Wrench, FileText, Settings, BarChart2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useEffect, useState } from 'react';
import { format } from 'date-fns';

const NAV_ITEMS = [
  { href: '/', label: 'Overview', icon: BarChart2 },
  { href: '/alerts', label: 'Active Alerts', icon: AlertTriangle },
  { href: '/maintenance', label: 'Maintenance', icon: Wrench },
  { href: '/reports', label: 'Reports', icon: FileText },
];

export default function Sidebar() {
  const location = useLocation();
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <aside className="fixed top-0 left-0 bottom-0 w-[260px] bg-[#0f172a] border-r border-[#1e293b] flex flex-col z-50 shadow-xl">
      {/* Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-[#1e293b]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-teal-500/10 flex items-center justify-center border border-teal-500/20">
            <Droplets className="w-6 h-6 text-teal-400" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg tracking-tight text-white leading-tight">Water-MaaS</span>
            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-medium">Mission Control</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-1 overflow-y-auto scrollbar-thin">
        <div className="px-2 pb-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
          System Dashboard
        </div>
        {NAV_ITEMS.map((item) => {
          const isActive = location.pathname === item.href || (item.href !== '/' && location.pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 group relative",
                isActive 
                  ? "bg-teal-500/10 text-teal-400" 
                  : "text-slate-400 hover:bg-[#1e293b] hover:text-slate-200"
              )}
            >
              {isActive && (
                <div className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-teal-500 rounded-r-md shadow-[0_0_8px_rgba(45,212,191,0.6)]" />
              )}
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} />
              <span className="font-medium text-sm">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer / Status info */}
      <div className="p-4 border-t border-[#1e293b] bg-[#020617]/50">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between bg-[#0f172a] rounded p-2.5 border border-[#1e293b]">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-teal-400" />
              <span className="text-xs font-medium text-slate-300">Provider Mode</span>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
          </div>
          
          <div className="text-center font-mono-data text-xs text-slate-400 tracking-wider">
            {format(now, 'dd MMM yyyy')} • <span className="text-slate-300 font-medium">{format(now, 'HH:mm:ss')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
