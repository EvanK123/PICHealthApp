import React, { createContext, useState } from 'react';
import { t, getSection, getServices, getAboutUsSections } from '../utils/translation';

export const TranslationContext = createContext({
  lang: 'en',
  setLang: () => {},
  t: () => '',
  getSection: () => ({}),
  getServices: () => [],
  getAboutUsSections: () => []
});

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en');
  
  const translationAPI = {
    lang,
    setLang,
    t: (path) => t(lang, path),
    getSection: (section) => getSection(lang, section),
    getServices: (section) => getServices(lang, section),
    getAboutUsSections: () => getAboutUsSections(lang),
  };
  
  return (
    <TranslationContext.Provider value={translationAPI}>
      {children}
    </TranslationContext.Provider>
  );
}
