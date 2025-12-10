// components/CalendarView.jsx
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Popup from './PopUp';
import WebViewModal from './WebViewModal';
import { TranslationContext } from '../context/TranslationContext';
import { normalize, spacing, isTablet, wp } from '../utils/responsive';

const COLORS = {
  primary: '#2d4887',
  navyText: '#091826',
  navyBorder: 'rgba(45,72,135,0.18)',
  accentPIC: '#0B75B9',
  accentLatino: '#71AD45',
  brand: '#0EA5B5',
  ink: '#0f172a',
  inkMute: '#475569',
  panelBorder: '#E5EAF0',
  sheetCard: '#f8fafc',
  sheetBar1: '#10A6A6',
  sheetBar2: '#0E7CA8',
};

const CAL_THEME = {
  backgroundColor: 'transparent',
  calendarBackground: 'transparent',
  monthTextColor: COLORS.navyText,
  textMonthFontWeight: '800',
  textMonthFontSize: 18,
  arrowColor: COLORS.navyText,
  dayTextColor: COLORS.navyText,
  textDisabledColor: 'rgba(9,24,38,0.35)',
  todayTextColor: COLORS.brand,
  textDayFontSize: 13,
  textDayHeaderFontWeight: '700',
};

const WEEKDAYS_ABBREV = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEKDAYS_FULL = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

const toLocalDate = (iso) => {
  const [y,m,d] = (iso||'').split('-').map(Number);
  return new Date(y,(m||1)-1,d||1);
};

