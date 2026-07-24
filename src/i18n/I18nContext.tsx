import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  translations,
  type Language,
  type TranslationKey,
} from './translations';

interface I18nContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);
const STORAGE_KEY = 'water-maas-language';

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') return 'en';
  return window.localStorage.getItem(STORAGE_KEY) === 'th' ? 'th' : 'en';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getInitialLanguage);

  const setLanguage = (nextLanguage: Language) => {
    setLanguageState(nextLanguage);
    window.localStorage.setItem(STORAGE_KEY, nextLanguage);
  };

  const value = useMemo<I18nContextValue>(() => ({
    language,
    setLanguage,
    t: (key) => translations[language][key] ?? translations.en[key] ?? key,
  }), [language]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}