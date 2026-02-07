import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('lang');
    if (urlLang && ['es', 'en'].includes(urlLang)) return urlLang;
    const cookie = document.cookie.split('; ').find(c => c.startsWith('language='));
    if (cookie) return cookie.split('=')[1];
    return 'en';
  });

  useEffect(() => {
    document.cookie = `language=${lang};path=/;max-age=${86400 * 30}`;
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (newLang) => {
    if (['es', 'en'].includes(newLang)) setLangState(newLang);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
