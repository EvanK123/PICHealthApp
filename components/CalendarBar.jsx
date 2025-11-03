// components/CalendarBar.jsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { useTranslation } from '../hooks/useTranslation';

const COLORS = {
  primary: '#2d4887',
  brand:   '#0EA5B5',
  onPrimary: '#ffffff',
  borderOnPrimary: 'rgba(255,255,255,0.25)',
  white: '#ffffff',
};

export default function CalendarBar({
  calendarMode,                 // true = calendar view, false = upcoming list
  setCalendarMode,
  setSelectedCalendars,
  calendarOptions = [],
}) {
  const { t } = useTranslation();
  const onPressCalendar = () => setCalendarMode(true);
  const onPressUpcoming = () => setCalendarMode(false);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Segmented control: Calendar | Upcoming Events */}
      <View style={styles.segmentWrap}>
        <View style={styles.segment}>
          <TouchableOpacity
            onPress={onPressCalendar}
            style={[styles.segmentBtn, calendarMode && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, calendarMode && styles.segmentTextActive]}>
              {t('calendar.calendar')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onPressUpcoming}
            style={[styles.segmentBtn, !calendarMode && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, !calendarMode && styles.segmentTextActive]}>
              {t('calendar.upcomingEvents')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Calendar multi-select dropdown */}
      <View>
        <MultipleSelectList
          setSelected={setSelectedCalendars}
          data={calendarOptions}
          save="key"
          label={t('common.selectCalendars')}
          placeholder={t('common.selectCalendar')}
          dropdownStyles={styles.dropdown}
          boxStyles={styles.dropdownBox}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { backgroundColor: COLORS.primary },

  segmentWrap: { alignItems: 'center', paddingTop: 8, paddingBottom: 6 },
  segment: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 22,
    padding: 4,
    gap: 6,
    borderWidth: 1,
    borderColor: COLORS.borderOnPrimary,
  },
  segmentBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 18, backgroundColor: 'transparent' },
  segmentBtnActive: { backgroundColor: COLORS.brand },
  segmentText: { color: COLORS.onPrimary, fontWeight: '700' },
  segmentTextActive: { color: COLORS.white },

  dropdown: { backgroundColor: COLORS.white, borderRadius: 10, marginTop: 6, marginBottom: 8 },
  dropdownBox: { backgroundColor: COLORS.white, borderColor: COLORS.white, borderRadius: 10 },
});

