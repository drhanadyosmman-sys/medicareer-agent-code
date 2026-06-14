import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, t as translate } from '@/lib/i18n';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (path: string) => string;
  isRtl: boolean;
  dir: 'ltr' | 'rtl';
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('medicareer_language');
    return (stored === 'ar' || stored === 'en') ? stored : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('medicareer_language', newLang);
  };

  const isRtl = lang === 'ar';
  const dir = isRtl ? 'rtl' : 'ltr';

  // Update document direction and lang attribute
  useEffect(() => {
    document.documentElement.setAttribute('dir', dir);
    document.documentElement.setAttribute('lang', lang);
    // Add/remove RTL font
    if (isRtl) {
      document.body.style.fontFamily = "'Noto Kufi Arabic', 'Inter', sans-serif";
    } else {
      document.body.style.fontFamily = '';
    }
  }, [lang, dir, isRtl]);

  const t = (path: string) => translate(path, lang);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, isRtl, dir }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
