import { createClient } from '@supabase/supabase-js';

//setting up project URL and anon/public API key from Supabase dashboard
const supabaseURL = 'https://fywwsvxhwbntsfmpfyuh.supabase.co';
const supabaseKEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5d3dzdnhod2JudHNmbXBmeXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQyNjIsImV4cCI6MjA1ODEwMDI2Mn0.-D3Qo2YXG7Sf_YzwxxknbHfgqy_v0j9JcDJiBh-mNZU';
export const supabase = createClient(supabaseURL, supabaseKEY);

/**
 * Fetches all events from the events table
 * @returns {Array} Array of formatted event objects, or empty array if error occurs
 * @description
 * - Retrieves all events from the Supabase database
 * - Formats each event to match the expected structure for calendar display
 * - Handles errors gracefully by returning an empty array
 * - Includes detailed logging for debugging
 */
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

/**
 * Fetches a single event by its ID
 * @param {string|number} id - The ID of the event to fetch
 * @returns {Object|null} Formatted event object if found, null if not found or error occurs
 * @description
 * - Retrieves a specific event from the Supabase database using its ID
 * - Formats the event to match the expected structure for calendar display
 * - Returns null if event is not found or if an error occurs
 * - Includes detailed logging for debugging
 */
export const getEventById = async (id) => {
    console.log('Attempting to fetch event by ID from Supabase...');
    
    try {
        const { data: event, error } = await supabase
            .from('events')
            .select('*')
            .eq('id', id)
            .single();

        if (error) {
            console.error('Error fetching event:', error);
            return null;
        }

        if (!event) {
            console.log('No event found with ID:', id);
            return null;
        }

        // Format the data to match what the components expect
        const startDateTime = `${event.date}T${event.time || '00:00:00'}`;
        const formattedEvent = {
            ...event,
            date: event.date,
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

        console.log('Formatted event for display:', formattedEvent);
        return formattedEvent;

    } catch (e) {
        console.error('Exception in getEventById:', e);
        return null;
    }
};

/**
 * Creates a new event in the events table
 * @param {Object} eventData - The event data to insert
 * @returns {boolean} True if successful, false if error occurs
 * @description
 * - Inserts a new event into the Supabase database
 * - Returns false if an error occurs during insertion
 * - Includes error logging for debugging
 */
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

/**
 * Updates an existing event in the events table
 * @param {string|number} id - The ID of the event to update
 * @param {Object} eventData - The updated event data
 * @returns {boolean} True if successful, false if error occurs
 * @description
 * - Updates an existing event in the Supabase database
 * - Returns false if an error occurs during update
 * - Includes detailed logging for debugging
 */
export const updateEvent = async (id, eventData) => {
    console.log('Attempting to update event in Supabase...');
    
    try {
        const { data, error } = await supabase
            .from('events')
            .update(eventData)
            .eq('id', id);

        if (error) {
            console.error('Error updating event:', error);
            return false;
        }

        console.log('Successfully updated event:', data);
        return true;

    } catch (e) {
        console.error('Exception in updateEvent:', e);
        return false;
    }
};

/**
 * Deletes an event from the events table
 * @param {string|number} id - The ID of the event to delete
 * @returns {boolean} True if successful, false if error occurs
 * @description
 * - Deletes an event from the Supabase database
 * - Returns false if an error occurs during deletion
 * - Includes detailed logging for debugging
 */
export const deleteEvent = async (id) => {
    console.log('Attempting to delete event from Supabase...');
    
    try {
        const { error } = await supabase
            .from('events')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('Error deleting event:', error);
            return false;
        }

        console.log('Successfully deleted event with ID:', id);
        return true;

    } catch (e) {
        console.error('Exception in deleteEvent:', e);
        return false;
    }
};