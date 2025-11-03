// components/Header.jsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { TranslationContext } from '../context/TranslationContext';
import { useTranslation } from '../hooks/useTranslation';
import languagesConfig from '../locales/languages.config.json';

// Get all languages as array
const getAllLanguages = () => Object.values(languagesConfig);

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
  const { lang, setLang } = useContext(TranslationContext);
  const { t } = useTranslation();
  
  // Get all available languages from configuration
  // If translation key doesn't exist, fall back to nativeName from config
  const languages = getAllLanguages().map(langInfo => {
    const translatedName = t(langInfo.translationKey);
    const label = translatedName && translatedName !== langInfo.translationKey 
      ? translatedName 
      : langInfo.nativeName || langInfo.name;
    return {
      code: langInfo.code,
      label,
    };
  });
  
  const currentLanguage = languages.find(l => l.code === lang)?.label || lang.toUpperCase();
  
  return (
    <View style={styles.container}>
      {/* Left: logo + title */}
      <View style={styles.left}>
        <Image source={require('../assets/pic-logo.png')} style={styles.logo} resizeMode="contain" />
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: Language Dropdown + Submit Event */}
      <View style={styles.right}>
        <View style={styles.languagePickerContainer}>
          <Text style={styles.languagePickerLabel}>
            {currentLanguage}
          </Text>
          <Picker
            selectedValue={lang}
            onValueChange={setLang}
            style={styles.languagePicker}
            dropdownIconColor={COLORS.onPrimary}
            itemStyle={styles.pickerItem}
            mode="dropdown"
          >
            {languages.map((langOption) => (
              <Picker.Item
                key={langOption.code}
                label={langOption.label}
                value={langOption.code}
                color={COLORS.primary}
              />
            ))}
          </Picker>
        </View>

        {onPressSubmit && (
          <TouchableOpacity style={styles.ctaBtn} onPress={onPressSubmit}>
            <Text style={styles.ctaText}>{t('header.submitEvent')}</Text>
          </TouchableOpacity>
        )}
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

  languagePickerContainer: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: 'transparent',
    minWidth: 100,
    position: 'relative',
    overflow: 'visible',
    justifyContent: 'center',
  },
  languagePickerLabel: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 14,
    position: 'absolute',
    left: 12,
    top: '50%',
    marginTop: -8,
    zIndex: 1,
    pointerEvents: 'none',
  },
  languagePicker: {
    color: 'transparent',
    height: 40,
    width: '100%',
    ...(Platform.OS === 'web' ? {
      WebkitAppearance: 'none',
      MozAppearance: 'none',
      appearance: 'none',
      opacity: 0.01,
    } : {
      opacity: 0.01, // Nearly transparent but still clickable
    }),
  },
  pickerItem: {
    color: COLORS.primary,
    backgroundColor: '#fff',
  },

  ctaBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  ctaText: { color: '#ffffff', fontWeight: '800' },
});

