import { useContext } from 'react';
import { TranslationContext } from '../context/TranslationContext';
import { t, getSection, getServices } from '../utils/translation';

/**
 * Hook to access translations
 * @returns {object} - Translation functions and current language
 */
export function useTranslation() {
  const { lang } = useContext(TranslationContext);
  
  return {
    lang,
    t: (path) => t(lang, path),
    getSection: (section) => getSection(lang, section),
    getServices: (section) => getServices(lang, section),
  };
}

export default useTranslation;

