import { Languages } from 'lucide-react';
import { useI18n } from '../../i18n/I18nContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div className="flex items-center gap-2 bg-[#0f172a] border border-[#1e293b] rounded-lg p-1" aria-label={t('common.language')}>
      <Languages className="w-4 h-4 text-slate-500 ml-2" />
      <button
        type="button"
        onClick={() => setLanguage('th')}
        aria-pressed={language === 'th'}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          language === 'th' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
        }`}
      >
        {t('language.thai')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-colors ${
          language === 'en' ? 'bg-teal-500 text-slate-950' : 'text-slate-400 hover:text-white'
        }`}
      >
        {t('language.english')}
      </button>
    </div>
  );
}