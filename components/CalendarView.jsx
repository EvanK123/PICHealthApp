// components/CalendarView.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Popup from './PopUp';
import WebViewModal from './WebViewModal';
import { TranslationContext } from '../context/TranslationContext';
import { useContext } from 'react';

// ===== Navy palette =====
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

// Calendar header theme (month title + arrows)
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

// English day abbreviations (calendar always in English)
const WEEKDAYS_ABBREV = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAYS_FULL = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Parse "YYYY-MM-DD" as LOCAL to avoid UTC shifting a day back
const toLocalDate = (isoDate) => {
  const [y, m, d] = (isoDate || '').split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};

export default function CalendarView({ events, selectedCalendars, callWebView, closeModal }) {
  const { t } = useContext(TranslationContext);
  const [markedDates, setMarkedDates] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  // Compute day-cell size from actual width
  const [calWidth, setCalWidth] = useState(0);
  const CELL_MARGIN = 3;
  const COLUMNS = 7;
  const cellSize = calWidth
    ? Math.floor((calWidth - CELL_MARGIN * 2 * COLUMNS) / COLUMNS)
    : 44;

  const colorFor = (email) => {
    if (email === 'f934159db7dbaebd1b8b4b0fc731f6ea8fbe8ba458e88df53eaf0356186dcb82@group.calendar.google.com') return COLORS.accentPIC;
    if (email === '8e898b18eb481bf71ec0ca0206091aa7d7ca9ee4dc136ea57ee36f73bc2bbe66@group.calendar.google.com') return COLORS.accentLatino;
    return '#BDBDBD';
  };

  // Mark dates + selected day
  useEffect(() => {
    const fm = {};
    Object.keys(events || {}).forEach((date) => {
      const list = events[date] || [];
      const dots = list.slice(0, 3).map((e) => ({ color: colorFor(e.organizer?.email) }));
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

  // Custom day cell
  const DayCell = ({ date, state }) => {
    const key = date.dateString;
    const list = events[key] || [];
    const first = list[0];
    const pillColor = first?.organizer?.email ? colorFor(first.organizer.email) : COLORS.accentPIC;

    return (
      <TouchableOpacity
        onPress={() => handleDayPress(date)}
        style={[
          styles.dayCell,
          { margin: CELL_MARGIN, width: cellSize, height: Math.max(46, Math.round(cellSize * 0.95)) },
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

  // Label with English day name
  const selectedLabel = useMemo(() => {
    if (!selectedDate) return '';
    const d = toLocalDate(selectedDate);
    const dayIndex = d.getDay();
    const wd = WEEKDAYS_FULL[dayIndex];
    const dd = d.getDate();
    return `${t('calendar.upcomingEvents')} ${wd} ${dd}`;
  }, [selectedDate, t]);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 12 }}>
      {/* Full-width white background behind calendar */}
      <View
        style={styles.whitePanel}
        onLayout={(e) => setCalWidth(e.nativeEvent.layout.width)}
      >
        {/* Weekday strip */}
        <View style={styles.weekStrip}>
          {WEEKDAYS_ABBREV.map((d) => (
            <View key={d} style={styles.weekCell}>
              <Text style={styles.weekText}>{d}</Text>
            </View>
          ))}
        </View>

        {/* Calendar grid */}
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
            return <View style={styles.header}><Text style={styles.headerTitle}>{label}</Text></View>;
          }}
          dayComponent={({ date, state }) => <DayCell date={date} state={state} />}
        />
      </View>

      {/* Bottom sheet (unchanged) */}
      {selectedDate && (
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{selectedLabel}</Text>
          {selectedEvents.map((ev) => {
            const isPic = ev.organizer?.email === 'f934159db7dbaebd1b8b4b0fc731f6ea8fbe8ba458e88df53eaf0356186dcb82@group.calendar.google.com';
            const bar = isPic ? styles.topBarTeal : styles.topBarBlue;
            const timeText = ev.start?.date ? 'All Day'
              : new Date(ev.start?.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

            return (
              <View key={ev.id || ev.summary + ev.start?.dateTime} style={styles.sheetCard}>
                <View style={[styles.topBar, bar]} />
                <View style={styles.sheetBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.sheetTitleText}>{ev.summary || '(No title)'}</Text>
                    <Text style={styles.sheetMeta}>{timeText} {ev.location ? `• ${ev.location}` : ''}</Text>
                  </View>
                  <View style={styles.tag}><Text style={styles.tagText}>{isPic ? 'Free' : 'Family'}</Text></View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} events={selectedEvents} />
      <WebViewModal url={''} isVisible={false} onClose={closeModal} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  // Full-width white background container for the calendar
  whitePanel: {
    backgroundColor: '#fff',
    borderRadius: 0,      // edge-to-edge look
    paddingVertical: 8,
    paddingHorizontal: 4, // tiny gutter so pills don't touch edges
  },

  calendarStyle: { backgroundColor: 'transparent' },

  header: { paddingVertical: 6, alignItems: 'center' },
  headerTitle: { color: COLORS.navyText, fontSize: 18, fontWeight: '800' },

  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 2,
    marginBottom: 6,
    backgroundColor: '#fff',        // white to match panel
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    paddingVertical: 6,
    paddingHorizontal: 6,
  },
  weekCell: { flex: 1, alignItems: 'center' },
  weekText: { fontSize: 12, fontWeight: '800', color: COLORS.navyText },

  // Day cells
  dayCell: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    backgroundColor: '#fff',
    padding: 6,
    justifyContent: 'flex-start',
  },
  dayCellSelected: { borderColor: COLORS.primary, borderWidth: 2 },
  dayNum: { color: COLORS.ink, fontWeight: '700', marginBottom: 2, fontSize: 12 },
  eventPill: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', maxWidth: '100%' },
  eventPillText: { color: '#fff', fontSize: 11, fontWeight: '700' },

  // Bottom sheet
  sheet: {
    backgroundColor: '#fff',
    marginTop: 12,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingTop: 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -2 },
    elevation: 6,
  },
  sheetTitle: { textAlign: 'center', fontSize: 20, fontWeight: '900', color: COLORS.ink, marginBottom: 8 },
  sheetCard: { marginHorizontal: 14, marginBottom: 12, backgroundColor: COLORS.sheetCard, borderRadius: 14, borderWidth: 1, borderColor: COLORS.panelBorder, overflow: 'hidden' },
  topBar: { height: 6, width: '100%' },
  topBarTeal: { backgroundColor: COLORS.sheetBar1 },
  topBarBlue: { backgroundColor: COLORS.sheetBar2 },
  sheetBody: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  sheetTitleText: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginBottom: 2 },
  sheetMeta: { fontSize: 13, color: COLORS.inkMute },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.brand },
  tagText: { color: '#fff', fontWeight: '800' },
});
