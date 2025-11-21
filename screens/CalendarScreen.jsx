// screens/CalendarScreen.jsx
import React, { useState, useEffect } from 'react';
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
import { useContext } from 'react';
import { getAppImage } from '../utils/imageLoader';

import { fetchCalendarEvents } from '../services/GoogleCalendarService';
import { useAuth } from '../context/AuthContext';

// Reusable Wellness Buttons Component
const WellnessButtons = ({ callWebView }) => {
  const { t } = useContext(TranslationContext);
  const links = require('../locales/links.json');
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
  
  // Get avatar URL from user metadata if available
  const avatarUrl = user?.user_metadata?.avatar_url || null;

  const calendarOptions = [
    {
      key: 'f934159db7dbaebd1b8b4b0fc731f6ea8fbe8ba458e88df53eaf0356186dcb82@group.calendar.google.com',
      value: t('calendar.calendarOptions.pacificIslander'),
    },
    {
      key: '8e898b18eb481bf71ec0ca0206091aa7d7ca9ee4dc136ea57ee36f73bc2bbe66@group.calendar.google.com',
      value: t('calendar.calendarOptions.latino'),
    },
  ];

  const callWebView = (url, title = "Browser") => {
    if (Platform.OS === 'web') Linking.openURL(url);
    else setModalConfig({ isVisible: true, url, title });
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
          ? t('common.allDay')
          : new Date(ev.start.dateTime).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            });

        if (!acc[key]) acc[key] = [];

        acc[key].push({
          name: ev.summary,
          time: timeLabel,
          description: ev.description || 'No description available',
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

  const handleProfilePress = () => {
    navigation.navigate('Account');
  };

  const backgroundImage = getAppImage('background');
  
  // Add debug logging
  React.useEffect(() => {
    console.log('[CalendarScreen] Background image:', backgroundImage);
    console.log('[CalendarScreen] User:', user);
    console.log('[CalendarScreen] Avatar URL:', avatarUrl);
  }, [backgroundImage, user, avatarUrl]);

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground 
        source={backgroundImage || require('../assets/background.png')} 
        resizeMode="cover" 
        style={styles.image} 
        blurRadius={0}
      >
        <Header
          title={t('calendar.title')}
          showSubmit
          onPressSubmit={() => {
            const links = require('../locales/links.json');
            callWebView(links.calendar.submitEvent, t('header.submitEvent'));
          }}
        />

        <CalendarBar
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
          onPressProfile={handleProfilePress}
          avatarUrl={avatarUrl}
        />

        <View style={styles.darken}>
          {calendarMode ? (
            <>
              <CalendarView
                events={events}
                selectedCalendars={selectedCalendars}
                callWebView={callWebView}
                closeModal={closeModal}
                onEventPress={handleEventPress}
              />

              {/* Wellness + SOS UNDER the calendar (Calendar view only) */}
              <View style={styles.middleBtns}>
                <TouchableOpacity
                  onPress={() =>
                    callWebView(
                      'https://www.healthcentral.com/quiz/stress-test'
                    )
                  }
                  style={{ flex: 1, alignItems: 'center' }}
                  activeOpacity={0.85}
                >
                  <View style={styles.wellnessSOS}>
                    <Text style={styles.middleBtnText}>How ya doin' 👋</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => callWebView('https://www.cavshate.org/')}
                  style={{ flex: 1, alignItems: 'center' }}
                  activeOpacity={0.85}
                >
                  <View style={styles.wellnessSOS}>
                    <Text style={styles.middleBtnText}>SOS ⚠️</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <ListView
              onEventPress={handleEventPress}
              events={events}
              selectedCalendars={selectedCalendars}
            />
          )}
        </View>
      </ImageBackground>

      <Popup
        visible={popupVisible}
        onClose={closePopup}
        event={selectedEvent}
      />

      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} title={modalConfig.title} />
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: '100%', height: '100%' },
  darken: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },

  middleBtns: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: 12,
    paddingHorizontal: 12,
    marginTop: 12,
    marginBottom: 8,
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
