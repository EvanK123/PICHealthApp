import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { createEvent } from '../services/SupabaseEventServices';
import { supabase } from '../supabase';

export default function AddEventScreen({ navigation }) {
    const [title, setTitle] = useState('');
    const [date, setDate] = useState('');
    const [time, setTime] = useState('');
    const [location, setLocation] = useState('');
    const [description, setDescription] = useState('');
    const [community, setCommunity] = useState('');

    const handleCreateEvent = async () => {
        try {
            // Validate required fields
            if (!title.trim() || !date.trim() || !time.trim() || !location.trim() || !community) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            // Validate date format
            if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
                Alert.alert('Error', 'Date must be in YYYY-MM-DD format');
                return;
            }

            // Validate time format
            if (!/^\d{2}:\d{2}(:\d{2})?$/.test(time.trim())) {
                Alert.alert('Error', 'Time must be in HH:MM or HH:MM:SS format');
                return;
            }

            // Get current user
            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;

            if (!userId) {
                Alert.alert('Error', 'You must be logged in to create an event');
                return;
            }

            // Create event
            const success = await createEvent({
                title: title.trim(),
                date: date.trim(),
                time: time.trim(),
                location: location.trim(),
                description: description.trim(),
                organizer: userId,
                community: community
            });

            if (success) {
                Alert.alert('Success', 'Event created!');
                navigation.goBack();
            } else {
                Alert.alert('Error', 'Could not create event. Please try again.');
            }
        } catch (error) {
            console.error('Error creating event:', error);
            Alert.alert('Error', 'An unexpected error occurred. Please try again.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.label}>Event Title</Text>
            <TextInput style={styles.input} value={title} onChangeText={setTitle} />

            <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
            <TextInput style={styles.input} value={date} onChangeText={setDate} />

            <Text style={styles.label}>Time (HH:MM or HH:MM:SS)</Text>
            <TextInput style={styles.input} value={time} onChangeText={setTime} />

            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={location} onChangeText={setLocation} />

            <Text style={styles.label}>Description</Text>
            <TextInput style={styles.input} value={description} onChangeText={setDescription} multiline />

            <Text style={styles.label}>Community</Text>
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={[styles.communityButton, community === 'Pacific Islander' && styles.selectedButton]}
                    onPress={() => setCommunity('Pacific Islander')}
                >
                    <Text style={styles.buttonText}>Pacific Islander</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.communityButton, community === 'Latino' && styles.selectedButton]}
                    onPress={() => setCommunity('Latino')}
                >
                    <Text style={styles.buttonText}>Latino</Text>
                </TouchableOpacity>
            </View>

            <Button title="Create Event" onPress={handleCreateEvent} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { padding: 20 },
    label: { marginTop: 10, fontWeight: 'bold' },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 5, padding: 8, marginBottom: 10 },
    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
    communityButton: {
        flex: 1,
        backgroundColor: '#eee',
        padding: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        borderRadius: 5,
    },
    selectedButton: {
        backgroundColor: '#4CAF50',
    },
    buttonText: {
        color: '#000',
        fontWeight: 'bold',
    }
});
