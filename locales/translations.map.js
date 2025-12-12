// Translation files mapping
// To add a new language:
// 1. Create [code].json in the locales/translations directory
// 2. Add [code] entry to locales/config/languages.config.json
// 3. Add one line below: [code]: require('./translations/[code].json'),

export const TRANSLATIONS = {
  en: require('./translations/en.json'),
  es: require('./translations/es.json'),
  sm: require('./translations/sm.json'),
  ch: require('./translations/ch.json'),
  to: require('./translations/to.json'),
};
