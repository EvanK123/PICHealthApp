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
} from 'react-native';
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

// Reusable Wellness Buttons Component
const WellnessButtons = ({ callWebView }) => {
  const { t } = useContext(TranslationContext);
  const links = require('../locales/config/links.json');
  const howYaDoin = t('calendar.wellnessButtons.howYaDoin');
  const sos = t('calendar.wellnessButtons.sos');

  return (
    <View style={styles.middleBtns}>
      <TouchableOpacity
        onPress={() => callWebView(links.calendar.wellnessButtons[howYaDoin.linkId], howYaDoin.label)}
        style={{ flex: 1, alignItems: 'center' }}
        activeOpacity={0.85}
      >
        <View style={styles.wellnessSOS}>
          <Text style={styles.middleBtnText}>{howYaDoin.label}</Text>
        </View>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => callWebView(links.calendar.wellnessButtons[sos.linkId], sos.label)}
        style={{ flex: 1, alignItems: 'center' }}
        activeOpacity={0.85}
      >
        <View style={styles.wellnessSOS}>
          <Text style={styles.middleBtnText}>{sos.label}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const CalendarScreen = () => {
  const { t } = useContext(TranslationContext);
  const navigation = useNavigation();
  const { user } = useAuth();

  // false = Upcoming (default), true = Calendar
  const [calendarMode, setCalendarMode] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: '', title: '' });
  const [events, setEvents] = useState({});
  const [selectedCalendars, setSelectedCalendars] = useState([]);

  const avatarUrl = user?.user_metadata?.avatar_url || null;

  // Load calendar IDs from JSON config
  const calendarsConfig = require('../locales/config/calendars.json');
  const calendarOptions = calendarsConfig.calendars.map(cal => ({
    key: cal.id,
    value: t(cal.translationKey),
  }));

  const callWebView = (url, title) => {
    const defaultTitle = title || t('common.browser');
    if (Platform.OS === 'web') Linking.openURL(url);
    else setModalConfig({ isVisible: true, url, title: defaultTitle });
  };

  const closeModal = () => setModalConfig((prev) => ({ ...prev, isVisible: false }));

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
          ? t('common.allDay')
          : new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (!acc[key]) acc[key] = [];
        acc[key].push({
          name: ev.summary,
          time: timeLabel,
          description: ev.description || t('calendar.noDescriptionAvailable'),
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
        <Header
          title={t('calendar.title')}
          avatarUrl={avatarUrl}
          onPressProfile={handleProfilePress}
        />

        <CalendarBar
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          selectedCalendars={selectedCalendars}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
          onPressSubmit={() => {
            const links = require('../locales/config/links.json');
            callWebView(links.calendar.submitEvent, t('header.submitEvent'));
          }}
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
                <WellnessButtons callWebView={callWebView} />
              </>
            ) : (
              <ListView
               events={events}
               selectedCalendars={selectedCalendars}
               setSelectedCalendars={setSelectedCalendars}
               calendarOptions={calendarOptions}
               navigation={navigation}
              />
            )}
          </View>
        </View>
      </ImageBackground>

      <Popup visible={popupVisible} onClose={closePopup} event={selectedEvent} navigation={navigation} />
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

  // Wellness buttons
  middleBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
    width: '100%',
  },
  wellnessSOS: {
    height: 50,
    width: '95%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.85)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0,0,0,0.06)',
  },
  middleBtnText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1f2937',
  },
});
