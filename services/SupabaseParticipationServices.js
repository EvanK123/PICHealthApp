import { supabase } from '../supabase';

/**
 * Service layer for handling event participation functionality
 * This module provides CRUD operations for event participation tracking
 */

/**
 * Updates or creates a user's participation status for an event
 * @param {string} eventId - The ID of the event to participate in
 * @param {string} userId - The ID of the user participating
 * @param {string} status - The participation status ('going', 'not_going', 'maybe')
 * @returns {Object|null} The participation record if successful, null if error
 * @description
 * - Checks if a participation record already exists
 * - Updates existing record or creates new one
 * - Returns the updated/created record
 * - Handles errors gracefully with logging
 */
export const updateParticipation = async (eventId, userId, status) => {
    console.log('Attempting to update participation status...');
    
    try {
        // First check if participation record exists
        const { data: existing, error: checkError } = await supabase
            .from('event_participation')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found"
            console.error('Error checking participation:', checkError);
            return null;
        }

        let result;
        if (existing) {
            // Update existing record
            const { data, error } = await supabase
                .from('event_participation')
                .update({ status, updated_at: new Date().toISOString() })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('Error updating participation:', error);
                return null;
            }
            result = data;
        } else {
            // Create new record
            const { data, error } = await supabase
                .from('event_participation')
                .insert([{ event_id: eventId, user_id: userId, status }])
                .select()
                .single();

            if (error) {
                console.error('Error creating participation:', error);
                return null;
            }
            result = data;
        }

        console.log('Successfully updated participation:', result);
        return result;
    } catch (e) {
        console.error('Exception in updateParticipation:', e);
        return null;
    }
};

/**
 * Gets a user's participation status for a specific event
 * @param {string} eventId - The ID of the event to check
 * @param {string} userId - The ID of the user to check
 * @returns {Object|null} The participation record if found, null if not found or error
 * @description
 * - Retrieves the user's participation status for a specific event
 * - Returns null if no participation record exists
 * - Includes error handling and logging
 */
export const getParticipation = async (eventId, userId) => {
    console.log('Attempting to get participation status...');
    
    try {
        const { data, error } = await supabase
            .from('event_participation')
            .select('*')
            .eq('event_id', eventId)
            .eq('user_id', userId)
            .single();

        if (error) {
            if (error.code === 'PGRST116') { // Not found
                console.log('No participation record found');
                return null;
            }
            console.error('Error getting participation:', error);
            return null;
        }

        console.log('Found participation record:', data);
        return data;
    } catch (e) {
        console.error('Exception in getParticipation:', e);
        return null;
    }
};

/**
 * Gets all participants for a specific event
 * @param {string} eventId - The ID of the event to get participants for
 * @returns {Array} Array of participation records with user details
 * @description
 * - Retrieves all users who have participated in the event
 * - Includes user profile information (name, email)
 * - Returns empty array if no participants or error occurs
 * - Includes error handling and logging
 */
export const getEventParticipants = async (eventId) => {
    console.log('Attempting to get event participants...');
    
    try {
        const { data, error } = await supabase
            .from('event_participation')
            .select(`
                *,
                profiles:user_id (
                    id,
                    first_name,
                    last_name,
                    email
                )
            `)
            .eq('event_id', eventId);

        if (error) {
            console.error('Error getting participants:', error);
            return [];
        }

        console.log('Found participants:', data);
        return data;
    } catch (e) {
        console.error('Exception in getEventParticipants:', e);
        return [];
    }
};

/**
 * Gets all events a user is participating in
 * @param {string} userId - The ID of the user
 * @param {string} [status] - Optional status filter ('going', 'not_going', 'maybe')
 * @returns {Array} Array of events the user is participating in
 * @description
 * - Retrieves all events a user has participated in
 * - Can filter by participation status
 * - Includes event details (title, date, location, etc.)
 * - Returns empty array if no participations or error occurs
 * - Includes error handling and logging
 */
export const getUserParticipations = async (userId, status) => {
    console.log('Attempting to get user participations...');
    
    try {
        let query = supabase
            .from('event_participation')
            .select(`
                *,
                events:event_id (
                    id,
                    title,
                    date,
                    time,
                    location,
                    description
                )
            `)
            .eq('user_id', userId);

        if (status) {
            query = query.eq('status', status);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error getting user participations:', error);
            return [];
        }

        console.log('Found user participations:', data);
        return data;
    } catch (e) {
        console.error('Exception in getUserParticipations:', e);
        return [];
    }
};

/**
 * Gets participation statistics for an event
 * @param {string} eventId - The ID of the event
 * @returns {Object} Object containing participation counts by status
 * @description
 * - Retrieves counts of participants by status
 * - Returns object with counts for 'going', 'not_going', and 'maybe'
 * - Includes error handling and logging
 */
export const getEventParticipationStats = async (eventId) => {
    console.log('Attempting to get event participation statistics...');
    
    try {
        const { data, error } = await supabase
            .from('event_participation')
            .select('status')
            .eq('event_id', eventId);

        if (error) {
            console.error('Error getting participation stats:', error);
            return { going: 0, not_going: 0, maybe: 0 };
        }

        const stats = {
            going: data.filter(p => p.status === 'going').length,
            not_going: data.filter(p => p.status === 'not_going').length,
            maybe: data.filter(p => p.status === 'maybe').length
        };

        console.log('Found participation stats:', stats);
        return stats;
    } catch (e) {
        console.error('Exception in getEventParticipationStats:', e);
        return { going: 0, not_going: 0, maybe: 0 };
    }
};

/**
 * Removes a user's participation from an event
 * @param {string} eventId - The ID of the event
 * @param {string} userId - The ID of the user
 * @returns {boolean} True if successful, false if error
 * @description
 * - Deletes the participation record for a user and event
 * - Returns true if successful, false if error occurs
 * - Includes error handling and logging
 */
export const removeParticipation = async (eventId, userId) => {
    console.log('Attempting to remove participation...');
    
    try {
        const { error } = await supabase
            .from('event_participation')
            .delete()
            .eq('event_id', eventId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error removing participation:', error);
            return false;
        }

        console.log('Successfully removed participation');
        return true;
    } catch (e) {
        console.error('Exception in removeParticipation:', e);
        return false;
    }
}; 