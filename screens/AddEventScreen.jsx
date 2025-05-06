import React, {useState} from 'react';
import {View, Text, TextInput, Button, StyleSheet, Alert} from 'react-native';
import {createEvent} from '../services/SupabaseEventServices';
import { supabase } from '../supabase';
import { getCurrentEnv } from '../config';

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
        try {
            // Basic validation
            if (!title.trim()) {
                Alert.alert('Error', 'Please enter an event title');
                return;
            }
            if (!date.trim()) {
                Alert.alert('Error', 'Please enter a date');
                return;
            }
            if (!time.trim()) {
                Alert.alert('Error', 'Please enter a time');
                return;
            }
            if (!location.trim()) {
                Alert.alert('Error', 'Please enter a location');
                return;
            }

            const { data: { session } } = await supabase.auth.getSession();
            const userId = session?.user?.id;
            
            if (!userId) {
                Alert.alert('Error', 'You must be logged in to create an event');
                return;
            }

            console.log('Current user ID:', userId);
            console.log('Current schema:', getCurrentEnv());

            // Get user's community from their profile
            let userProfile = null;
            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('communities')
                .eq('id', userId)
                .single();

            if (profileError) {
                console.error('Error fetching profile:', profileError);
                console.error('Error details:', {
                    code: profileError.code,
                    message: profileError.message,
                    details: profileError.details,
                    hint: profileError.hint
                });

                if (profileError.code === 'PGRST116') {
                    // Try to create a profile if it doesn't exist
                    const { data: newProfile, error: createError } = await supabase
                        .from('profiles')
                        .insert([{
                            id: userId,
                            communities: 'Pacific Islander', // Default community
                            first_name: session.user.user_metadata?.first_name || '',
                            last_name: session.user.user_metadata?.last_name || '',
                            email: session.user.email
                        }])
                        .select()
                        .single();

                    if (createError) {
                        console.error('Error creating profile:', createError);
                        Alert.alert(
                            'Profile Error',
                            'Could not create your profile. Please contact support.',
                            [
                                {
                                    text: 'Go to Registration',
                                    onPress: () => navigation.navigate('Register')
                                },
                                {
                                    text: 'Cancel',
                                    style: 'cancel'
                                }
                            ]
                        );
                        return;
                    }

                    userProfile = newProfile;
                } else {
                    Alert.alert('Error', 'Could not fetch your profile information');
                    return;
                }
            } else {
                userProfile = profile;
            }

            if (!userProfile?.communities) {
                Alert.alert('Error', 'Your community information is missing. Please update your profile.');
                return;
            }

            // Create the event with the user's community
            const success = await createEvent({
                title: title.trim(),
                date: date.trim(),
                time: time.trim(),
                location: location.trim(),
                description: description.trim(),
                organizer: userId,
                community: userProfile.communities
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