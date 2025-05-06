import React, { useState, useEffect } from 'react';
import { ImageBackground, View, StyleSheet, Linking, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ListView from '../components/ListView';
import CalendarView from '../components/CalendarView';
import Popup from '../components/PopUp';
import CalendarBar from '../components/CalendarBar';
import WebViewModal from '../components/WebViewModal';
import { supabase } from '../supabase';

// Import calendar events from supabase service
import { getEvents } from '../services/SupabaseEventServices';

const CalendarScreen = ({ isGuest }) => {
  // Toggle between Calendar view (True) and List view (False)
  const [calendarMode, setCalendarMode] = useState(true);

  // Popup related states
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  // WebView modal state
  const [modalConfig, setModalConfig] = useState({ isVisible: false, url: '' });

  // Events fetched from backend
  const [events, setEvents] = useState({});

  // Which calendars are selected (filters)
  const [selectedCalendars, setSelectedCalendars] = useState([]);

  // Calendar Information. Key is the email related to the calendar
  //Value is the names that will be displayed for it in the dropdown
  const calendarOptions = [
    { key: 'Pacific Islander', value: 'Pacific Islander Community' },
    { key: 'Latino', value: 'Latino Community' }
  ];

  // Fetch user's community and set initial selected calendar
  useEffect(() => {
    const fetchUserCommunity = async () => {
      if (isGuest) {
        // For guests, default to Pacific Islander
        setSelectedCalendars(['Pacific Islander']);
        return;
      }

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          console.log('No user found, defaulting to Pacific Islander');
          setSelectedCalendars(['Pacific Islander']);
          return;
        }

        const { data: profile, error } = await supabase
          .from('profiles')
          .select('communities')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          setSelectedCalendars(['Pacific Islander']);
          return;
        }

        if (profile?.communities) {
          // Map the community value to the calendar key
          const communityKey = profile.communities === 'Pacific Islander Community' ? 'Pacific Islander' :
                             profile.communities === 'Latino Community' ? 'Latino' :
                             'Pacific Islander';
          
          console.log('Setting initial calendar to:', communityKey);
          setSelectedCalendars([communityKey]);
        } else {
          console.log('No community found in profile, defaulting to Pacific Islander');
          setSelectedCalendars(['Pacific Islander']);
        }
      } catch (error) {
        console.error('Error in fetchUserCommunity:', error);
        setSelectedCalendars(['Pacific Islander']);
      }
    };

    fetchUserCommunity();
  }, [isGuest]);

  // Handle URL links (open externally or in app browser)
  const callWebView = (url) => {
    Platform.OS === 'web'
      ? Linking.openURL(url)
      : setModalConfig({ isVisible: true, url });
  };

  const closeModal = () => {
    setModalConfig(prev => ({ ...prev, isVisible: false }));
  };

  // Fetch and filter events based on selected calendars
  useEffect(() => {
    async function loadEvents() {
      // If no calendars are selected, clear events
      if (selectedCalendars.length === 0) {
        setEvents({});
        return;
      }

      // Load all events from the database
      const allEvents = await getEvents();
      console.log('All events:', allEvents);
      console.log('Selected calendars:', selectedCalendars);

      // Filter events by selected calendars
      const filtered = allEvents.filter(event => {
        console.log('Checking event:', event.title, 'community:', event.community);
        return selectedCalendars.includes(event.community);
      });
      console.log('Filtered events:', filtered);

      // Group events by date
      const formattedEvents = filtered.reduce((acc, event) => {
        const date = event.date;
        if (!acc[date]) acc[date] = [];

        acc[date].push({
          name: event.title,
          time: event.time || 'All Day',
          description: event.description || 'No description available',
          ...event
        });

        return acc;
      }, {});

      console.log('Formatted events:', formattedEvents);
      setEvents(formattedEvents);
    }

    loadEvents();
  }, [selectedCalendars]);

  // When event is pressed, show popup
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
        {/* Calendar toolbar and filters */}
        <CalendarBar
          calendarMode={calendarMode}
          callWebView={callWebView}
          setCalendarMode={setCalendarMode}
          setSelectedCalendars={setSelectedCalendars}
          calendarOptions={calendarOptions}
          isGuest={isGuest}
          selectedCalendars={selectedCalendars}
        />

        <View style={styles.darken}>
          {/* Switch between Calendar and List views */}
          {calendarMode ? (
            <CalendarView
              onEventPress={handleEventPress}
              events={events}
              selectedCalendars={selectedCalendars}
              callWebView={callWebView}
              closeModal={closeModal}
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

      {/* Event details popup */}
      <Popup 
        visible={popupVisible}
        onClose={closePopup}
        event={selectedEvent}
        onGoing={() => console.log('Going')}
        onNotGoing={() => console.log('Not Going')}
        onMaybe={() => console.log('Maybe')}
        isGuest={isGuest}
      />

      {/* In-app web browser */}
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
