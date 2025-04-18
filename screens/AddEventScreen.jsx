import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {createEvent} from '../services/SupabaseEventService';

//allows screen an organizer to create a new event
export default function AddEventScreen({navigation}){
    //state variables for each input field
    const [title, setTitle] = useState('');
    const [date, setDate] = useState(''); // format: YYYY-MM-DD
    const [time, setTime] = useState(''); // format: HH:MM:SS
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');

    //handler for form submission
    const handleCreateEvent = async () => {
        const success = await createEvent({
            title,
            date,
            time,
            location,
            description,
            organizer: 'user-id-here', // Replace with logged-in user ID
        });

        if (success) {
            Alert.alert('Success', 'Event created!');
            navigation.goBack();
        } else {
            Alert.alert('Error', 'Could not create event.');
        }
    };

    //contains style input for event title, date, time, loc, and description
    return (
        <View style={styles.container}>
          <Text style={styles.label}>Event Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} />
          <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
          <TextInput style={styles.input} value={date} onChangeText={setDate} />
          <Text style={styles.label}>Time (HH:MM:SS)</Text>
          <TextInput style={styles.input} value={time} onChangeText={setTime} />
          <Text style={styles.label}>Location</Text>
          <TextInput style={styles.input} value={location} onChangeText={setLocation} />
          <Text style={styles.label}>Description</Text>
          <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

          <Button title="Create Event" onPress={handleCreateEvent} />
        </View>
    );
}

//styling for the form
const styles = StyleSheet.create({
  container: { padding: 20 },
  label: { marginTop: 10, fontWeight: 'bold' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 }
});