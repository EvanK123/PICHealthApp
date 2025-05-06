import { supabase } from '../supabase';

/**
 * Fetches all events from the events table
 * @returns {Array} Array of formatted event objects, or empty array if error occurs
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

        const formattedData = (rawData || []).map(event => {
            const startDateTime = `${event.date}T${event.time || '00:00:00'}`;
            return {
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
 * @param {string|number} id
 * @returns {Object|null}
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
 * @param {Object} eventData
 * @returns {boolean}
 */
export const createEvent = async (eventData) => {
    console.log('Attempting to create event with data:', eventData);

    try {
        const { error } = await supabase
            .from('events')
            .insert([eventData]); // Removed .select() to avoid triggering SELECT RLS

        if (error) {
            console.error('Error creating event:', error);
            return false;
        }

        console.log('Successfully created event');
        return true;

    } catch (e) {
        console.error('Exception in createEvent:', e);
        return false;
    }
};

/**
 * Updates an existing event
 * @param {string|number} id
 * @param {Object} eventData
 * @returns {boolean}
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
 * Deletes an event
 * @param {string|number} id
 * @returns {boolean}
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
