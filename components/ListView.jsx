// components/ListView.jsx
import React, { useMemo, useState, useContext } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Popup from './PopUp';
import { TranslationContext } from '../context/TranslationContext';
import { MultipleSelectList } from 'react-native-dropdown-select-list';

const COLORS = {
  bannerBg: 'hsla(200, 0%, 20%, 0.6)',
  sheetCard: '#f8fafc',
  panelBorder: '#E5EAF0',
  sheetBar1: '#10A6A6', // PIC
  sheetBar2: '#0E7CA8', // Latino
  ink: '#0f172a',
  inkMute: '#475569',
};

const Banner = ({ title, onPrev, onNext }) => (
  <View style={styles.bannerWrap}>
    <TouchableOpacity onPress={onPrev} style={styles.navBtn}><Text style={styles.navBtnText}>{'<'}</Text></TouchableOpacity>
    <Text style={styles.bannerTitle} numberOfLines={1}>{title}</Text>
    <TouchableOpacity onPress={onNext} style={styles.navBtn}><Text style={styles.navBtnText}>{'>'}</Text></TouchableOpacity>
  </View>
);

const ListView = ({
  events,
  selectedCalendars,
  setSelectedCalendars,
  calendarOptions, // pass from CalendarScreen
}) => {
  const { t } = useContext(TranslationContext);
  const calendarsConfig = require('../locales/calendars.json');

  const getColorForCalendar = (email) => {
    const cal = calendarsConfig.calendars.find(c => c.id === email);
    return cal?.color || '#0B75B9';
  };
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Visible month controls (default: now)
  const now = new Date();
  const [visibleYear, setVisibleYear]   = useState(now.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(now.getMonth() + 1); // 1-12

  const monthLabel = useMemo(
    () => new Date(visibleYear, visibleMonth - 1, 1).toLocaleString('default', { month: 'long', year: 'numeric' }),
    [visibleYear, visibleMonth]
  );

  // Flatten -> filter to visible month -> single section
  const sortedEventsArray = useMemo(() => {
    const all = [];
    const startOfVisible = new Date(visibleYear, visibleMonth - 1, 1);
    const endOfVisible   = new Date(visibleYear, visibleMonth, 0, 23, 59, 59);

    Object.values(events || {}).forEach(dayList => {
      (dayList || []).forEach(item => {
        const s = new Date(item.start.dateTime || item.start.date);
        const e = new Date(item.end?.dateTime || item.end?.date || item.start.dateTime || item.start.date);
        if (e >= startOfVisible && s <= endOfVisible) {
          all.push(item);
        }
      });
    });

    const data = all.sort((a, b) =>
      new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date)
    );

    return data.length ? [{ title: monthLabel, data }] : [];
  }, [events, visibleYear, visibleMonth, monthLabel]);

  const hasEvents = sortedEventsArray.length > 0;

  const bannerTitle = hasEvents
    ? `${monthLabel} — ${t('calendar.upcomingEvents') || 'Upcoming Events'}`
    : `${monthLabel} — ${t('calendar.messages.noEventsAvailable') || 'No upcoming events'}`;

  const handleEventPress = (item) => {
    setSelectedEvents([item]);
    setPopupVisible(true);
  };

  const goPrevMonth = () => {
    const m = visibleMonth - 1;
    if (m < 1) { setVisibleMonth(12); setVisibleYear(visibleYear - 1); }
    else { setVisibleMonth(m); }
  };
  const goNextMonth = () => {
    const m = visibleMonth + 1;
    if (m > 12) { setVisibleMonth(1); setVisibleYear(visibleYear + 1); }
    else { setVisibleMonth(m); }
  };

  return (
    <View style={styles.container}>
      {/* Calendar selector also in Upcoming tab */}
      <View style={styles.selectorWrap}>
        <MultipleSelectList
          setSelected={setSelectedCalendars}
          data={calendarOptions || []}
          save="key"
          label={t('calendar.selectCalendar')}
          placeholder={t('calendar.selectCalendar')}
          dropdownStyles={styles.dropdown}
          boxStyles={styles.dropdownBox}
        />
      </View>

      <Banner title={bannerTitle} onPrev={goPrevMonth} onNext={goNextMonth} />

      {selectedCalendars.length === 0 ? (
        <Text style={styles.noEventsText}>{t('calendar.messages.pleaseSelectCalendar')}</Text>
      ) : hasEvents ? (
        <SectionList
          stickySectionHeadersEnabled
          sections={sortedEventsArray}
          keyExtractor={(item) => item.id}
          style={styles.sectionList}
          renderItem={({ item }) => {
            const barColor = getColorForCalendar(item.organizer?.email);
            const timeText = item.start?.date
              ? (t('calendar.allDay') || 'All day')
              : new Date(item.start?.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            return (
              <TouchableOpacity style={styles.card} onPress={() => handleEventPress(item)} activeOpacity={0.9}>
                <View style={[styles.topBar, { backgroundColor: barColor }]} />
                <View style={styles.cardBody}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.cardTitle}>{item.summary || t('calendar.noTitle')}</Text>
                    <Text style={styles.cardMeta}>
                      {timeText}
                      {item.location ? ` • ${item.location}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          // We already show the month in the banner, but keep header for screen readers / structure
          renderSectionHeader={({ section: { title } }) => (
            <Text accessible accessibilityRole="header" style={styles.visuallyHidden}>{title}</Text>
          )}
        />
      ) : (
        <Text style={styles.noEventsText}>
          {t('calendar.messages.noEventsAvailable') || 'No upcoming events'}
        </Text>
      )}

      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} events={selectedEvents} />
    </View>
  );
};

export default ListView;

const styles = StyleSheet.create({
  container: { flex: 1, paddingVertical: 16, width: '100%' },

  // selector
  selectorWrap: { backgroundColor: '#2d4887' },
  dropdown: { backgroundColor: '#fff', borderRadius: 0, marginTop: 0, marginBottom: 10 },
  dropdownBox: { backgroundColor: '#fff', borderColor: '#fff', borderRadius: 0 },

  // month banner
  bannerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.bannerBg,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 10,
  },
  bannerTitle: { flex: 1, textAlign: 'center', color: 'white', fontSize: 18, fontWeight: 'bold' },
  navBtn: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16, backgroundColor: 'rgba(255,255,255,0.15)' },
  navBtnText: { color: 'white', fontSize: 16, fontWeight: '700' },

  // list + cards (match CalendarView sheet cards)
  sectionList: { width: '100%' },

  card: {
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
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: COLORS.ink, marginBottom: 2 },
  cardMeta: { fontSize: 13, color: COLORS.inkMute },

  tag: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 14, backgroundColor: COLORS.sheetBar1 },
  tagText: { color: '#fff', fontWeight: '800' },

  // accessibility-only month header (hidden visually)
  visuallyHidden: {
    position: 'absolute',
    width: 1, height: 1, margin: -1, padding: 0, borderWidth: 0,
    overflow: 'hidden', clipPath: 'inset(50%)',
  },

  noEventsText: { fontSize: 16, color: '#cbd5e1', textAlign: 'center', marginTop: 16 },
});
