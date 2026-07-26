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

  const borderClass = {
    online:   'border-gray-200 dark:border-slate-800 hover:border-teal-300 dark:hover:border-emerald-500/50',
    warning:  'border-amber-300 dark:border-amber-500/30 hover:border-amber-400 dark:hover:border-amber-500/60',
    critical: 'border-rose-300 dark:border-rose-500/30 hover:border-rose-400 dark:hover:border-rose-500/60',
    offline:  'border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600',
  }[status];

  return (
    <div className={cn(
      'flex flex-col bg-white dark:bg-[#0f172a] rounded-2xl border transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-md group',
      borderClass,
    )}>
      {status === 'critical' && (
        <div className="h-1 w-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]" />
      )}

      <div className="p-5 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-bold text-base text-gray-900 dark:text-slate-100 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
              {station.name}
            </h3>
            {factoryName && (
              <p className="text-xs text-gray-400 dark:text-slate-400 mt-0.5 font-medium tracking-wide">
                {factoryName.toUpperCase()}
              </p>
            )}
          </div>
          <StatusBadge status={status} />
        </div>

        <div className="grid grid-cols-2 gap-3 my-3 flex-1">
          <Metric label={t('common.ph')} value={current.ph.toFixed(2)} unit="" icon={Beaker} />
          <Metric label={t('common.temperatureShort')} value={current.temperature.toFixed(1)} unit="°C" icon={Thermometer} />
          <Metric label={t('common.do')} value={current.dissolvedOxygen.toFixed(2)} unit="mg/L" icon={Wind} />
          <Metric label={t('common.estimatedBOD')} value={current.estimatedBOD.toFixed(1)} unit="mg/L" icon={Activity} />
          <Metric label={t('common.turbidity')} value={current.turbidity.toFixed(1)} unit="NTU" icon={Droplets} />
        </div>
      </div>

      <div className="border-t border-gray-100 dark:border-slate-800/50 bg-gray-50 dark:bg-[#020617]/30 p-3 flex justify-between items-center">
        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-mono-data">
          {t('common.updated').toUpperCase()} {format(station.lastUpdated, 'HH:mm:ss')}
        </div>
        <Link
          to={`/station/${station.id}`}
          className="text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 text-xs font-semibold flex items-center gap-1 group-hover:gap-2 transition-all uppercase tracking-wider"
        >
          {t('factory.viewDashboard')} <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </div>
  );
}

function Metric({ label, value, unit, icon: Icon }: { label: string; value: string; unit: string; icon: any }) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-lg bg-gray-100 dark:bg-slate-800/50 flex items-center justify-center border border-gray-200 dark:border-slate-700/50 shrink-0">
        <Icon className="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" />
      </div>
      <div className="flex flex-col min-w-0">
        <span className="text-[10px] text-gray-400 dark:text-slate-400 font-medium uppercase tracking-wider">{label}</span>
        <div className="flex items-baseline gap-1">
          <span className="font-mono-data font-bold text-gray-800 dark:text-slate-200 leading-none text-sm">{value}</span>
          {unit && <span className="text-[9px] text-gray-400 dark:text-slate-500 font-mono-data">{unit}</span>}
        </div>
      </div>
    </div>
  );
}
