// Translation files mapping
// To add a new language:
// 1. Create [code].json in the locales directory
// 2. Add [code] entry to locales/languages.config.json
// 3. Add one line below: [code]: require('./[code].json'),

export const TRANSLATIONS = {
  en: require('./en.json'),
  es: require('./es.json'),
  sm: require('./sm.json'),
  ch: require('./ch.json'),
  to: require('./to.json'),
};
