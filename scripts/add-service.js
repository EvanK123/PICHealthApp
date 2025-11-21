#!/usr/bin/env node

/**
 * Script to add a new service to all localization files
 * Usage: node scripts/add-service.js
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const localesDir = path.join(__dirname, '..', 'locales');
const languages = ['en', 'es', 'sm', 'ch', 'to'];
const sections = ['health', 'culture', 'education'];

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function getServiceInfo() {
  console.log('\n=== Add New Service ===\n');
  
  const section = await question('Section (health/culture/education): ');
  if (!sections.includes(section)) {
    console.error('Invalid section. Must be: health, culture, or education');
    process.exit(1);
  }

  const id = await question('Service ID (e.g., "newService"): ');
  const title = await question('Title (English): ');
  const text = await question('Description (English): ');
  const linkLabel = await question('Link label (English): ');
  const linkId = await question('Link ID (e.g., "homepage" or same as service ID): ');
  const url = await question('URL: ');
  
  const position = await question('Position (1 = first, or press Enter for last): ');
  
  return { section, id, title, text, linkLabel, linkId, url, position: position || 'last' };
}

function loadJSON(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function saveJSON(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

function addServiceToLocale(localeCode, serviceInfo, translations) {
  const localeFile = path.join(localesDir, `${localeCode}.json`);
  const localeData = loadJSON(localeFile);
  
  if (!localeData[serviceInfo.section] || !localeData[serviceInfo.section].services) {
    console.error(`Section "${serviceInfo.section}" not found in ${localeCode}.json`);
    return false;
  }

  const service = {
    id: serviceInfo.id,
    title: translations[localeCode]?.title || serviceInfo.title,
    text: translations[localeCode]?.text || serviceInfo.text,
    links: [{
      label: translations[localeCode]?.linkLabel || serviceInfo.linkLabel,
      linkId: serviceInfo.linkId
    }]
  };

  const services = localeData[serviceInfo.section].services;
  const position = parseInt(serviceInfo.position);
  
  if (serviceInfo.position !== 'last' && !isNaN(position) && position > 0) {
    services.splice(position - 1, 0, service);
  } else {
    services.push(service);
  }

  saveJSON(localeFile, localeData);
  console.log(`✓ Added to ${localeCode}.json`);
  return true;
}

function addLinkToLinksJSON(serviceInfo) {
  const linksFile = path.join(localesDir, 'links.json');
  const linksData = loadJSON(linksFile);
  
  if (!linksData[serviceInfo.section]) {
    linksData[serviceInfo.section] = {};
  }
  
  if (!linksData[serviceInfo.section][serviceInfo.id]) {
    linksData[serviceInfo.section][serviceInfo.id] = {};
  }
  
  linksData[serviceInfo.section][serviceInfo.id][serviceInfo.linkId] = serviceInfo.url;
  
  saveJSON(linksFile, linksData);
  console.log(`✓ Added URL to links.json`);
}

async function main() {
  try {
    const serviceInfo = await getServiceInfo();
    
    // For now, use English text for all languages
    // You can manually translate later or extend this script
    const translations = {
      en: { title: serviceInfo.title, text: serviceInfo.text, linkLabel: serviceInfo.linkLabel },
      es: { title: serviceInfo.title, text: serviceInfo.text, linkLabel: serviceInfo.linkLabel },
      sm: { title: serviceInfo.title, text: serviceInfo.text, linkLabel: serviceInfo.linkLabel },
      ch: { title: serviceInfo.title, text: serviceInfo.text, linkLabel: serviceInfo.linkLabel },
      to: { title: serviceInfo.title, text: serviceInfo.text, linkLabel: serviceInfo.linkLabel }
    };
    
    console.log('\nAdding service to all locale files...');
    
    for (const lang of languages) {
      addServiceToLocale(lang, serviceInfo, translations);
    }
    
    addLinkToLinksJSON(serviceInfo);
    
    console.log('\nService added successfully!');
    console.log('\nNote: Translations are set to English for all languages.');
    console.log('Please update the title, text, and linkLabel in each locale file with proper translations.');
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

main();

