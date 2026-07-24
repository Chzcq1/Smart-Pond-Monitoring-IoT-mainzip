import { useState, useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useStationHistory } from '../hooks/useSimulatedData';
import { FileText, Download, Factory as FactoryIcon, MapPin, Target } from 'lucide-react';
import { generateStationReport } from '../lib/pdf';
import { cn } from '../lib/utils';
import StatusBadge from '../components/common/StatusBadge';

type ReportPeriod = 'today' | '7days' | '30days';

const PERIOD_HOURS = {
  'today': 24,
  '7days': 168,
  '30days': 720
};

const PERIOD_LABELS = {
  'today': 'Today (Last 24h)',
  '7days': 'Last 7 Days',
  '30days': 'Last 30 Days'
};

export default function ReportsPage() {
  const { factories, stations } = useData();
  const [selectedFactoryId, setSelectedFactoryId] = useState<string>('');
  const [selectedStationId, setSelectedStationId] = useState<string>('');
  const [selectedPeriod, setSelectedPeriod] = useState<ReportPeriod>('7days');

  // When factory changes, reset station unless the new factory has the same station
  const handleFactoryChange = (fid: string) => {
    setSelectedFactoryId(fid);
    const factoryStations = stations.filter(s => s.factoryId === fid);
    if (factoryStations.length > 0) {
      setSelectedStationId(factoryStations[0].id);
    } else {
      setSelectedStationId('');
    }
  };

  const factory = useMemo(() => factories.find(f => f.id === selectedFactoryId), [factories, selectedFactoryId]);
  const station = useMemo(() => stations.find(s => s.id === selectedStationId), [stations, selectedStationId]);
  const factoryStations = useMemo(() => stations.filter(s => s.factoryId === selectedFactoryId), [stations, selectedFactoryId]);

  // Hook must be called unconditionally. We pass a default stationId if none selected to satisfy hook rules.
  // We'll just ignore the data if no station is selected.
  const queryStationId = selectedStationId || stations[0]?.id || '';
  const { history, stats } = useStationHistory(queryStationId, PERIOD_HOURS[selectedPeriod]);

  const handleDownload = () => {
    if (!factory || !station) return;
    generateStationReport({
      factory,
      station,
      history,
      stats,
      periodLabel: PERIOD_LABELS[selectedPeriod]
    });
  };

  return (
    <div className="p-8 flex-1 overflow-y-auto">
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-3">
            <FileText className="w-8 h-8 text-teal-400" />
            Compliance Reports
          </h1>
          <p className="text-slate-400 text-sm mt-1">Generate and download official environmental monitoring PDF reports.</p>
        </div>

        {/* Configuration Builder */}
        <div className="bg-[#0f172a] border border-[#1e293b] rounded-2xl p-6 lg:p-8 space-y-8">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1: Factory */}
            <div className="space-y-3">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-semibold flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-[#1e293b] text-slate-300 flex items-center justify-center font-bold">1</span> Select Facility
              </label>
              <select 
                value={selectedFactoryId} 
                onChange={e => handleFactoryChange(e.target.value)}
                className="w-full bg-[#1e293b] border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 hover:bg-[#1e293b]/80 transition-colors cursor-pointer appearance-none"
              >
                <option value="" disabled>Choose facility...</option>
                {factories.map(f => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            </div>

            {/* Step 2: Station */}
            <div className="space-y-3">
              <label className={cn("text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors", selectedFactoryId ? "text-slate-500" : "text-slate-700")}>
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center font-bold", selectedFactoryId ? "bg-[#1e293b] text-slate-300" : "bg-slate-800 text-slate-600")}>2</span> Select Station
              </label>
              <select 
                value={selectedStationId} 
                onChange={e => setSelectedStationId(e.target.value)}
                disabled={!selectedFactoryId}
                className="w-full bg-[#1e293b] border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 hover:bg-[#1e293b]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="" disabled>Choose station...</option>
                {factoryStations.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Step 3: Period */}
            <div className="space-y-3">
              <label className={cn("text-xs uppercase tracking-wider font-semibold flex items-center gap-2 transition-colors", selectedStationId ? "text-slate-500" : "text-slate-700")}>
                <span className={cn("w-5 h-5 rounded-full flex items-center justify-center font-bold", selectedStationId ? "bg-[#1e293b] text-slate-300" : "bg-slate-800 text-slate-600")}>3</span> Select Period
              </label>
              <select 
                value={selectedPeriod} 
                onChange={e => setSelectedPeriod(e.target.value as ReportPeriod)}
                disabled={!selectedStationId}
                className="w-full bg-[#1e293b] border border-slate-700 text-white text-sm rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-teal-500/50 hover:bg-[#1e293b]/80 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed appearance-none"
              >
                <option value="today">Today (Last 24h)</option>
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
              </select>
            </div>
          </div>

          {/* Preview Section */}
          {factory && station && (
            <div className="pt-8 border-t border-[#1e293b] animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col md:flex-row gap-8 justify-between">
                
                <div className="flex-1 space-y-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">Report Preview</h3>
                      <p className="text-slate-400 text-sm">Review summary statistics before generating the official document.</p>
                    </div>
                    <StatusBadge status={station.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <PreviewDetail icon={FactoryIcon} label="Facility" value={factory.name} />
                    <PreviewDetail icon={Target} label="Station" value={station.name} />
                    <PreviewDetail icon={MapPin} label="Location" value={factory.location} />
                    <PreviewDetail icon={FileText} label="Period" value={PERIOD_LABELS[selectedPeriod]} />
                  </div>

                  <div className="bg-[#1e293b]/50 rounded-xl border border-slate-700/50 overflow-hidden">
                    <table className="w-full text-sm text-left">
                      <thead className="text-[10px] uppercase tracking-wider text-slate-500 bg-[#1e293b]/80">
                        <tr>
                          <th className="px-4 py-2 font-semibold">Parameter</th>
                          <th className="px-4 py-2 font-semibold">Average</th>
                          <th className="px-4 py-2 font-semibold text-right">Max Detected</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#1e293b]/50 font-mono-data">
                        <PreviewStatRow label="pH" stats={stats.ph} unit="" />
                        <PreviewStatRow label="Temperature" stats={stats.temperature} unit="°C" />
                        <PreviewStatRow label="DO" stats={stats.dissolvedOxygen} unit="mg/L" />
                        <PreviewStatRow label="Est. BOD" stats={stats.estimatedBOD} unit="mg/L" />
                        <PreviewStatRow label="Turbidity" stats={stats.turbidity} unit="NTU" />
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="w-full md:w-64 flex flex-col justify-end">
                  <button
                    onClick={handleDownload}
                    className="w-full h-14 bg-teal-500 hover:bg-teal-400 text-slate-950 rounded-xl font-bold text-base flex items-center justify-center gap-3 transition-all shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:-translate-y-0.5"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>
                  <p className="text-center text-xs text-slate-500 mt-4">
                    Report includes full historical data points, threshold analysis, and maintenance records.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!station && (
            <div className="pt-8 border-t border-[#1e293b] flex flex-col items-center justify-center py-12 text-slate-500">
              <FileText className="w-12 h-12 mb-4 opacity-50" />
              <p>Select a facility and station to preview the report.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function PreviewDetail({ icon: Icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5"><Icon className="w-4 h-4 text-slate-500" /></div>
      <div className="flex flex-col">
        <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{label}</span>
        <span className="text-sm text-slate-300 font-medium truncate">{value}</span>
      </div>
    </div>
  );
}

function PreviewStatRow({ label, stats, unit }: { label: string, stats: any, unit: string }) {
  return (
    <tr className="hover:bg-[#1e293b]/50 transition-colors">
      <td className="px-4 py-2 font-sans font-medium text-slate-300">{label}</td>
      <td className="px-4 py-2 text-slate-400">{stats.average.toFixed(1)} <span className="text-xs">{unit}</span></td>
      <td className="px-4 py-2 text-slate-400 text-right">{stats.max.toFixed(1)} <span className="text-xs">{unit}</span></td>
    </tr>
  );
}
