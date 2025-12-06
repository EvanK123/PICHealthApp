import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';

const COLORS = {
  headerBg: '#2d4887',
  pillGroupBg: 'rgba(255,255,255,0.12)',
  pillBg: '#27427a',
  pillActiveBg: '#0EA5B5',
  pillText: 'rgba(255,255,255,0.75)',
  pillTextActive: '#ffffff',
};

export default function CalendarBar({
  calendarMode,              // true = Calendar view, false = Upcoming list
  setCalendarMode,
  setSelectedCalendars,
  calendarOptions,
  onPressProfile,
  avatarUrl,
}) {
  const { t } = useContext(TranslationContext);
  const goUpcoming = () => setCalendarMode(false);
  const goCalendar = () => setCalendarMode(true);

  const handleProfilePress = () => {
    if (typeof onPressProfile === 'function') onPressProfile();
  };

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.headerBg }}>
      {/* CENTERED row: profile + pill group */}
      <View style={styles.pillRow}>
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
            <Icon name="person-circle-outline" size={28} color="#ffffff" />
          )}
        </TouchableOpacity>

        <View style={styles.pillGroup}>
          <TouchableOpacity
            onPress={goUpcoming}
            activeOpacity={0.9}
            style={[styles.pill, !calendarMode && styles.pillActive]}
          >
            <Text style={[styles.pillText, !calendarMode && styles.pillTextActive]}>
              {t('calendar.upcomingEvents')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={goCalendar}
            activeOpacity={0.9}
            style={[styles.pill, styles.pillRight, calendarMode && styles.pillActive]}
          >
            <Text style={[styles.pillText, calendarMode && styles.pillTextActive]}>
              {t('calendar.calendar')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Only show calendar selector when Calendar view is active */}
      <View style={calendarMode ? styles.dropdownWrap : { display: 'none' }}>
        <MultipleSelectList
          setSelected={setSelectedCalendars}
          data={calendarOptions}
          save="key"
          label={t('calendar.selectCalendar')}
          placeholder={t('calendar.selectCalendar')}
          dropdownStyles={styles.dropdown}
          boxStyles={styles.dropdownBox}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  pillRow: {
    backgroundColor: COLORS.headerBg,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',     // << center the whole row horizontally
    gap: 10,
  },
  profileButton: {
    padding: 2,
    borderRadius: 999,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarWrapper: {
    width: 30,
    height: 30,
    borderRadius: 15,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#ffffff',
  },
  profileAvatar: { width: '100%', height: '100%' },

  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillGroupBg,
    padding: 6,
    borderRadius: 20,
    flexShrink: 1,
    maxWidth: '80%',
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 18,
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pillRight: { marginLeft: 10 },
  pillActive: { backgroundColor: COLORS.pillActiveBg, borderColor: 'transparent' },
  pillText: { color: COLORS.pillText, fontWeight: '700' },
  pillTextActive: { color: COLORS.pillTextActive },

  dropdownWrap: { backgroundColor: COLORS.headerBg },
  dropdown: { backgroundColor: '#fff', borderRadius: 0, marginTop: 0, marginBottom: 10 },
  dropdownBox: { backgroundColor: '#fff', borderColor: '#fff', borderRadius: 0 },
});
