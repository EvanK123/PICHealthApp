/**
 * Translation Loader
 * 
 * This file loads translation files dynamically based on languages.config.json
 * 
 * To add a new language (e.g., French):
 * 1. Create fr.json in the locales directory
 * 2. Add fr entry to locales/languages.config.json
 * 3. Add ONE line below: const frTranslations = require('../locales/fr.json');
 * 4. Add ONE line to translationMap: fr: frTranslations,
 * 
 * That's it! The language will be automatically available.
 */

const languagesConfig = require('../locales/languages.config.json');

// Load all translation files
// ADD NEW LANGUAGE HERE: const [code]Translations = require('../locales/[code].json');
const enTranslations = require('../locales/en.json');
const esTranslations = require('../locales/es.json');
const smTranslations = require('../locales/sm.json');
const chTranslations = require('../locales/ch.json');
const toTranslations = require('../locales/to.json');
// Example for French: const frTranslations = require('../locales/fr.json');

// Mapping of language codes to translation objects
// ADD NEW LANGUAGE HERE: [code]: [code]Translations,
const translationMap = {
  en: enTranslations,
  es: esTranslations,
  sm: smTranslations,
  ch: chTranslations,
  to: toTranslations,
  // Example for French: fr: frTranslations,
};

/**
 * Get all available translations
 * Automatically loads translations for all languages in languages.config.json
 * Falls back to English if a translation file is missing
 */
function loadTranslations() {
  const translations = {};
  const languageCodes = Object.keys(languagesConfig);
  
  languageCodes.forEach(code => {
    if (translationMap[code]) {
      translations[code] = translationMap[code];
    } else {
      console.warn(
        `Warning: Translation file for language "${code}" is missing. ` +
        `Please add: const ${code}Translations = require('../locales/${code}.json'); ` +
        `and add it to translationMap. Falling back to English.`
      );
      translations[code] = enTranslations;
    }
  });
  
  // Ensure English is always available
  if (!translations.en) {
    translations.en = enTranslations;
  }
  
  return translations;
}

module.exports = { loadTranslations, translationMap };

