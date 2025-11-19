// Load all translation files
// To add a new language: 
// 1. Create [code].json in the locales directory
// 2. Add [code] entry to locales/languages.config.json
// 3. Add one line below: const [code]Translations = require('../locales/[code].json');
// 4. Add one line to translations object: [code]: [code]Translations,
const enTranslations = require('../locales/en.json');
const esTranslations = require('../locales/es.json');
const smTranslations = require('../locales/sm.json');
const chTranslations = require('../locales/ch.json');
const toTranslations = require('../locales/to.json');
const links = require('../locales/links.json');

const translations = {
  en: enTranslations,
  es: esTranslations,
  sm: smTranslations,
  ch: chTranslations,
  to: toTranslations,
};

/**
 * Merge link IDs with URLs from centralized links.json
 * @param {object} service - Service object with links array
 * @param {string} section - Section name (health, culture, education)
 * @returns {object} - Service with merged URLs
 */
function mergeLinks(service, section) {
  if (!service.links || !Array.isArray(service.links)) {
    return service;
  }
  
  const sectionLinks = links[section];
  if (!sectionLinks || !sectionLinks[service.id]) {
    return service;
  }
  
  const serviceLinks = sectionLinks[service.id];
  const mergedLinks = service.links.map(link => {
    if (link.linkId && serviceLinks[link.linkId]) {
      return {
        ...link,
        url: serviceLinks[link.linkId]
      };
    }
    return link; // Keep original if no linkId or URL not found
  });
  
  return {
    ...service,
    links: mergedLinks
  };
}

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
 * @returns {array} - Array of services with merged URLs from links.json
 */
export function getServices(lang, section) {
  const sectionData = getSection(lang, section);
  const services = sectionData.services || [];
  return services.map(service => mergeLinks(service, section));
}

/**
 * Get sections for About Us page
 * @param {string} lang - Language code
 * @returns {array} - Array of aboutUs sections
 */
export function getAboutUsSections(lang) {
  const aboutUsData = getSection(lang, 'aboutUs');
  return aboutUsData.sections || [];
}

export default { t, getSection, getServices, getAboutUsSections };

