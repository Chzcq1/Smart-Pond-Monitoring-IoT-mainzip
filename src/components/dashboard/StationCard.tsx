import { Link } from 'react-router-dom';
import { ChevronRight, Droplets, Thermometer, Activity, Wind, Beaker } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import type { Station } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { useI18n } from '../../i18n/I18nContext';

interface StationCardProps {
  station: Station;
  factoryName?: string;
}

export default function StationCard({ station, factoryName }: StationCardProps) {
  const { t } = useI18n();
  const { current, status } = station;

  const bgBorder = {
    online: 'border-slate-800 hover:border-emerald-500/50',
    warning: 'border-amber-500/30 bg-amber-500/5 hover:border-amber-500/60',
    critical: 'border-rose-500/30 bg-rose-500/5 hover:border-rose-500/60 shadow-[0_0_15px_rgba(244,63,94,0.1)]',
    offline: 'border-slate-800 hover:border-slate-600',
  }[status];

  return (
    <div className={cn(
      "flex flex-col bg-[#0f172a] rounded-xl border transition-all duration-300 relative overflow-hidden group",
      bgBorder
    )}>
      {/* Top Banner for critical */}
      {status === 'critical' && (
        <div className="h-1 w-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-lg text-slate-100 group-hover:text-teal-400 transition-colors">
              {station.name}
            </h3>
            {factoryName && (
              <p className="text-xs text-slate-400 mt-1 font-medium tracking-wide">
                {factoryName.toUpperCase()}
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 gap-4 my-4 flex-1">
          <Metric label={t('common.ph')} value={current.ph.toFixed(2)} unit="" icon={Beaker} />
          <Metric label={t('common.temperatureShort')} value={current.temperature.toFixed(1)} unit="°C" icon={Thermometer} />
          <Metric label={t('common.do')} value={current.dissolvedOxygen.toFixed(2)} unit="mg/L" icon={Wind} />
          <Metric label={`${t('common.estimatedBOD')}`} value={current.estimatedBOD.toFixed(1)} unit="mg/L" icon={Activity} />
          <Metric label={t('common.turbidity')} value={current.turbidity.toFixed(1)} unit="NTU" icon={Droplets} />
        </div>
      </div>

      <div className="border-t border-slate-800/50 bg-[#020617]/30 p-3 flex justify-between items-center">
        <div className="text-[10px] text-slate-500 font-mono-data">
          {t('common.updated').toUpperCase()} {format(station.lastUpdated, 'HH:mm:ss')}
        </div>
        <Link 
          to={`/station/${station.id}`}
          className="text-teal-400 hover:text-teal-300 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wider"
        >
          {t('factory.viewDashboard')} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, icon: Icon }: { label: string, value: string, unit: string, icon: any }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-slate-800/50 flex items-center justify-center border border-slate-700/50">
        <Icon className="w-3.5 h-3.5 text-slate-400" />
      </div>
      <div className="flex flex-col">
        <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data font-bold text-slate-200 leading-none">{value}</span>
          {unit && <span className="text-[9px] text-slate-500 font-mono-data">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