export default function CalendarView({ events, selectedCalendars, callWebView, closeModal, navigation }) {
  const { t } = useContext(TranslationContext);
  const calendarsConfig = require('../locales/config/calendars.json');
  const [markedDates, setMarkedDates] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  const getColorForCalendar = (email) => {
    const cal = calendarsConfig.calendars.find(c => c.id === email);
    return cal?.color || COLORS.accentPIC;
  };

  // compute cell size from available width
  const [calWidth, setCalWidth] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const CELL_MARGIN = normalize(2);
  const COLUMNS = 7;
  const availableWidth = calWidth || screenWidth - spacing.md; // fallback to screen width minus padding
  const cellSize = Math.max(normalize(isTablet() ? 60 : 40), Math.floor((availableWidth - CELL_MARGIN * 2 * COLUMNS) / COLUMNS));



  // mark dates + selection
  useEffect(() => {
    const fm = {};
    Object.keys(events || {}).forEach((date) => {
      const list = events[date] || [];
      const dots = list.slice(0, 3).map((e) => ({ color: getColorForCalendar(e.organizer?.email) }));
      fm[date] = { dots };
    });
    if (selectedDate) {
      fm[selectedDate] = {
        ...(fm[selectedDate] || {}),
        selected: true,
        selectedColor: COLORS.primary,
        selectedTextColor: '#fff',
      };
    }
    setMarkedDates(selectedCalendars.length ? fm : {});
  }, [events, selectedCalendars, selectedDate]);

  const handleDayPress = (day) => {
    setSelectedDate(day.dateString);
    const selectedDateEvents = events[day.dateString] || [];
    setSelectedEvents(selectedDateEvents);
    setPopupVisible(true);
  };

  // custom day cell
  const DayCell = ({ date, state }) => {
    const key = date.dateString;
    const list = events[key] || [];
    const first = list[0];
    const pillColor = first?.organizer?.email ? getColorForCalendar(first.organizer.email) : COLORS.accentPIC;

    return (
      <TouchableOpacity
        onPress={() => handleDayPress(date)}
        style={[
          styles.dayCell,
          { 
            margin: CELL_MARGIN, 
            width: cellSize, 
            height: Math.max(normalize(isTablet() ? 60 : 40), Math.round(cellSize * 0.9)),
            minHeight: normalize(isTablet() ? 60 : 40)
          },
          state === 'disabled' && { opacity: 0.4 },
          selectedDate === key && styles.dayCellSelected,
        ]}
      >
        <Text style={styles.dayNum}>{date.day}</Text>
        {first?.summary ? (
          <View style={[styles.eventPill, { backgroundColor: pillColor }]}>
            <Text numberOfLines={1} style={styles.eventPillText}>{first.summary}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const selectedLabel = useMemo(() => {
    if (!selectedDate) return '';
    const d = toLocalDate(selectedDate);
    const wd = WEEKDAYS_FULL[d.getDay()];
    const dd = d.getDate();
    return `${t('calendar.upcomingEvents')} ${wd} ${dd}`;
  }, [selectedDate, t]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
      {/* Edge-to-edge white panel */}
      <View style={styles.whitePanel} onLayout={(e) => setCalWidth(e.nativeEvent.layout.width)}>
        {/* Weekday strip with border & vertical dividers */}
        <View style={styles.weekStripBox}>
          {WEEKDAYS_ABBREV.map((d, i) => (
            <View
              key={d}
              style={[styles.weekCellBox, i === WEEKDAYS_ABBREV.length - 1 && styles.weekCellLast]}
            >
              <Text style={styles.weekText}>{d}</Text>
            </View>
          ))}
        </View>

        <Calendar
          style={styles.calendarStyle}
          markingType="multi-dot"
          markedDates={markedDates}
          onDayPress={handleDayPress}
          enableSwipeMonths
          firstDay={0}
          hideExtraDays={false}
          hideDayNames
          theme={CAL_THEME}
          renderHeader={(date) => {
            const d = new Date(date);
            const label = d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
            return (
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{label}</Text>
              </View>
            );
          }}
          dayComponent={({ date, state }) => <DayCell date={date} state={state} />}
        />
      </View>

      {/* Bottom sheet of events for the selected day */}
      {selectedDate && (
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{selectedLabel}</Text>
          {selectedEvents.map((ev) => {
            const barColor = getColorForCalendar(ev.organizer?.email);
            const timeText = ev.start?.date
              ? t('calendar.allDay')
              : new Date(ev.start?.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <TouchableOpacity 
                key={ev.id || ev.summary + ev.start?.dateTime} 
                style={styles.sheetCard}
                onPress={() => {
                  setSelectedEvents([ev]);
                  setPopupVisible(true);
                }}
                activeOpacity={1.0}
              >
                <View style={[styles.topBar, { backgroundColor: barColor }]} />
                <View style={styles.sheetBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitleText}>{ev.summary || t('calendar.noTitle')}</Text>
                    <Text style={styles.sheetMeta}>
                      {timeText} {ev.location ? `• ${ev.location}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} events={selectedEvents} navigation={navigation} />
      <WebViewModal url={''} isVisible={false} onClose={closeModal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  containerContent: { paddingBottom: spacing.md, width: '100%', paddingHorizontal: 0 },

  whitePanel: {
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingVertical: spacing.sm,
    paddingHorizontal: 0, // edge-to-edge
    width: '100%',
    alignSelf: 'stretch',
  },

  calendarStyle: { backgroundColor: 'transparent', margin: 0, paddingHorizontal: 0 },

  header: { paddingVertical: spacing.xs, alignItems: 'center' },
  headerTitle: { color: COLORS.navyText, fontSize: normalize(isTablet() ? 22 : 18), fontWeight: '800' },

  // Weekday strip — single bordered container with vertical dividers
  weekStripBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    borderRadius: normalize(10),
    overflow: 'hidden',
    marginHorizontal: spacing.xs,
    marginBottom: spacing.xs,
  },
  weekCellBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.sm,
    borderRightWidth: 1,
    borderRightColor: COLORS.navyBorder,
  },
  weekCellLast: { borderRightWidth: 0 },
  weekText: { fontSize: normalize(isTablet() ? 14 : 12), fontWeight: '800', color: COLORS.navyText },

  // Day cells
  dayCell: {
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    backgroundColor: '#fff',
    padding: spacing.xs,
    justifyContent: 'flex-start',
  },
  dayCellSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  dayNum: { color: COLORS.ink, fontWeight: '700', marginBottom: normalize(2), fontSize: normalize(isTablet() ? 14 : 12) },
  eventPill: {
    paddingHorizontal: spacing.xs,
    paddingVertical: normalize(2),
    borderRadius: normalize(10),
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
  eventPillText: { color: '#fff', fontSize: normalize(isTablet() ? 12 : 10), fontWeight: '700' },

  // Bottom sheet
  sheet: {
    backgroundColor: '#fff',
    marginTop: spacing.md,
    borderTopLeftRadius: normalize(22),
    borderTopRightRadius: normalize(22),
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  sheetTitle: { textAlign: 'center', fontSize: normalize(isTablet() ? 24 : 20), fontWeight: '900', color: COLORS.ink, marginBottom: spacing.sm },
  sheetCard: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: COLORS.sheetCard,
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    overflow: 'hidden',
  },
  topBar: { height: normalize(6), width: '100%' },
  topBarTeal: { backgroundColor: COLORS.sheetBar1 },
  topBarBlue: { backgroundColor: COLORS.sheetBar2 },
  sheetBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, padding: spacing.md },
  sheetTitleText: { fontSize: normalize(isTablet() ? 18 : 16), fontWeight: '800', color: COLORS.ink, marginBottom: normalize(2) },
  sheetMeta: { fontSize: normalize(isTablet() ? 15 : 13), color: COLORS.inkMute },
  tag: { paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: normalize(14), backgroundColor: COLORS.brand },
  tagText: { color: '#fff', fontWeight: '800' },
});
