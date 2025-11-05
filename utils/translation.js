
const languagesConfig = require('../locales/languages.config.json');
const { loadTranslations } = require('./translation-loader');


const getLanguageCodes = () => Object.keys(languagesConfig);


// Load all translations dynamically
// This will automatically pick up any language in languages.config.json
// To add a new language: create fr.json and add fr entry to languages.config.json
// Then add the require statement in translation-loader.js
const translations = loadTranslations();

/**
 * Get a translation value from the locale files
 * @param {string} lang - Language code (en, es, sm, ch, to)
 * @param {string} path - Dot-separated path to the translation (e.g., "health.title")
 * @returns {any} - The translated value or the path if not found
 */
export function t(lang, path) {
  const langData = translations[lang] || translations.en;
  const keys = path.split('.');
  let value = langData;
  
  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      // Fallback to English if translation not found
      const enValue = translations.en;
      let fallbackValue = enValue;
      for (const k of keys) {
        if (fallbackValue && typeof fallbackValue === 'object' && k in fallbackValue) {
          fallbackValue = fallbackValue[k];
        } else {
          return path; // Return path if even English doesn't have it
        }
      }
      return fallbackValue;
    }
  }
  
  return value;
}

/**
 * Get all translations for a specific section
 * @param {string} lang - Language code
 * @param {string} section - Section name (e.g., "health", "culture")
 * @returns {object} - The section translations
 */
export function getSection(lang, section) {
  return t(lang, section) || {};
}

/**
 * Get services for a specific section
 * @param {string} lang - Language code
 * @param {string} section - Section name (e.g., "health", "culture", "education")
 * @returns {array} - Array of services
 */
export function getServices(lang, section) {
  const sectionData = getSection(lang, section);
  return sectionData.services || [];
}

export default { t, getSection, getServices };

