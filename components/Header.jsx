// components/Header.jsx
import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Platform } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { TranslationContext } from '../context/TranslationContext';
import languagesConfig from '../locales/config/languages.config.json';
import { normalize, spacing, iconSizes, isTablet } from '../utils/responsive';

const COLORS = {
  primary: '#2d4887',
  onPrimary: '#ffffff',
  border: 'rgba(255,255,255,0.25)',
  brand: '#0EA5B5',
};

const getAllLanguages = () => Object.values(languagesConfig);

export default function Header({
  title = 'PIC Health',
  showSubmit = false,        // show submit button on the right
  onPressSubmit = () => {},
  avatarUrl = null,          // profile picture URL
  onPressProfile = null,     // profile button handler
  showProfile = true,        // NEW: allow hiding profile button on specific screens
}) {
  const { lang, setLang, t } = useContext(TranslationContext);
  const navigation = useNavigation();

  const languages = getAllLanguages().map(l => {
    const translated = t(l.translationKey);
    const label =
      translated && translated !== l.translationKey
        ? translated
        : (l.nativeName || l.name);
    return { code: l.code, label };
  });

  const currentLabel =
    languages.find(l => l.code === lang)?.label || lang.toUpperCase();

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
          <Image
            source={require('../assets/logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.beta}>{t('header.beta')}</Text>
        </View>
        <Text style={styles.title}>{title}</Text>
      </View>

      {/* Right: language chip + optional profile + optional Submit */}
      <View style={styles.right}>
        <View style={styles.langChip}>
          <Text
            numberOfLines={1}
            style={[styles.langText, { fontSize: getFontSize(currentLabel) }]}
          >
            {currentLabel}
          </Text>

          {/* Invisible overlay fills the chip; keeps chip height fixed */}
          <Picker
            selectedValue={lang}
            onValueChange={setLang}
            mode="dropdown"
            dropdownIconColor="transparent"
            style={styles.langPickerOverlay}
          >
            {languages.map(opt => (
              <Picker.Item
                key={opt.code}
                label={opt.label}
                value={opt.code}
                color={COLORS.primary}
              />
            ))}
          </Picker>
        </View>

        {/* Profile button — can be hidden via showProfile={false} */}
        {showProfile && (avatarUrl || onPressProfile !== null) && (
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

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.primary,
    minHeight: normalize(64),
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },

  // Logo + BETA stacked vertically
  brandWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: normalize(34),
  },
  logo: { width: normalize(34), height: normalize(34) },
  beta: {
    marginTop: normalize(2),
    fontSize: normalize(10),
    fontWeight: '800',
    letterSpacing: 1,
    color: 'rgba(255,255,255,0.9)',
    opacity: 0.9,
  },

  title: { fontSize: normalize(22), fontWeight: '800', color: COLORS.onPrimary },

  right: { flexDirection: 'row', alignItems: 'center', gap: isTablet() ? spacing.lg : spacing.sm },

  // Profile button
  profileButton: {
    marginRight: spacing.xs,
    padding: spacing.xs,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarWrapper: {
    width: normalize(28),
    height: normalize(28),
    borderRadius: normalize(14),
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
    width: normalize(isTablet() ? 110 : 95),
    height: normalize(isTablet() ? 38 : 34),
    paddingHorizontal: spacing.xs,
    borderRadius: normalize(17),
    borderWidth: 0,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.15)',
    overflow: 'hidden',
  },
  langText: {
    color: COLORS.onPrimary,
    fontWeight: '600',
    fontSize: normalize(10),
    textAlign: 'center',
    adjustsFontSizeToFit: true,
    minimumFontScale: 0.7,
    numberOfLines: 1,
  },
  // Invisible overlay so the native picker doesn't inflate the chip
  langPickerOverlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    opacity: Platform.OS === 'web' ? 0.01 : 0.01,
    color: 'transparent',
  },

  ctaBtn: {
    backgroundColor: COLORS.brand,
    paddingHorizontal: spacing.lg,
    height: normalize(isTablet() ? 44 : 36),
    minWidth: normalize(isTablet() ? 140 : 100),
    borderRadius: normalize(14),
    justifyContent: 'center',
  },
  ctaText: { 
    color: '#ffffff', 
    fontWeight: '800',
    fontSize: normalize(isTablet() ? 16 : 14),
    adjustsFontSizeToFit: Platform.OS !== 'web',
    minimumFontScale: 0.8,
    numberOfLines: 1,
    textAlign: 'center',
  },
});
