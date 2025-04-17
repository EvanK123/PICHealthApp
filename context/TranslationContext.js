import React, { createContext, useState } from 'react';

export const TranslationContext = createContext({
  lang: 'en',
  setLang: () => {}
});

export function TranslationProvider({ children }) {
  const [lang, setLang] = useState('en');
  return (
    <TranslationContext.Provider value={{ lang, setLang }}>
      {children}
    </TranslationContext.Provider>
  );
}
