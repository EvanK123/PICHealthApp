const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;
const calendarsConfig = require('../locales/calendars.json');
const ALLOWED_CALENDAR_IDS = calendarsConfig.calendars.map(cal => cal.id);
const ALLOWED_HOST = 'www.googleapis.com';

export async function fetchCalendarEvents(calendarIds) {
  try {
    if (!API_KEY) {
      console.error('Google API key not configured');
      return [];
    }

    const allEvents = [];

    for (const calendarId of calendarIds) {
      if (!ALLOWED_CALENDAR_IDS.includes(calendarId)) {
        console.warn('Attempted to fetch from unauthorized calendar:', calendarId);
        continue;
      }

      const url = new URL(`https://${ALLOWED_HOST}/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`);
      url.searchParams.set('key', API_KEY);
      
      if (url.hostname !== ALLOWED_HOST) {
        console.error('Invalid hostname detected');
        continue;
      }

      const response = await fetch(url.toString());
      const data = await response.json();

      if (data.items) {
        allEvents.push(...data.items);
      } else {
        console.error('No events found in calendar:', data);
      }
    }

    return allEvents;
  } catch (error) {
    console.error('Error fetching calendar events:', error);
    return [];
  }
}
