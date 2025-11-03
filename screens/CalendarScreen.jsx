// screens/CalendarScreen.jsx
import React, { useState, useEffect } from 'react';
import { ImageBackground, View, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../components/Header';
import CalendarBar from '../components/CalendarBar';
import CalendarView from '../components/CalendarView';
import ListView from '../components/ListView';
import Popup from '../components/PopUp';
import WebViewModal from '../components/WebViewModal';

import { fetchCalendarEvents } from '../services/GoogleCalendarService';

const CalendarScreen = () => {
  const [calendarMode, setCalendarMode] = useState(true); // true = Month, false = Upcoming
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: '' });
  const [events, setEvents] = useState({});
  const [selectedCalendars, setSelectedCalendars] = useState([]);

  const calendarOptions = [
    { key: 'f934159db7dbaebd1b8b4b0fc731f6ea8fbe8ba458e88df53eaf0356186dcb82@group.calendar.google.com', value: 'Pacific Islander Community' },
    { key: '8e898b18eb481bf71ec0ca0206091aa7d7ca9ee4dc136ea57ee36f73bc2bbe66@group.calendar.google.com', value: 'Latino Community' },
  ];

  const callWebView = (url) => {
    if (Platform.OS === 'web') Linking.openURL(url);
    else setModalConfig({ isVisible: true, url });
  };
  const closeModal = () => setModalConfig((p) => ({ ...p, isVisible: false }));

  useEffect(() => {
    async function loadEvents() {
      if (selectedCalendars.length === 0) { setEvents({}); return; }
      const fetched = await fetchCalendarEvents(selectedCalendars);
      const grouped = fetched.reduce((acc, ev) => {
        const startStr = ev.start?.dateTime || ev.start?.date;
        if (!startStr) return acc;
        const key = startStr.split('T')[0];
        const isAllDay = !!ev.start?.date && !ev.start?.dateTime;
        const timeLabel = isAllDay
          ? 'All Day'
          : new Date(ev.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

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

  const handleEventPress = (event) => { setSelectedEvent(event); setPopupVisible(true); };
  const closePopup = () => { setPopupVisible(false); setSelectedEvent(null); };

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground source={require('../assets/basket.jpg')} resizeMode="cover" style={styles.image} blurRadius={0}>
        <Header
          title="PIC Health"
          onPressLanguage={() => {}}
          onPressSubmit={() => callWebView('https://forms.gle/JwAusA65SNBHkdED9')}
        />

        <CalendarBar
          calendarMode={calendarMode}
          setCalendarMode={setCalendarMode}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
        />

        <View style={styles.darken}>
          {calendarMode ? (
            <CalendarView
              events={events}
              selectedCalendars={selectedCalendars}
              callWebView={callWebView}
              closeModal={closeModal}
              onEventPress={handleEventPress}
            />
          ) : (
            <ListView
              onEventPress={handleEventPress}
              events={events}
              selectedCalendars={selectedCalendars}
            />
          )}
        </View>
      </ImageBackground>

      <Popup visible={popupVisible} onClose={closePopup} event={selectedEvent}
        onGoing={() => console.log('Going')} onNotGoing={() => console.log('Not Going')} onMaybe={() => console.log('Maybe')} />

      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} />
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  image: { flex: 1, width: '100%', height: '100%' },
  darken: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },
});
