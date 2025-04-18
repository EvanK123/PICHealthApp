import React, { useState, useEffect } from 'react';
import { ImageBackground, View, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListView from '../components/ListView';
import CalendarView from '../components/CalendarView';
import Popup from '../components/PopUp';
import CalendarBar from '../components/CalendarBar'; 
import WebViewModal from '../components/WebViewModal';

// new way to get calendar events with supabase
import {getEvents} from '../services/SupabaseEventServices';

const CalendarScreen = () => {
  // Track state of Calendar, True = Calendar View, False = List View
  const [calendarMode, setCalendarMode] = useState(true);
  // State for when an event is pressed and the Pop up is called
  const [popupVisible, setPopupVisible] = useState(false);
  // Event that is being selected for the Popup
  const [selectedEvent, setSelectedEvent] = useState(null);
  // State for WebView stuff. isVisible is when to show the browser,
  // url is the link that the browser is opening to
  const [modalConfig, setModalConfig] = useState({isVisible: false, url: ''});

  // Events that are loaded from the calendar
  const [events, setEvents] = useState({});
  // What calendars are being selected to fill the events state
  const [selectedCalendars, setSelectedCalendars] = useState([]);

  // Calendar Information. Key is the email related to the calendear,
  // value is the name that's to be displayed for it in the dropdown
  const calendarOptions = [
    {   key: 'Pacific Islander Community', value: 'Pacific Islander Community'},
    {   value: 'Latino Community', value: 'Latino Community' }
  ];

  const callWebView = (url) => {
    Platform.OS === 'web' ? 
      Linking.openURL(url) :
      setModalConfig({
        isVisible: true,
        url: url
      });
  };

  const closeModal = () => {
    setModalConfig(prev => ({
      ...prev,
      isVisible: false
    }));
  };

  // Used for fetching the events from the calendar api
  useEffect(() => {
    async function loadEvents() {
      if (selectedCalendars.length === 0) {
        setEvents({});
        return;
      }

      console.log('Selected calendars:', selectedCalendars);
      const allEvents = await getEvents();
      console.log('All events before filtering:', allEvents);

      const filtered = allEvents.filter(event => selectedCalendars.includes(event.community));
      console.log('Filtered events:', filtered);

      const formattedEvents = filtered.reduce((acc, event) => {
        const date = event.date.split('T')[0];
        if (!acc[date]) acc[date] = [];

        acc[date].push({
          name: event.title,
          time: event.time || 'All Day',
          description: event.description || 'No description available',
          ...event
        });

        return acc;
      }, {});

      console.log('Final formatted events:', formattedEvents);
      setEvents(formattedEvents);
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

  return (
    <SafeAreaView edges={['top']} style={styles.container}>
      <ImageBackground
        source={require('../assets/basket.jpg')}
        resizeMode='cover'
        style={styles.image}
        blurRadius={0}
      >
        <CalendarBar
          calendarMode={calendarMode}
          callWebView={callWebView}
          setCalendarMode={setCalendarMode}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
        />
          <View style={styles.darken}>
            {calendarMode //Checks calendar mode to load proper component
            ?
              <CalendarView
                onEventPress={handleEventPress}
                events={events}
                selectedCalendars={selectedCalendars}
                callWebView={callWebView}
                closeModal={closeModal}
              />
            : <ListView 
                onEventPress={handleEventPress}
                events={events}
                selectedCalendars={selectedCalendars}
              />}
          </View>
      </ImageBackground>
      <Popup 
        visible={popupVisible} 
        onClose={closePopup} 
        event={selectedEvent} 
        onGoing={() => console.log('Going')} 
        onNotGoing={() => console.log('Not Going')} 
        onMaybe={() => console.log('Maybe')} 
      />

      {/*Web Browser*/}
      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} />
    </SafeAreaView>
  );
};

export default CalendarScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darken: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});
