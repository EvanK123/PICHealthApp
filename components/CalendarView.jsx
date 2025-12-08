// components/CalendarView.jsx
import React, { useEffect, useState, useMemo, useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Calendar } from 'react-native-calendars';
import Popup from './PopUp';
import WebViewModal from './WebViewModal';
import { TranslationContext } from '../context/TranslationContext';

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
  const calendarsConfig = require('../locales/calendars.json');
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
  const CELL_MARGIN = 2;
  const COLUMNS = 7;
  const cellSize = calWidth
    ? Math.floor((calWidth - CELL_MARGIN * 2 * COLUMNS) / COLUMNS)
    : 46;



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
  containerContent: { paddingBottom: 12, width: '100%', paddingHorizontal: 0 },

  whitePanel: {
    backgroundColor: '#fff',
    borderRadius: 0,
    paddingVertical: 8,
    paddingHorizontal: 0, // edge-to-edge
    width: '100%',
    alignSelf: 'stretch',
  },

  calendarStyle: { backgroundColor: 'transparent', margin: 0, paddingHorizontal: 0 },

  header: { paddingVertical: 6, alignItems: 'center' },
  headerTitle: { color: COLORS.navyText, fontSize: 18, fontWeight: '800' },

  // Weekday strip — single bordered container with vertical dividers
  weekStripBox: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: COLORS.navyBorder,
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 6,
    marginBottom: 6,
  },
  weekCellBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    borderRightWidth: 1,
    borderRightColor: COLORS.navyBorder,
  },
  weekCellLast: { borderRightWidth: 0 },
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
  eventPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
    maxWidth: '100%',
  },
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
  sheetCard: {
    marginHorizontal: 14,
    marginBottom: 12,
    backgroundColor: COLORS.sheetCard,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    overflow: 'hidden',
  },
  topBar: { height: 6, width: '100%' },
  topBarTeal: { backgroundColor: COLORS.sheetBar1 },
  topBarBlue: { backgroundColor: COLORS.sheetBar2 },
  sheetBody: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  sheetTitleText: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginBottom: 2 },
  sheetMeta: { fontSize: 13, color: COLORS.inkMute },
  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.brand },
  tagText: { color: '#fff', fontWeight: '800' },
});
