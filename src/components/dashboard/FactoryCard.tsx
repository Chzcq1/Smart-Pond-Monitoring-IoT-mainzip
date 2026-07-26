import { Link } from 'react-router-dom';
import { ArrowUpRight, Factory as FactoryIcon, MapPin } from 'lucide-react';
import type { Factory, Station } from '../../types';
import StatusBadge from '../common/StatusBadge';
import { useI18n } from '../../i18n/I18nContext';
import { industryTranslationKeys } from '../../i18n/translations';

interface FactoryCardProps {
  factory: Factory;
  stations: Station[];
}

export default function FactoryCard({ factory, stations }: FactoryCardProps) {
  const { t } = useI18n();
  const onlineStations = stations.filter(s => s.status === 'online').length;

  return (
    <article className="bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] rounded-2xl p-5 flex flex-col gap-4 shadow-sm hover:shadow-md hover:border-teal-300 dark:hover:border-teal-500/40 transition-all">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/20 flex items-center justify-center shrink-0">
            <FactoryIcon className="w-5 h-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{factory.name}</h3>
            <p className="text-xs text-gray-500 dark:text-slate-500 mt-0.5 truncate">
              {t(industryTranslationKeys[factory.industry] ?? 'common.industry')}
            </p>
          </div>
        </div>
        <StatusBadge status={factory.status} />
      </div>

      <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-slate-400 min-h-10">
        <MapPin className="w-4 h-4 text-gray-400 dark:text-slate-500 mt-0.5 shrink-0" />
        <span>{factory.location}</span>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100 dark:border-[#1e293b]">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">
            {t('factory.monitoringStations')}
          </span>
          <p className="text-2xl font-bold font-mono-data text-gray-900 dark:text-white mt-1">{stations.length}</p>
        </div>
        <div>
          <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">
            {t('factory.onlineDevices')}
          </span>
          <p className="text-2xl font-bold font-mono-data text-emerald-600 dark:text-emerald-400 mt-1">{onlineStations}</p>
        </div>
      </div>

      <Link
        to={`/factory/${factory.id}`}
        className="inline-flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-[#1e293b] hover:bg-teal-500 hover:text-white text-teal-600 dark:text-teal-400 dark:hover:bg-teal-500 dark:hover:text-slate-950 px-4 py-2.5 text-sm font-semibold transition-colors"
      >
        {t('factory.viewDashboard')}
        <ArrowUpRight className="w-4 h-4" />
      </Link>
    </article>
  );
}
