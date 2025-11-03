// components/Header.jsx
import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';

const COLORS = {
  primary: '#2d4887',
  onPrimary: '#ffffff',
  border: 'rgba(255,255,255,0.25)',
  brand: '#0EA5B5',
};

export default function Header({
  title = 'Calendar',
  onPressLanguage = () => {},
  onPressSubmit = () => {},
}) {
  return (
    <View style={styles.container}>
      {/* Left: logo + title */}
      <View style={styles.left}>
        <Image source={require('../assets/pic-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: EN + Submit Event */}
      <View style={styles.right}>
        <TouchableOpacity style={styles.ghostBtn} onPress={onPressLanguage}>
          <Text style={styles.ghostText}>EN ▾</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.ctaBtn} onPress={onPressSubmit}>
          <Text style={styles.ctaText}>Submit Event</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const HEIGHT = 64;

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    minHeight: HEIGHT,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  left: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  logo: { width: 34, height: 34 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.onPrimary },

  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  ghostBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
  },
  ghostText: { color: COLORS.onPrimary, fontWeight: '700' },

  ctaBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  ctaText: { color: '#ffffff', fontWeight: '800' },
});

