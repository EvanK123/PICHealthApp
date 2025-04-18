import { createClient } from '@supabase/supabase-js';

//setting up project URL and anon/public API key from Supabase dashboard
const supabaseURL = 'https://fywwsvxhwbntsfmpfyuh.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5d3dzdnhod2JudHNmbXBmeXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQyNjIsImV4cCI6MjA1ODEwMDI2Mn0.-D3Qo2YXG7Sf_YzwxxknbHfgqy_v0j9JcDJiBh-mNZU';
export const supabase = createClient(supabaseURL, supabaseKEY);

//fetching events from the "events" table
export const getEvents = async () => {
    console.log('Attempting to fetch events from Supabase...');
    
    try {
        const { data: rawData, error } = await supabase
            .from('events')
            .select('*');

        if (error) {
            console.error('Error fetching events:', error);
            return [];
        }

        // Format the data to match what the components expect
        const formattedData = (rawData || []).map(event => {
            // Combine date and time for start
            const startDateTime = `${event.date}T${event.time || '00:00:00'}`;
            
            return {
                ...event,
                date: event.date,
                // Add fields that the popup expects
                summary: event.title,
                start: {
                    dateTime: startDateTime,
                    date: event.date
                },
                end: {
                    dateTime: event.end_time ? `${event.date}T${event.end_time}` : startDateTime,
                    date: event.date
                },
                organizer: {
                    email: event.organizer || 'unknown'
                }
            };
        });

        console.log('Formatted events for display:', formattedData);
        return formattedData;

    } catch (e) {
        console.error('Exception in getEvents:', e);
        return [];
    }
};

//inserting new event into the "events" table
export const createEvent = async (eventData) => {
    const {data, error} = await supabase
        .from('events')
        .insert([eventData]);

    if (error) {
        console.error('Error creating event: ', error.message);
        return false;
    }
    return data.user;
};