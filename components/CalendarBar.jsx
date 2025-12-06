import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';
import CalendarSelector from './CalendarSelector';

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
  selectedCalendars,
  setSelectedCalendars,
  calendarOptions,
  onPressSubmit,
}) {
  const { t } = useContext(TranslationContext);
  const goUpcoming = () => setCalendarMode(false);
  const goCalendar = () => setCalendarMode(true);

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.headerBg }}>
      {/* Row with pill group and submit button */}
      <View style={styles.pillRow}>
        <View style={styles.leftSpacer} />
        
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
        
        <TouchableOpacity style={styles.submitBtn} onPress={onPressSubmit}>
          <Text style={styles.submitText}>{t('header.submitEvent')}</Text>
        </TouchableOpacity>
      </View>

      {/* Only show calendar selector when Calendar view is active */}
      {calendarMode && (
        <CalendarSelector
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
        />
      )}
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
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  leftSpacer: {
    width: 100,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillGroupBg,
    padding: 6,
    borderRadius: 20,
  },
  submitBtn: {
    backgroundColor: COLORS.pillActiveBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
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

  submitBtn: {
    backgroundColor: COLORS.pillActiveBg,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
  },
  submitText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },


});
