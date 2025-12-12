// components/CalendarView.jsx
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Popup from './PopUp';
import WebViewModal from './WebViewModal';
import { TranslationContext } from '../context/TranslationContext';
import { normalize, spacing, isTablet, wp, useDimensions } from '../utils/responsive';

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

// Weekday abbreviations and full names are now handled via translation context

const toLocalDate = (iso) => {
  const [y,m,d] = (iso||'').split('-').map(Number);
  return new Date(y,(m||1)-1,d||1);
};

export default function CalendarView({ events, selectedCalendars, callWebView, closeModal, navigation }) {
  const { t } = useContext(TranslationContext);
  const dimensions = useDimensions(); // Force re-render on dimension changes
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
    const selectedDateEvents = (events[day.dateString] || []).sort((a, b) => {
      // All-day events should come first, then sort by time
      const aIsAllDay = !!a.start?.date && !a.start?.dateTime;
      const bIsAllDay = !!b.start?.date && !b.start?.dateTime;
      
      if (aIsAllDay && !bIsAllDay) return -1;
      if (!aIsAllDay && bIsAllDay) return 1;
      if (aIsAllDay && bIsAllDay) return 0; // Both all-day, keep original order
      
      // Both have times, sort by time
      const aTime = a.start?.dateTime ? new Date(a.start.dateTime).getTime() : 0;
      const bTime = b.start?.dateTime ? new Date(b.start.dateTime).getTime() : 0;
      return aTime - bTime;
    });
    if (selectedDateEvents.length > 0) {
      setSelectedEvents(selectedDateEvents);
      setPopupVisible(true);
    }
    setSelectedDate(day.dateString);
  };

  // custom day cell
  const DayCell = ({ date, state }) => {
    const key = date.dateString;
    const list = events[key] || [];
    const eventCount = list.length;
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
        {eventCount > 0 ? (
          <View style={[styles.eventPill, { backgroundColor: pillColor }]}>
            <Text style={styles.eventPillText}>{eventCount}</Text>
          </View>
        ) : null}
      </TouchableOpacity>
    );
  };

  const selectedLabel = useMemo(() => {
    if (!selectedDate) return '';
    const d = toLocalDate(selectedDate);
    const weekdays = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const wd = t(`common.days.${weekdays[d.getDay()]}`);
    const dd = d.getDate();
    return `${t('calendar.upcomingEvents')} ${wd} ${dd}`;
  }, [selectedDate, t]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.containerContent}>
      {/* Edge-to-edge white panel */}
      <View style={styles.whitePanel} onLayout={(e) => setCalWidth(e.nativeEvent.layout.width)}>
        {/* Weekday strip with border & vertical dividers */}
        <View style={styles.weekStripBox}>
          {['sun','mon','tue','wed','thu','fri','sat'].map((d, i) => (
            <View
              key={d}
              style={[styles.weekCellBox, i === 6 && styles.weekCellLast]}
            >
              <Text style={styles.weekText}>{t(`common.dayAbbreviations.${d}`)}</Text>
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
            const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
            const monthName = t(`common.months.${months[d.getMonth()]}`);
            const label = `${monthName} ${d.getFullYear()}`;
            return (
              <View style={styles.header}>
                <Text style={styles.headerTitle}>{label}</Text>
              </View>
            );
          }}
          dayComponent={({ date, state }) => <DayCell date={date} state={state} />}
        />
      </View>



      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} events={selectedEvents} navigation={navigation} />
      <WebViewModal url={''} isVisible={false} onClose={closeModal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, width: '100%' },
  containerContent: { paddingBottom: normalize(16), width: '100%', paddingHorizontal: 0 },

  whitePanel: {
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingVertical: normalize(8),
    paddingHorizontal: 0, // edge-to-edge
    width: '100%',
    alignSelf: 'stretch',
  },

  calendarStyle: { backgroundColor: 'transparent', margin: 0, paddingHorizontal: 0 },

  header: { paddingVertical: normalize(4), alignItems: 'center' },
  headerTitle: { color: COLORS.navyText, fontSize: normalize(isTablet() ? 22 : 18), fontWeight: '800' },

  // Weekday strip — single bordered container with vertical dividers
  weekStripBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    borderRadius: normalize(10),
    overflow: 'hidden',
    marginHorizontal: normalize(4),
    marginBottom: normalize(4),
  },
  weekCellBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: normalize(8),
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
    padding: normalize(4),
    justifyContent: 'flex-start',
  },
  dayCellSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  dayNum: { color: COLORS.ink, fontWeight: '700', marginBottom: normalize(2), fontSize: normalize(isTablet() ? 14 : 12) },
  eventPill: {
    minWidth: normalize(isTablet() ? 24 : 20),
    minHeight: normalize(isTablet() ? 24 : 20),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
    borderRadius: normalize(isTablet() ? 12 : 10),
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventPillText: { color: '#fff', fontSize: normalize(isTablet() ? 12 : 10), fontWeight: '700', textAlign: 'center' },

  // Bottom sheet
  sheet: {
    backgroundColor: '#fff',
    marginTop: normalize(16),
    borderTopLeftRadius: normalize(22),
    borderTopRightRadius: normalize(22),
    paddingTop: normalize(16),
    paddingBottom: normalize(24),
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  sheetTitle: { textAlign: 'center', fontSize: normalize(isTablet() ? 24 : 20), fontWeight: '900', color: COLORS.ink, marginBottom: normalize(8) },
  sheetCard: {
    marginHorizontal: normalize(16),
    marginBottom: normalize(16),
    backgroundColor: COLORS.sheetCard,
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    overflow: 'hidden',
  },
  topBar: { height: normalize(6), width: '100%' },
  topBarTeal: { backgroundColor: COLORS.sheetBar1 },
  topBarBlue: { backgroundColor: COLORS.sheetBar2 },
  sheetBody: { flexDirection: 'row', alignItems: 'center', gap: normalize(8), padding: Platform.OS === 'web' ? normalize(8) : normalize(16) },
  sheetHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(2) },
  sheetCalendarLabel: { fontSize: normalize(10), color: COLORS.inkMute, fontWeight: '600', textAlign: 'right', flex: 0 },
  sheetTitleText: { fontSize: Platform.OS === 'web' ? normalize(14) : normalize(isTablet() ? 18 : 16), fontWeight: '800', color: COLORS.ink, marginBottom: normalize(2) },
  sheetMeta: { fontSize: Platform.OS === 'web' ? normalize(12) : normalize(isTablet() ? 15 : 13), color: COLORS.inkMute },
  tag: { paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(14), backgroundColor: COLORS.brand },
  tagText: { color: '#fff', fontWeight: '800' },
});
