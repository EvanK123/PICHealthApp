import React, { useState } from 'react';
import { View, Text, SectionList, StyleSheet, TouchableOpacity } from 'react-native';
import Popup from './PopUp'; // Make sure to import the Popup component

const ListView = ({ events, selectedCalendars }) => {
  const [error, setError] = useState(null);
  // State for when popup should be displayed, when a event is pressed
  const [popupVisible, setPopupVisible] = useState(false);
  // The event that is selected for the popup
  const [selectedEvents, setSelectedEvents] = useState([]);

  // Events that are to be displayed
  const eventsArray = [];
  const todayDate = new Date().toISOString().split('T')[0];
  // This goes through each event from the calendars that are selected,
  // and only displays events that haven't happened yet
  for (const [month, event] of Object.entries(events)) {
    event.forEach(item => {
      if (todayDate <= (item.end.dateTime || item.end.date).split('T')[0]) {
        eventsArray.push(item);
      }
    });
  }

  const formatEvents = (events) => {
    // Group events by year-month for proper chronological sorting
    const groupedEvents = events.reduce((acc, event) => {
      const eventDate = new Date(event.start.dateTime || event.start.date);
      // Create a sortable key in format "YYYY-MM" and a display title
      const sortKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`;
      const displayTitle = eventDate.toLocaleString('default', { month: 'long', year: 'numeric' });

      if (!acc[sortKey]) {
        acc[sortKey] = {
          displayTitle,
          events: []
        };
      }

      acc[sortKey].events.push(event);
      return acc;
    }, {});

    // Convert to array and sort by the sortable key
    const sortedEvents = Object.entries(groupedEvents)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([_, { displayTitle, events }]) => ({
        title: displayTitle,
        data: events.sort((a, b) =>
          new Date(a.start.dateTime || a.start.date) - new Date(b.start.dateTime || b.start.date)
        ),
      }));

    return sortedEvents;
  };

  const sortedEventsArray = formatEvents(eventsArray);

  const handleEventPress = (item) => {
    setSelectedEvents([item]);
    setPopupVisible(true);
  };

  return (
    <View style={styles.container}>
      {error ? (
        <Text style={styles.errorText}>Error: {error}</Text>
        // No calendar is selected from the CalendarView
      ) : selectedCalendars.length === 0 ? (
        <Text style={styles.noEventsText}>Please select a calendar to view events</Text>
      ) : sortedEventsArray.length > 0 ? (
        <SectionList
          stickySectionHeadersEnabled
          sections={sortedEventsArray} // Grouped events
          keyExtractor={(item) => item.id} // Individual events id
          style={styles.sectionList}
          // Creates the list item for each individual event, item is the event
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.listItem} onPress={() => handleEventPress(item)}>
              <View style={item.organizer.email === 'PIC_Main_Email@gmail.com' ? styles.picItem : styles.latinoItem}>
                <Text style={styles.eventTitle}>{item.summary}</Text>
                <Text style={styles.eventTime}>
                  {new Date(item.start.dateTime || item.start.date).toLocaleString()}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          // Creates the section of the grouped events based on the month
          renderSectionHeader={({ section: { title } }) => (
            <Text style={styles.sectionHeader}>{title}</Text>
          )}
        />
      ) : (
        <Text style={styles.noEventsText}>No events available</Text>
      )}
      <Popup
        visible={popupVisible}
        onClose={() => setPopupVisible(false)}
        events={selectedEvents}
      />
    </View>
  );
};

export default ListView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingVertical: 16,
  },
  listItem: {
    marginHorizontal: 10,
    margin: 5,
  },
  picItem: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#0B75B9', // red color
  },
  latinoItem: {
    padding: 15,
    borderRadius: 15,
    backgroundColor: '#71AD45', // blue color
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventTime: {
    fontSize: 14,
    color: '#555',
  },
  sectionHeader: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    backgroundColor: 'hsla(200, 0%, 20%, 0.6)',
    paddingHorizontal: 30,
    paddingVertical: 10,
    marginBottom: 10,
  },
  noEventsText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
});
