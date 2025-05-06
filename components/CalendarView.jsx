import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Linking, Platform } from 'react-native';
import { Calendar } from 'react-native-calendars';
import RenderHTML from 'react-native-render-html';
import Popup from './PopUp'; // Make sure to import the Popup component
import WebViewModal from './WebViewModal';

const CalendarView = ({ events, selectedCalendars, callWebView, closeModal }) => {
  const [markedDates, setMarkedDates] = useState({});
  const [popupVisible, setPopupVisible] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);

  // url is the link that the browser is opening to
  const [modalConfig, setModalConfig] = useState({isVisible: false, url: ''});

  // Helper function to add days
  const addDays = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  };

  // Open links in description
  const handleLinkPress = (event, href) => {
    //Linking.openURL(href).catch(err => console.error('Failed to open URL:', err));
    callWebView(href);
  };

  // Format description HTML to add <br> before links
  const formattedDescription = (description) => {
    return description.replace(/<a /g, '<br><a '); // adds <br> before each <a> tag to move links to new line
  };

  // Format and mark events on the calendar
  useEffect(() => {
    const formatEvents = (events) => {
      const calendarColors = {
        'Pacific Islander': '#0B75B9',
        'Latino': '#71AD45',
      };

      const formattedEvents = Object.keys(events).reduce((acc, date) => {
        const eventList = events[date];
        const dots = eventList.map(event => {
          const color = calendarColors[event.community] || 'gray';
          return { color };
        });

        acc[date] = { dots };
        return acc;
      }, {});

      return formattedEvents;
    };

    if (selectedCalendars.length > 0) {
      const formattedEvents = formatEvents(events);
      console.log('Marked dates:', formattedEvents);
      setMarkedDates(formattedEvents);
    } else {
      setMarkedDates({});
    }
  }, [events, selectedCalendars]);

  // Filter upcoming events within the next 7 days
  useEffect(() => {
    const filterUpcomingEvents = () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to start of day
      const upcomingEventsList = [];
      
      if (events && typeof events === 'object') {
        Object.entries(events).forEach(([date, eventsOnDate = []]) => {
          if (Array.isArray(eventsOnDate)) {
            eventsOnDate.forEach(event => {
              const eventDate = new Date(date);
              eventDate.setHours(0, 0, 0, 0); // Set to start of day
              
              // Include all future events
              if (eventDate >= today) {
                console.log('Adding event to upcoming:', event.title, 'date:', date);
                upcomingEventsList.push({
                  ...event,
                  name: event.title || event.name,
                  date,
                  time: event.time || 'All Day',
                  description: event.description || 'No description available',
                  community: event.community
                });
              }
            });
          }
        });
      }
      
      // Sort upcoming events by date and time
      upcomingEventsList.sort((a, b) => {
        const dateA = new Date(a.dateTime).getTime();
        const dateB = new Date(b.dateTime).getTime();
        return dateA - dateB;
      });

      console.log('Upcoming events:', upcomingEventsList);
      setUpcomingEvents(upcomingEventsList);
    };

    filterUpcomingEvents();
  }, [events]);

  const handleDayPress = (day) => {
    const selectedDateEvents = events[day.dateString] || [];
    setSelectedEvents(selectedDateEvents);
    setPopupVisible(true);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Calendar Section */}
      <View>
        <Calendar
          markedDates={markedDates}
          markingType={'multi-dot'}
          onDayPress={handleDayPress}
        />
      </View>
      
      {/* wellness check & SOS Button Section */}
      <View style={styles.middleBtns}>
        <TouchableOpacity onPress={() => callWebView('https://www.healthcentral.com/quiz/stress-test')} style={{flex: 1, alignItems:'center'}}>
          <View style={styles.wellnessSOS}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>How ya doin'👋</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => callWebView('https://www.cavshate.org/')} style={{flex: 1, alignItems:'center'}}>
          <View style={styles.wellnessSOS}>
            <Text style={{ fontSize: 20, fontWeight: 'bold' }}>SOS⚠️</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Upcoming Events section*/}
      <Text style={styles.upcomingTitle}>Upcoming Events</Text>
      {upcomingEvents.length > 0 ? (
        upcomingEvents.map((event, index) => (
          <View key={index} 
            style={event.community === 'Pacific Islander' ? styles.picEvent : styles.latinoEvent}>
            <Text style={styles.eventTitle}>{event.name}</Text>
            <Text style={styles.eventDate}>{event.date}</Text>
            <Text style={styles.eventTime}>{event.time}</Text>
            {event.description ? (
              <RenderHTML
                contentWidth={300}
                source={{ html: formattedDescription(event.description) }}
                defaultTextProps={{ selectable: true }}
                renderersProps={{
                  a: {
                    onPress: handleLinkPress,
                  },
                }}
              />
            ) : (
              <Text style={styles.eventTime}>No description available</Text>
            )}
          </View>
        ))
      ) : (
        <Text style={styles.noUpcomingEventText}>No upcoming events</Text>
      )}
      <Popup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        events={selectedEvents}
      />
      {/*Web Browser*/}
      <WebViewModal url={modalConfig.url} isVisible={modalConfig.isVisible} onClose={closeModal} />
    </ScrollView>
  );
};

export default CalendarView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    contentContainerStyle: 'space-between',
  },
  middleBtns: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20, // Add space between calendar and buttons
  },
  wellnessSOS: {
    height: 50,
    width: '90%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 20,
  },
  picEvent: {
    padding: 15, 
    borderRadius: 15,
    backgroundColor: 'rgba(11, 117, 185, 0.95)', // Increased opacity from 0.8 to 0.95
    marginHorizontal: 10,
    marginBottom: 10,
  },
  latinoEvent: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#71AD45',
    marginHorizontal: 10,
    marginBottom: 10,
  },
  upcomingEventsContainer: {
    height: 250,
    paddingTop: 10,
  },
  upcomingTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white', // Make text white for better contrast
  },
  eventDate: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)', // Lighter text for better readability
  },
  eventTime: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)', // Lighter text for better readability
  },
  noUpcomingEventText: {
    fontSize: 16,
    color: '#e8e6e6',
    textAlign: 'center',
    marginTop: 20,
  },
})
