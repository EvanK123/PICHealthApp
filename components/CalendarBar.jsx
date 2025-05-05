import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { MultipleSelectList } from 'react-native-dropdown-select-list';
import { useNavigation } from '@react-navigation/native';

const CalendarBar = ({ calendarMode, setCalendarMode, setSelectedCalendars, calendarOptions, callWebView, isGuest }) => {
  const navigation = useNavigation();

  const viewBtn = () => {
    setCalendarMode(prevMode => !prevMode);
  };

  return (
    <SafeAreaView>
      <View style={styles.container}>
        {!isGuest && (
          <TouchableOpacity onPress={() => navigation.navigate('AddEventScreen')} style={styles.flexItem}>
            <View style={styles.buttons}>
              <Text style={styles.buttonText}>Submit Event</Text>
            </View>
          </TouchableOpacity>
        )}
        <Text style={[styles.flexItem, styles.title]}>Calendar</Text>
        <TouchableOpacity onPress={viewBtn} style={styles.flexItem}>
          <View style={styles.buttons}>
            <Text style={styles.buttonText}>
              {calendarMode ? 'List' : 'Calendar'}
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      <View style={calendarMode ? {} : { display: 'none' }}>
        <MultipleSelectList
          setSelected={setSelectedCalendars}
          data={calendarOptions}
          save='key'
          label='Select Calendars'
          placeholder='Select Calendar'
          dropdownStyles={styles.dropdown} 
          boxStyles={styles.dropdownBox} 
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
    backgroundColor: '#fff',
    marginBottom: 10,
  },
  dropdownBox: {
    backgroundColor: '#fff',
    borderColor: '#fff',
  },
});
