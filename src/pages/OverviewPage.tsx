import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useDashboardSummary } from '../hooks/useSimulatedData';
import StationCard from '../components/dashboard/StationCard';
import { Activity, AlertTriangle, CheckCircle, Factory, ShieldAlert } from 'lucide-react';
import { cn } from '../lib/utils';

export default function OverviewPage() {
  const { factories, stations } = useData();
  const summary = useDashboardSummary(stations);
  const [selectedFactoryId, setSelectedFactoryId] = useState<string | 'all'>('all');

  const filteredStations = useMemo(() => {
    if (selectedFactoryId === 'all') return stations;
    return stations.filter(s => s.factoryId === selectedFactoryId);
  }, [stations, selectedFactoryId]);

  return (
    <div className="p-8 pb-20 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <Activity className="w-8 h-8 text-teal-400" />
            Global Overview
          </h1>
          <p className="text-slate-400 text-sm">Monitor all connected industrial wastewater treatment facilities in real-time.</p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Stations" 
            value={summary.total} 
            icon={Factory} 
            color="text-slate-300"
            bg="bg-slate-800/50"
            border="border-slate-700/50"
          />
          <StatCard 
            title="Online & Optimal" 
            value={summary.online} 
            icon={CheckCircle} 
            color="text-emerald-400"
            bg="bg-emerald-500/10"
            border="border-emerald-500/20"
          />
          <StatCard 
            title="Warning State" 
            value={summary.warning} 
            icon={AlertTriangle} 
            color="text-amber-400"
            bg="bg-amber-500/10"
            border="border-amber-500/20"
          />
          <StatCard 
            title="Critical Alarms" 
            value={summary.critical} 
            icon={ShieldAlert} 
            color="text-rose-400"
            bg="bg-rose-500/10"
            border="border-rose-500/20"
            pulse={summary.critical > 0}
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
          <button
            onClick={() => setSelectedFactoryId('all')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
              selectedFactoryId === 'all' 
                ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.3)]" 
                : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]"
            )}
          >
            All Facilities
          </button>
          {factories.map(f => (
            <button
              key={f.id}
              onClick={() => setSelectedFactoryId(f.id)}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                selectedFactoryId === f.id 
                  ? "bg-teal-500 text-slate-950 shadow-[0_0_15px_rgba(20,184,166,0.3)]" 
                  : "bg-[#0f172a] text-slate-400 hover:text-white border border-[#1e293b]"
              )}
            >
              {f.name}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredStations.map(station => (
            <StationCard 
              key={station.id} 
              station={station} 
              factoryName={factories.find(f => f.id === station.factoryId)?.name} 
            />
          ))}
        </div>
        
        {filteredStations.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center">
            <Factory className="w-12 h-12 text-slate-600 mb-4" />
            <h3 className="text-lg font-medium text-slate-300">No stations found</h3>
            <p className="text-slate-500 text-sm mt-1">This facility currently has no active monitoring stations.</p>
          </div>
        )}

      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color, bg, border, pulse }: any) {
  return (
    <div className={cn("rounded-xl border p-5 flex items-center justify-between relative overflow-hidden", bg, border)}>
      {pulse && (
        <div className="absolute inset-0 bg-rose-500/10 animate-pulse pointer-events-none" />
      )}
      <div className="flex flex-col gap-1 z-10">
        <span className="text-xs uppercase tracking-wider font-semibold text-slate-400">{title}</span>
        <span className={cn("text-4xl font-bold font-mono-data leading-none", color)}>{value}</span>
      </div>
      <div className={cn("w-12 h-12 rounded-lg flex items-center justify-center bg-black/20 z-10", color)}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
}
