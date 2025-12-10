// utils/responsive.js
import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Calculate scale factors
const widthScale = SCREEN_WIDTH / BASE_WIDTH;
const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
const scale = Math.min(widthScale, heightScale);

// Responsive functions
export const wp = (percentage) => {
  const value = (percentage * SCREEN_WIDTH) / 100;
  return Math.round(value);
};

export const hp = (percentage) => {
  const value = (percentage * SCREEN_HEIGHT) / 100;
  return Math.round(value);
};

export const normalize = (size) => {
  const newSize = size * scale;
  if (Platform.OS === 'ios') {
    return Math.round(newSize);
  } else {
    return Math.round(newSize) - 2;
  }
};

// Responsive font sizes
export const RFPercentage = (percent) => {
  const heightPercent = (percent * SCREEN_HEIGHT) / 100;
  return Math.round(heightPercent);
};

export const RFValue = (fontSize, standardScreenHeight = 812) => {
  const heightPercent = (fontSize * SCREEN_HEIGHT) / standardScreenHeight;
  return Math.round(heightPercent);
};

// Screen size categories
export const isTablet = () => SCREEN_WIDTH >= 768;
export const isLargeScreen = () => SCREEN_WIDTH >= 1024;

// Responsive spacing
export const spacing = {
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
};

// Responsive icon sizes
export const iconSizes = {
  xs: normalize(12),
  sm: normalize(16),
  md: normalize(20),
  lg: normalize(24),
  xl: normalize(32),
};

export default {
  wp,
  hp,
  normalize,
  RFPercentage,
  RFValue,
  isTablet,
  isLargeScreen,
  spacing,
  iconSizes,
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
};