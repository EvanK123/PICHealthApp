// components/CalendarBar.jsx
import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TranslationContext } from '../context/TranslationContext';
import CalendarSelector from './CalendarSelector';
import { normalize, spacing, isTablet, wp } from '../utils/responsive';

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
}) {
  const { t } = useContext(TranslationContext);
  const goUpcoming = () => setCalendarMode(false);
  const goCalendar = () => setCalendarMode(true);

  return (
    <SafeAreaView style={{ backgroundColor: COLORS.headerBg }}>
      {/* Row with profile icon + pill group, centered */}
      <View style={styles.pillRow}>
        <View style={styles.rowInner}>


          <View style={styles.pillGroup}>
            <TouchableOpacity
              onPress={goUpcoming}
              activeOpacity={0.9}
              style={[styles.pill, !calendarMode && styles.pillActive]}
            >
              <Text
                style={[
                  styles.pillText,
                  !calendarMode && styles.pillTextActive,
                ]}
              >
                {t('calendar.upcomingEvents')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={goCalendar}
              activeOpacity={0.9}
              style={[
                styles.pill,
                styles.pillRight,
                calendarMode && styles.pillActive,
              ]}
            >
              <Text
                style={[
                  styles.pillText,
                  calendarMode && styles.pillTextActive,
                ]}
              >
                {t('calendar.calendar')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
    paddingHorizontal: isTablet() ? wp(8) : spacing.md,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  rowInner: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
  },
  profileButton: {
    marginRight: spacing.sm,
    padding: spacing.xs,
  },
  pillGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillGroupBg,
    padding: spacing.xs,
    borderRadius: normalize(20),
    alignSelf: 'center',
  },

  pill: {
    paddingHorizontal: spacing.lg,
    borderRadius: normalize(20),
    backgroundColor: COLORS.pillBg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    width: normalize(isTablet() ? 160 : 130),
    height: normalize(isTablet() ? 52 : 44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  pillRight: { marginLeft: spacing.sm },
  pillActive: {
    backgroundColor: COLORS.pillActiveBg,
    borderColor: 'transparent',
  },
  pillText: { 
    color: COLORS.pillText, 
    fontWeight: '700',
    fontSize: normalize(isTablet() ? 16 : 14),
    textAlign: 'center',
    numberOfLines: 1,
  },
  pillTextActive: { color: COLORS.pillTextActive },
});

