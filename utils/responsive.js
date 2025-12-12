// utils/responsive.js
import { Dimensions, Platform } from 'react-native';
import { useState, useEffect } from 'react';

let { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions (iPhone 11 Pro as reference)
const BASE_WIDTH = 375;
const BASE_HEIGHT = 812;

// Hook to get current dimensions and listen for changes
export const useDimensions = () => {
  const [dimensions, setDimensions] = useState(Dimensions.get('window'));
  
  useEffect(() => {
    const subscription = Dimensions.addEventListener('change', ({ window }) => {
      setDimensions(window);
    });
    
    return () => subscription?.remove();
  }, []);
  
  return dimensions;
};

// Update dimensions when window resizes
Dimensions.addEventListener('change', ({ window }) => {
  SCREEN_WIDTH = window.width;
  SCREEN_HEIGHT = window.height;
});

// Calculate scale factors dynamically
const getScale = () => {
  const widthScale = SCREEN_WIDTH / BASE_WIDTH;
  const heightScale = SCREEN_HEIGHT / BASE_HEIGHT;
  return Math.min(widthScale, heightScale);
};

// Responsive functions
export const wp = (percentage) => {
  const { width } = Dimensions.get('window');
  const value = (percentage * width) / 100;
  return Math.round(value);
};

export const hp = (percentage) => {
  const { height } = Dimensions.get('window');
  const value = (percentage * height) / 100;
  return Math.round(value);
};

export const normalize = (size) => {
  // Use a more conservative scaling for very small screens
  const minScale = 0.85;
  const maxScale = 1.15;
  const { width, height } = Dimensions.get('window');
  const widthScale = width / BASE_WIDTH;
  const heightScale = height / BASE_HEIGHT;
  const scale = Math.min(widthScale, heightScale);
  const adjustedScale = Math.max(minScale, Math.min(maxScale, scale));
  
  const newSize = size * adjustedScale;
  return Math.round(newSize);
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

// Screen size categories (now dynamic)
export const isSmallPhone = () => {
  const { width } = Dimensions.get('window');
  return width < 375;
};
export const isTablet = () => {
  const { width } = Dimensions.get('window');
  return width >= 768;
};
export const isLargeScreen = () => {
  const { width } = Dimensions.get('window');
  return width >= 1024;
};

// Dynamic responsive spacing function
export const getSpacing = () => ({
  xs: normalize(4),
  sm: normalize(8),
  md: normalize(16),
  lg: normalize(24),
  xl: normalize(32),
});

// Static spacing for backward compatibility
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
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