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
        <h2 className="text-xl font-bold text-white mb-2">{t('factory.notFound')}</h2>
        <button onClick={() => navigate('/')} className="text-teal-400 hover:text-teal-300">
          {t('common.returnToOverview')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 pb-20 flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto space-y-8">
        
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-teal-400 transition-colors uppercase tracking-wider font-semibold">
          <ChevronLeft className="w-4 h-4" /> {t('common.backTo')} {t('nav.overview')}
        </Link>

        {/* Factory Header */}
        <div className="bg-[#0f172a] rounded-2xl border border-[#1e293b] p-6 lg:p-8 flex flex-col lg:flex-row gap-8 justify-between relative overflow-hidden">
          {factory.status === 'critical' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.6)]" />
          )}
          {factory.status === 'warning' && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.6)]" />
          )}

          <div className="flex-1 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#1e293b] flex items-center justify-center border border-slate-700">
                <Factory className="w-7 h-7 text-teal-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">{factory.name}</h1>
                <div className="flex items-center gap-3 mt-1">
                  <StatusBadge status={factory.status} />
                  <span className="text-slate-400 text-sm font-medium">{factory.id.toUpperCase()}</span>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-[#1e293b]">
              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-slate-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{t('common.customer')}</span>
                  <span className="text-sm font-medium text-slate-300">{factory.customer}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-slate-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{t('common.location')}</span>
                  <span className="text-sm font-medium text-slate-300">{factory.location}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-slate-500" />
                <div className="flex flex-col">
                   <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{t('common.industry')}</span>
                   <span className="text-sm font-medium text-slate-300">{t(industryTranslationKeys[factory.industry] ?? 'common.industry')}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4 lg:border-l border-[#1e293b] lg:pl-8">
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">{t('factory.stations')}</span>
              <span className="text-4xl font-bold font-mono-data text-white">{summary.total}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase tracking-wider text-emerald-500/70 font-semibold">{t('factory.online')}</span>
              <span className="text-4xl font-bold font-mono-data text-emerald-400">{summary.online}</span>
            </div>
            <div className="flex flex-col gap-1">
               <span className="text-[10px] uppercase tracking-wider text-rose-500/70 font-semibold">{t('factory.critical')}</span>
              <span className="text-4xl font-bold font-mono-data text-rose-400">{summary.critical}</span>
            </div>
          </div>
        </div>

        {/* Stations Grid */}
        <div>
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
             {t('factory.monitoringStations')}
            <span className="text-sm font-medium bg-[#1e293b] text-slate-300 px-2 py-0.5 rounded-md">{factoryStations.length}</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {factoryStations.map(station => (
              <StationCard 
                key={station.id} 
                station={station} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
