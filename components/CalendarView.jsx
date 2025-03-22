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
        'PIC_Calendar_Email@gmail.com': '#0B75B9',
        'Latino_Calendar_Email@group.calendar.google.com': '#71AD45',
      };

      const formattedEvents = Object.keys(events).reduce((acc, date) => {
        const eventList = events[date];
        const dots = eventList.map(event => {
          const calendarId = event.organizer.email;
          const color = calendarColors[calendarId] || 'gray';
          return { color };
        });

        acc[date] = { dots };
        return acc;
      }, {});

      return formattedEvents;
    };

    if (selectedCalendars.length > 0) {
      const formattedEvents = formatEvents(events);
      setMarkedDates(formattedEvents);
    } else {
      setMarkedDates({});
    }
  }, [events, selectedCalendars]);

  // Filter upcoming events within the next 7 days
  useEffect(() => {
    const filterUpcomingEvents = () => {
      const today = new Date();
      const endDate = addDays(today, 7);
      const upcomingEventsList = [];
      
      if (events && typeof events === 'object') {
        Object.entries(events).forEach(([date, eventsOnDate = []]) => {
          if (Array.isArray(eventsOnDate)) {
            eventsOnDate.forEach(event => {
              const isAllDay = !!event.start?.date;
              const eventDateObj = new Date(event.start?.dateTime || event.start?.date);

              if (!isNaN(eventDateObj) && eventDateObj >= today && eventDateObj <= endDate) {
                upcomingEventsList.push({
                  name: event.summary,
                  date,
                  time: isAllDay ? 'All Day' : new Date(event.start.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                  description: event.description || 'No description available',
                  dateTime: event.start.dateTime || event.start.date,
                  organizer: event.organizer,
                  isAllDay,
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
            style={event.organizer?.email === 'f934159db7dbaebd1b8b4b0fc731f6ea8fbe8ba458e88df53eaf0356186dcb82@group.calendar.google.com' ? styles.picEvent : styles.latinoEvent}>
              
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
                <Text style={styles.eventTime}> No description available</Text>
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
    backgroundColor: '#0B75B9', // red color
    marginHorizontal: 10,
    marginBottom: 10,
  },
  latinoEvent: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#71AD45', // blue color
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
  },
  eventDate: {
    fontSize: 14,
    color: '#555',
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
  },
  noUpcomingEventText: {
    fontSize: 16,
    color: '#e8e6e6',
    textAlign: 'center',
    marginTop: 20,
  },
})
