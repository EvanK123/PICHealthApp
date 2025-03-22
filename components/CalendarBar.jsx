import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';

const CalendarBar = ({ calendarMode, setCalendarMode, setSelectedCalendars, calendarOptions, callWebView }) => {
  // 'Today' button functionality can be customized as needed
  // Toggles between Calendar and List view, state is in CalendarScreen
  const viewBtn = () => {
    setCalendarMode(prevMode => !prevMode);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {/*Form submission button*/}
        <TouchableOpacity onPress={() => callWebView('https://forms.gle/JwAusA65SNBHkdED9')} style={styles.flexItem}>
          <View style={styles.buttons}>
            <Text style={styles.buttonText}>Submit Event</Text>
          </View>
        </TouchableOpacity>
        <Text style={[styles.flexItem, styles.title]}>Calendar</Text>
        {/*View switch button*/}
        <TouchableOpacity onPress={viewBtn} style={styles.flexItem}>
          <View style={styles.buttons}>
            <Text style={styles.buttonText}>
              {/*Switches based on the state of calendarMode*/}
              {calendarMode ? 'List' : 'Calendar'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
      <View style={calendarMode ? {} : {display: 'none'}}>
        <MultipleSelectList
          setSelected={setSelectedCalendars}
          data={calendarOptions}
          save='key'
          label='Select Calendars'
          placeholder='Select Calendar'
          dropdownStyles={styles.dropdown} // Apply custom styles to the dropdown
          boxStyles={styles.dropdownBox} // Apply custom styles to the box
        />
      </View>
    </SafeAreaView>
  );
};

export default CalendarBar;

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#2d4887',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 65,
    shadowRadius: 3,
    shadowOffset: 4,
    paddingHorizontal: 10,
  },
  flexItem: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
  },
  buttons: {
    margin: 10,
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    borderColor: '#808080',
    minWidth: 100,
  },
  buttonText: {
    alignSelf: 'center',
    color: '#FFFFFF',
  },
  dropdown: {
    backgroundColor: '#fff', // White background for the dropdown
    borderRadius: 0,
    marginTop: 0,
    marginBottom: 10,
  },
  dropdownBox: {
    backgroundColor: '#fff', // White background for the box
    borderColor: '#fff', // Optional: Add border color
    borderRadius: 0
  },
});
