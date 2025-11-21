import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';

// Debug logging
console.log('[CalendarBar] Component loaded');

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
  avatarUrl,                 // NEW: profile avatar URL
}) {
  const { t } = useContext(TranslationContext);
  const goUpcoming = () => setCalendarMode(false);
  const goCalendar = () => setCalendarMode(true);

  const handleProfilePress = () => {
    if (typeof onPressProfile === 'function') {
      onPressProfile();
    }
  };

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.headerBg }}>
      {/* Top row: profile icon + pill group */}
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
            <Icon name="person-circle-outline" size={26} color="#ffffff" />
          )}
        </TouchableOpacity>

        <View style={styles.pillGroup}>
          {/* LEFT: Upcoming Events */}
          <TouchableOpacity
            onPress={goUpcoming}
            activeOpacity={0.9}
            style={[styles.pill, !calendarMode && styles.pillActive]}
          >
            <Text style={[styles.pillText, !calendarMode && styles.pillTextActive]}>
              Upcoming Events
            </Text>
          </TouchableOpacity>

          {/* RIGHT: Calendar */}
          <TouchableOpacity
            onPress={goCalendar}
            activeOpacity={0.9}
            style={[styles.pill, styles.pillRight, calendarMode && styles.pillActive]}
          >
            <Text style={[styles.pillText, calendarMode && styles.pillTextActive]}>
              Calendar
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
          label="Select Calendars"
          placeholder="Select Calendar"
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
  },
  profileButton: {
    marginRight: 10,
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
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillGroupBg,
    padding: 6,
    borderRadius: 20,
    flexShrink: 1,
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
  pillActive: {
    backgroundColor: COLORS.pillActiveBg,
    borderColor: 'transparent',
  },
  pillText: {
    color: COLORS.pillText,
    fontWeight: '700',
  },
  pillTextActive: { color: COLORS.pillTextActive },

  dropdownWrap: { backgroundColor: COLORS.headerBg },
  dropdown: {
    backgroundColor: '#fff',
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 10,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderColor: '#fff',
    borderRadius: 0,
  },
});
