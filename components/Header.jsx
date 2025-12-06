// components/Header.jsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { TranslationContext } from '../context/TranslationContext';
import languagesConfig from '../locales/languages.config.json';


const COLORS = {
  primary: '#2d4887',
  onPrimary: '#ffffff',
  border: 'rgba(255,255,255,0.25)',
  brand: '#0EA5B5',
};

const getAllLanguages = () => Object.values(languagesConfig);

export default function Header({
  title = 'PIC Health',
  showSubmit = false,            // <- only show button on Home
  onPressSubmit = () => {},
  avatarUrl = null,              // Profile picture URL
  onPressProfile = null,         // Profile button handler
}) {
  const { lang, setLang, t } = useContext(TranslationContext);
  const navigation = useNavigation();

  const languages = getAllLanguages().map(l => {
    const translated = t(l.translationKey);
    const label = translated && translated !== l.translationKey ? translated : (l.nativeName || l.name);
    return { code: l.code, label };
  });

  const currentLabel = languages.find(l => l.code === lang)?.label || lang.toUpperCase();
  const getFontSize = (text) => {
    if (text.length <= 7) return 13;
    if (text.length <= 10) return 11;
    return 9;
  };

  const handleProfilePress = () => {
    if (onPressProfile) {
      onPressProfile();
    } else {
      navigation.navigate('Account');
    }
  };

  return (
    <View style={styles.container}>
      {/* Left: logo (with BETA under it) + title */}
      <View style={styles.left}>
        <View style={styles.brandWrap}>
          <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
          <Text style={styles.beta}>{t('header.beta')}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: language chip + profile button + optional Submit */}
      <View style={styles.right}>
        <View style={styles.langChip}>
          <Text numberOfLines={1} style={[styles.langText, { fontSize: getFontSize(currentLabel) }]}>{currentLabel}</Text>

          {/* Invisible overlay fills the chip; keeps chip height fixed */}
          <Picker
            selectedValue={lang}
            onValueChange={setLang}
            mode="dropdown"
            dropdownIconColor="transparent"
            style={styles.langPickerOverlay}
          >
            {languages.map(opt => (
              <Picker.Item key={opt.code} label={opt.label} value={opt.code} color={COLORS.primary} />
            ))}
          </Picker>
        </View>

        {/* Profile button */}
        {(avatarUrl || onPressProfile !== null) && (
          <TouchableOpacity
            onPress={handleProfilePress}
            activeOpacity={0.8}
            style={styles.profileButton}
          >
            {avatarUrl ? (
              <View style={styles.profileAvatarWrapper}>
                <Image source={{ uri: avatarUrl }} style={styles.profileAvatar} />
              </View>
            ) : (
              <Icon name="person-circle-outline" size={26} color="#ffffff" />
            )}
          </TouchableOpacity>
        )}

        {showSubmit && (
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

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  // Logo + BETA stacked vertically
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 34,
  },
  logo: { width: 34, height: 34 },
  beta: {
    marginTop: 2,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.9)',
    opacity: 0.9,
  },

  title: { fontSize: 22, fontWeight: '800', color: COLORS.onPrimary },

  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  
  // Profile button
  profileButton: {
    marginRight: 4,
    padding: 4,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarWrapper: {
    width: 28,
    height: 28,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  profileAvatar: {
    width: '100%',
    height: '100%',
  },

  // Compact language chip (fixed height)
  langChip: {
    position: 'relative',
    width: 100,
    height: 36,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  langText: {
    color: COLORS.onPrimary,
    fontWeight: '700',
    fontSize: 13,
    textAlign: 'center',
  },
  // Invisible overlay so the native picker doesn't inflate the chip
  langPickerOverlay: {
    position: 'absolute', left: 0, right: 0, top: 0, bottom: 0,
    opacity: Platform.OS === 'web' ? 0.01 : 0.01,
    color: 'transparent',
  },

  ctaBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: 14,
    height: 36,
    borderRadius: 14,
    justifyContent: 'center',
  },
  ctaText: { color: '#ffffff', fontWeight: '800' },
});
