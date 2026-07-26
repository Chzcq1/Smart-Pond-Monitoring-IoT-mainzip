import { useI18n } from '../../i18n/I18nContext';

export default function LanguageSwitcher() {
  const { language, setLanguage, t } = useI18n();

  return (
    <div
      className="flex items-center bg-gray-100 dark:bg-[#1e293b] rounded-xl p-1"
      aria-label={t('common.language')}
    >
      <button
        type="button"
        onClick={() => setLanguage('th')}
        aria-pressed={language === 'th'}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'th'
            ? 'bg-white dark:bg-[#0f172a] text-teal-600 dark:text-teal-400 shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        }`}
      >
        {t('language.thai')}
      </button>
      <button
        type="button"
        onClick={() => setLanguage('en')}
        aria-pressed={language === 'en'}
        className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
          language === 'en'
            ? 'bg-white dark:bg-[#0f172a] text-teal-600 dark:text-teal-400 shadow-sm'
            : 'text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
        }`}
      >
        {t('language.english')}
      </button>
    </div>
  );
}
