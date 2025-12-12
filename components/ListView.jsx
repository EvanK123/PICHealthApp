// components/ListView.jsx
import React, { useMemo, useState, useContext } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Popup from './PopUp';
import { TranslationContext } from '../context/TranslationContext';
import CalendarSelector from './CalendarSelector';
import { normalize, spacing, isTablet, isSmallPhone, useDimensions } from '../utils/responsive';

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
    <TouchableOpacity onPress={onPrev} style={styles.navBtn}>
      <Text style={styles.navBtnText} adjustsFontSizeToFit numberOfLines={1}>{'<'}</Text>
    </TouchableOpacity>
    <Text style={styles.bannerTitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>{title}</Text>
    <TouchableOpacity onPress={onNext} style={styles.navBtn}>
      <Text style={styles.navBtnText} adjustsFontSizeToFit numberOfLines={1}>{'>'}</Text>
    </TouchableOpacity>
  </View>
);

const ListView = ({
  events,
  selectedCalendars,
  setSelectedCalendars,
  calendarOptions,
  navigation,
  callWebView,
}) => {
  const { t } = useContext(TranslationContext);
  const dimensions = useDimensions(); // Force re-render on dimension changes
  const calendarsConfig = require('../locales/config/calendars.json');

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
  const [hidePastEvents, setHidePastEvents] = useState(true);

  const monthLabel = useMemo(() => {
    const months = ['january', 'february', 'march', 'april', 'may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
    const monthName = t(`common.months.${months[visibleMonth - 1]}`);
    return `${monthName} ${visibleYear}`;
  }, [visibleYear, visibleMonth, t]);

  // Flatten -> filter to visible month -> single section
  const sortedEventsArray = useMemo(() => {
    const all = [];
    const startOfVisible = new Date(visibleYear, visibleMonth - 1, 1);
    const endOfVisible   = new Date(visibleYear, visibleMonth, 0, 23, 59, 59);
    const currentTime = new Date();

    Object.values(events || {}).forEach(dayList => {
      (dayList || []).forEach(item => {
        const s = new Date(item.start.dateTime || item.start.date);
        const e = new Date(item.end?.dateTime || item.end?.date || item.start.dateTime || item.start.date);
        
        // Check if event is in visible month
        if (e >= startOfVisible && s <= endOfVisible) {
          // If hiding past events, filter out events that have ended
          if (hidePastEvents && e < currentTime) {
            return; // Skip this event
          }
          all.push(item);
        }
      });
    });

    const data = all.sort((a, b) =>
      new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date)
    );

    return data.length ? [{ title: monthLabel, data }] : [];
  }, [events, visibleYear, visibleMonth, monthLabel, hidePastEvents]);

  const hasEvents = sortedEventsArray.length > 0;

  const bannerTitle = hasEvents
    ? monthLabel
    : monthLabel;

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
      <CalendarSelector
        selectedCalendars={selectedCalendars}
        setSelectedCalendars={setSelectedCalendars}
        calendarOptions={calendarOptions || []}
      />
      
      <Banner title={bannerTitle} onPrev={goPrevMonth} onNext={goNextMonth} />
      
      {/* Hide past events toggle */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => setHidePastEvents(!hidePastEvents)}
          activeOpacity={0.7}
        >
          <Text style={styles.toggleText}>
            <Text style={hidePastEvents ? styles.checkmark : {}}>
              {hidePastEvents ? '✓' : '☐'}
            </Text> {t('calendar.hidePastEvents')}
          </Text>
        </TouchableOpacity>
      </View>

      {hasEvents ? (
        <SectionList
          stickySectionHeadersEnabled
          sections={sortedEventsArray}
          keyExtractor={(item) => item.id}
          style={styles.sectionList}
          renderItem={({ item }) => {
            const barColor = getColorForCalendar(item.organizer?.email);
            const eventDate = new Date(item.start?.dateTime || item.start?.date);
            const dateText = eventDate.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
            const timeText = item.start?.date
              ? t('calendar.allDay')
              : eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            const calendarConfig = calendarsConfig.calendars.find(c => c.id === item.organizer?.email);
            const calendarName = calendarConfig ? t(calendarConfig.translationKey) : t('common.somethingWentWrong');

            return (
              <TouchableOpacity style={styles.card} onPress={() => handleEventPress(item)} activeOpacity={1.0}>
                <View style={[styles.topBar, { backgroundColor: barColor }]} />
                <View style={styles.cardBody}>
                  <View style={{ flex: 1 }}>
                    <View style={styles.cardHeader}>
                      <Text style={styles.cardTitle} numberOfLines={1} ellipsizeMode="tail" adjustsFontSizeToFit minimumFontScale={0.7}>{item.summary || t('calendar.noTitle')}</Text>
                      <Text style={styles.calendarLabel}>{calendarName}</Text>
                    </View>
                    <Text style={styles.cardMeta}>
                      {dateText} • {timeText}
                      {item.location ? ` • ${item.location}` : ''}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
          ListFooterComponent={() => (
            <View style={styles.submitButtonContainer}>
              <TouchableOpacity
                style={styles.submitButtonEvents}
                onPress={() => {
                  const links = require('../locales/config/links.json');
                  callWebView(links.calendar.submitEvent, t('header.submitEvent'));
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.submitButtonEventsText}>{t('header.submitEvent')}</Text>
              </TouchableOpacity>
            </View>
          )}
          // We already show the month in the banner, but keep header for screen readers / structure
          renderSectionHeader={({ section: { title } }) => (
            <Text accessible accessibilityRole="header" style={styles.visuallyHidden}>{title}</Text>
          )}
        />
      ) : (
        <Text style={styles.noEventsText}>
          {selectedCalendars.length === 0 
            ? t('calendar.messages.pleaseSelectCalendar')
            : t('calendar.messages.noEventsAvailable')
          }
        </Text>
      )}



      <Popup visible={popupVisible} onClose={() => setPopupVisible(false)} events={selectedEvents} navigation={navigation} />
    </View>
  );
};

export default ListView;

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 0, paddingBottom: normalize(8), width: '100%' },

  // month banner
  bannerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2d4887',
    paddingHorizontal: normalize(24),
    paddingVertical: isSmallPhone() ? normalize(4) : normalize(16),
    paddingBottom: normalize(8),
    marginBottom: 0,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  bannerTitle: { 
    flex: 1, 
    textAlign: 'center', 
    color: '#ffffff', 
    fontSize: normalize(isTablet() ? 22 : isSmallPhone() ? 16 : 20), 
    fontWeight: '800'
  },
  navBtn: { 
    paddingHorizontal: normalize(16), 
    paddingVertical: normalize(4), 
    borderRadius: normalize(14), 
    backgroundColor: 'rgba(255,255,255,0.12)',
    minWidth: normalize(isTablet() ? 48 : 40),
    height: normalize(isTablet() ? 40 : 32),
    alignItems: 'center',
    justifyContent: 'center'
  },
  navBtnText: { 
    color: '#ffffff', 
    fontSize: normalize(isTablet() ? 20 : 18), 
    fontWeight: '700',
    textAlign: 'center'
  },

  // list + cards (match CalendarView sheet cards)
  sectionList: { width: '100%' },

  card: {
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
  cardBody: { flexDirection: 'row', alignItems: 'center', gap: normalize(8), padding: Platform.OS === 'web' ? normalize(8) : normalize(16) },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: normalize(2) },
  calendarLabel: { fontSize: normalize(10), color: COLORS.inkMute, fontWeight: '600', textAlign: 'right', flex: 0 },
  cardTitle: { 
    fontSize: Platform.OS === 'web' ? normalize(16) : normalize(isTablet() ? 22 : 20), 
    fontWeight: '800', 
    color: COLORS.ink, 
    marginBottom: normalize(2) 
  },
  cardMeta: { 
    fontSize: Platform.OS === 'web' ? normalize(14) : normalize(isTablet() ? 18 : 16), 
    color: COLORS.inkMute 
  },

  tag: { paddingHorizontal: normalize(8), paddingVertical: normalize(4), borderRadius: normalize(14), backgroundColor: COLORS.sheetBar1 },
  tagText: { 
    color: '#fff', 
    fontWeight: '800',
    fontSize: normalize(isTablet() ? 16 : 14),
    textAlign: 'center'
  },

  // accessibility-only month header (hidden visually)
  visuallyHidden: {
    position: 'absolute',
    width: 1, height: 1, margin: -1, padding: 0, borderWidth: 0,
    overflow: 'hidden', clipPath: 'inset(50%)',
  },

  noEventsText: { 
    fontSize: normalize(isTablet() ? 22 : 20), 
    color: '#cbd5e1', 
    textAlign: 'center', 
    marginTop: spacing.lg 
  },

  // Wellness buttons
  submitButtonContainer: {
    paddingVertical: normalize(16),
  },
  submitButtonEvents: {
    backgroundColor: '#0EA5B5',
    paddingHorizontal: normalize(24),
    borderRadius: normalize(14),
    borderWidth: 1,
    borderColor: 'transparent',
    marginHorizontal: normalize(16),
    height: normalize(isTablet() ? 52 : isSmallPhone() ? 36 : 44),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonEventsText: {
    color: '#ffffff',
    fontSize: normalize(isTablet() ? 16 : 14),
    fontWeight: '700',
    textAlign: 'center',
    numberOfLines: 1,
  },
  wellnessBtnContainer: {
    flex: 1,
    alignItems: 'center',
  },
  wellnessSOS: {
    height: normalize(isTablet() ? 50 : 45),
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(10),
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  wellnessBtnText: {
    fontSize: normalize(isSmallPhone() ? 14 : isTablet() ? 18 : 16),
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
  
  // Toggle styles
  toggleContainer: {
    paddingHorizontal: normalize(16),
    paddingTop: normalize(4),
    paddingBottom: normalize(16),
    backgroundColor: 'transparent',
  },
  toggleButton: {
    alignSelf: 'flex-start',
  },
  toggleText: {
    color: '#ffffff',
    fontSize: normalize(14),
    fontWeight: '600',
  },
  checkmark: {
    color: '#0EA5B5',
  },
});
