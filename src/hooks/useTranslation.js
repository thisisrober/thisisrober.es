import en from '../i18n/en';
import es from '../i18n/es';
import { useLanguage } from '../context/LanguageContext';

const translations = { en, es };

export function useTranslation() {
  const { lang, setLang } = useLanguage();
  const t = translations[lang] || translations.en;
  return { t, lang, setLang };
}
