/**
 * Image loader utility
 * Maps image filenames to require statements for React Native
 * React Native requires static requires, so we need to map them here
 */

const imageMap = {
  'pic-logo.png': require('../assets/pic-logo.png'),
  'pic-health-logo-TEXT.png': require('../assets/pic-health-logo-TEXT.png'),
  'picteam.jpeg': require('../assets/picteam.jpeg'),
  'beach-bg.jpg': require('../assets/beach-bg.jpg'),
  'background.png': require('../assets/background.png'),
  'icon.png': require('../assets/icon.png'),
  'splash.png': require('../assets/splash.png'),
  // Add more images as needed
};

const imagesConfig = require('../locales/images.json');

/**
 * Get image source from filename
 * @param {string} filename - Image filename from images.json
 * @returns {object} - Image source for React Native Image component
 */
export function getImageSource(filename) {
  if (!filename) return null;
  
  const imageSource = imageMap[filename];
  if (!imageSource) {
    console.warn(`Image not found in imageMap: ${filename}. Add it to utils/imageLoader.js`);
    // Fallback to pic-logo if image not found
    return imageMap['pic-logo.png'];
  }
  
  return imageSource;
}

/**
 * Get app-wide image (background, logo, etc.)
 * @param {string} key - Image key from images.json app section (e.g., "background", "logo")
 * @returns {object} - Image source for React Native Image component
 */
export function getAppImage(key) {
  const filename = imagesConfig.app?.[key];
  if (!filename) {
    console.warn(`App image key not found: ${key}`);
    return null;
  }
  return getImageSource(filename);
}

export default getImageSource;

