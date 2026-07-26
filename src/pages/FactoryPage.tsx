import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { useDashboardSummary } from '../hooks/useSimulatedData';
import StationCard from '../components/dashboard/StationCard';
import StatusBadge from '../components/common/StatusBadge';
import { ChevronLeft, Factory, MapPin, Briefcase, Users } from 'lucide-react';
import { useI18n } from '../i18n/I18nContext';
import { industryTranslationKeys } from '../i18n/translations';

export default function FactoryPage() {
  const { factoryId } = useParams<{ factoryId: string }>();
  const navigate = useNavigate();
  const { factories, stations } = useData();
  const { t } = useI18n();

  const factory = factories.find(f => f.id === factoryId);
  const factoryStations = stations.filter(s => s.factoryId === factoryId);
  const summary = useDashboardSummary(factoryStations);

  if (!factory) {
    return (
      <div className="p-8 flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{t('factory.notFound')}</h2>
        <button onClick={() => navigate('/')} className="text-teal-600 dark:text-teal-400 hover:underline">
          {t('common.returnToOverview')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 pb-20 flex-1 overflow-y-auto scrollbar-thin">
      <div className="max-w-7xl mx-auto space-y-6">

        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-slate-400 hover:text-teal-600 dark:hover:text-teal-400 transition-colors font-semibold"
        >
          <ChevronLeft className="w-4 h-4" /> {t('common.backTo')} {t('nav.overview')}
        </Link>

        {/* Factory Header */}
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-gray-200 dark:border-[#1e293b] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 justify-between relative overflow-hidden shadow-sm">
          {factory.status === 'critical' && <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500" />}
          {factory.status === 'warning' && <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />}

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 dark:bg-[#1e293b] flex items-center justify-center border border-teal-200 dark:border-slate-700">
                <Factory className="w-7 h-7 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">{factory.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={factory.status} />
                  <span className="text-gray-400 dark:text-slate-400 text-sm font-medium">{factory.id.toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-100 dark:border-[#1e293b]">
              {[
                { icon: Users,    labelKey: 'common.customer' as const,  value: factory.customer },
                { icon: MapPin,   labelKey: 'common.location' as const,  value: factory.location },
                { icon: Briefcase, labelKey: 'common.industry' as const, value: t(industryTranslationKeys[factory.industry] ?? 'common.industry') },
              ].map(({ icon: Icon, labelKey, value }) => (
                <div key={labelKey} className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-gray-400 dark:text-slate-500 shrink-0" />
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold block">{t(labelKey)}</span>
                    <span className="text-sm font-medium text-gray-800 dark:text-slate-300">{value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-6 lg:border-l border-gray-100 dark:border-[#1e293b] lg:pl-8">
            {[
              { label: t('factory.stations'), value: summary.total, color: 'text-gray-900 dark:text-white' },
              { label: t('factory.online'),   value: summary.online,   color: 'text-emerald-600 dark:text-emerald-400' },
              { label: t('factory.critical'), value: summary.critical, color: 'text-rose-600 dark:text-rose-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex flex-col gap-1">
                <span className="text-[10px] uppercase tracking-wider text-gray-400 dark:text-slate-500 font-semibold">{label}</span>
                <span className={`text-4xl font-bold font-mono-data ${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stations Grid */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
            {t('factory.monitoringStations')}
            <span className="text-sm font-medium bg-gray-100 dark:bg-[#1e293b] text-gray-600 dark:text-slate-300 px-2 py-0.5 rounded-lg">
              {factoryStations.length}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {factoryStations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
