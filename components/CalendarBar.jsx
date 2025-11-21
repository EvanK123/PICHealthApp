import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
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
}) {
  const { t } = useContext(TranslationContext);
  const goUpcoming = () => setCalendarMode(false);
  const goCalendar = () => setCalendarMode(true);

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.headerBg }}>
      {/* Unified pill group (matches your design) */}
      <View style={styles.pillRow}>
        <View style={styles.pillGroup}>
          {/* LEFT: Upcoming Events */}
          <TouchableOpacity
            onPress={goUpcoming}
            activeOpacity={0.9}
            style={[styles.pill, !calendarMode && styles.pillActive]}
          >
            <Text style={[styles.pillText, !calendarMode && styles.pillTextActive]}>
              {t('calendar.upcomingEvents')}
            </Text>
          </TouchableOpacity>

          {/* RIGHT: Calendar */}
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
          label={t('calendar.selectCalendars')}
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
    alignItems: 'center',
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillGroupBg,
    padding: 6,
    borderRadius: 20,
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
