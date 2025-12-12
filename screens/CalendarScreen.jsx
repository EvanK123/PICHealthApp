// screens/CalendarScreen.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  ImageBackground,
  View,
  StyleSheet,
  Linking,
  Platform,
  Text,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { normalize, spacing, isTablet, isSmallPhone, wp, hp, useDimensions } from '../utils/responsive';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import CalendarBar from '../components/CalendarBar';
import CalendarView from '../components/CalendarView';
import ListView from '../components/ListView';
import Popup from '../components/PopUp';
import WebViewModal from '../components/WebViewModal';
import { TranslationContext } from '../context/TranslationContext';
import { fetchCalendarEvents } from '../services/GoogleCalendarService';
import { useAuth } from '../context/AuthContext';



const CalendarScreen = () => {
  const { t } = useContext(TranslationContext);
  const navigation = useNavigation();
  const { user } = useAuth();
  const dimensions = useDimensions(); // Force re-render on dimension changes
  
  const links = require('../locales/config/links.json');
  const calendarsConfig = require('../locales/config/calendars.json');
  const howYaDoin = t('calendar.wellnessButtons.howYaDoin');
  const sos = t('calendar.wellnessButtons.sos');

  // false = Upcoming (default), true = Calendar
  const [calendarMode, setCalendarMode] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalConfig, setModalConfig] = useState({
    isVisible: false,
    url: '',
    title: '',
  });
  const [events, setEvents] = useState({});
  
  // Initialize with default selected calendars
  const getDefaultCalendars = () => {
    return calendarsConfig.calendars
      .filter(cal => cal.defaultSelected)
      .map(cal => cal.id);
  };
  
  const [selectedCalendars, setSelectedCalendars] = useState(getDefaultCalendars());

  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const calendarOptions = calendarsConfig.calendars.map((cal) => ({
    key: cal.id,
    value: t(cal.translationKey),
  }));

  const callWebView = (url, title) => {
    const defaultTitle = title || t('common.browser');
    if (Platform.OS === 'web') Linking.openURL(url);
    else setModalConfig({ isVisible: true, url, title: defaultTitle });
  };

  const closeModal = () =>
    setModalConfig((prev) => ({ ...prev, isVisible: false }));

  useEffect(() => {
    async function loadEvents() {
      if (selectedCalendars.length === 0) {
        setEvents({});
        return;
      }

      const fetched = await fetchCalendarEvents(selectedCalendars);
      const grouped = fetched.reduce((acc, ev) => {
        const startStr = ev.start?.dateTime || ev.start?.date;
        if (!startStr) return acc;

        const key = startStr.split('T')[0];
        const isAllDay = !!ev.start?.date && !ev.start?.dateTime;
        const timeLabel = isAllDay
          ? t('calendar.allDay')
          : new Date(ev.start.dateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

        if (!acc[key]) acc[key] = [];
        acc[key].push({
          name: ev.summary,
          time: timeLabel,
          description:
            ev.description || t('calendar.noDescriptionAvailable'),
          organizer: ev.organizer || {},
          ...ev,
        });
        return acc;
      }, {});
      setEvents(grouped);
    }
    loadEvents();
  }, [selectedCalendars]);

  const handleEventPress = (event) => {
    setSelectedEvent(event);
    setPopupVisible(true);
  };

  const closePopup = () => {
    setPopupVisible(false);
    setSelectedEvent(null);
  };

  const handleProfilePress = () => navigation.navigate('Account');

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        {/* Header: No submit button, no profile button here */}
        <Header
          title={t('calendar.title')}
          avatarUrl={avatarUrl}
          onPressProfile={handleProfilePress}
          showProfile={false}
          showSubmit={false}
        />

        {/* Calendar bar: profile icon to the left of Upcoming/Calendar */}
        <CalendarBar
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
        />

        <View style={styles.darken}>
          {/* Edge-to-edge content: no side padding, no maxWidth */}
          <View style={styles.contentWrapper}>
            {calendarMode ? (
              <>
                <CalendarView
                  events={events}
                  selectedCalendars={selectedCalendars}
                  callWebView={callWebView}
                  closeModal={closeModal}
                  onEventPress={handleEventPress}
                  navigation={navigation}
                />
                <View style={styles.wellnessRow}>
                  <TouchableOpacity
                    onPress={() =>
                      callWebView(
                        links.calendar.wellnessButtons[howYaDoin.linkId],
                        howYaDoin.label
                      )
                    }
                    style={styles.wellnessBtnContainer}
                    activeOpacity={0.85}
                  >
                    <View style={styles.wellnessSOS}>
                      <Text style={styles.middleBtnText}>{howYaDoin.label}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      callWebView(links.calendar.wellnessButtons[sos.linkId], sos.label)
                    }
                    style={styles.wellnessBtnContainer}
                    activeOpacity={0.85}
                  >
                    <View style={styles.wellnessSOS}>
                      <Text style={styles.middleBtnText}>{sos.label}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <>
                <ListView
                  events={events}
                  selectedCalendars={selectedCalendars}
                  setSelectedCalendars={setSelectedCalendars}
                  calendarOptions={calendarOptions}
                  navigation={navigation}
                  callWebView={callWebView}
                />
                {/* Wellness buttons above bottom bar for list view */}
                <View style={styles.wellnessRow}>
                  <TouchableOpacity
                    onPress={() =>
                      callWebView(
                        links.calendar.wellnessButtons[howYaDoin.linkId],
                        howYaDoin.label
                      )
                    }
                    style={styles.wellnessBtnContainer}
                    activeOpacity={0.85}
                  >
                    <View style={styles.wellnessSOS}>
                      <Text style={styles.middleBtnText}>{howYaDoin.label}</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      callWebView(links.calendar.wellnessButtons[sos.linkId], sos.label)
                    }
                    style={styles.wellnessBtnContainer}
                    activeOpacity={0.85}
                  >
                    <View style={styles.wellnessSOS}>
                      <Text style={styles.middleBtnText}>{sos.label}</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </ImageBackground>

      <Popup
        visible={popupVisible}
        onClose={closePopup}
        event={selectedEvent}
        navigation={navigation}
      />
      <WebViewModal
        url={modalConfig.url}
        isVisible={modalConfig.isVisible}
        onClose={closeModal}
        title={modalConfig.title}
      />
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: '100%', height: '100%' },
  darken: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },

  // FULL-WIDTH wrapper (no horizontal padding, no maxWidth)
  contentWrapper: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },

  // Wellness buttons row
  wellnessRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(24),
    marginTop: normalize(8),
    marginBottom: 0,
    paddingBottom: normalize(8),
    width: '100%',
  },
  
  // Submit button container and styles
  submitButtonContainer: {
    paddingHorizontal: normalize(16),
    paddingVertical: isSmallPhone() ? normalize(4) : normalize(8),
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  submitButtonCalendar: {
    backgroundColor: '#0EA5B5',
    paddingHorizontal: normalize(24),
    borderRadius: normalize(10),
    borderWidth: 1,
    borderColor: 'transparent',
    width: normalize(isTablet() ? 160 : 130),
    height: normalize(isTablet() ? 50 : 45),
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: normalize(isTablet() ? 16 : 14),
    fontWeight: '700',
    textAlign: 'center',
    numberOfLines: 1,
  },
  
  // Events tab submit button (pill style)
  submitButtonEvents: {
    backgroundColor: '#0EA5B5',
    paddingHorizontal: normalize(24),
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: 'transparent',
    width: normalize(isTablet() ? 160 : isSmallPhone() ? 110 : 130),
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
  middleBtnText: {
    fontSize: Platform.OS === 'web' ? normalize(12) : normalize(isSmallPhone() ? 14 : isTablet() ? 18 : 16),
    fontWeight: '700',
    color: '#1f2937',
    textAlign: 'center',
  },
});
