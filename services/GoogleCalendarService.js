const API_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

// Load allowed calendar IDs from config
const calendarsConfig = require('../locales/calendars.json');
const ALLOWED_CALENDAR_IDS = calendarsConfig.calendars.map(cal => cal.id);

export async function fetchCalendarEvents(calendarIds) {
  try {
    if (!API_KEY) {
      console.error('Google API key not configured');
      return [];
    }

    const allEvents = [];

    for (const calendarId of calendarIds) {
      // Validate calendar ID is in allowed list (SSRF protection)
      if (!ALLOWED_CALENDAR_IDS.includes(calendarId)) {
        console.warn('Attempted to fetch from unauthorized calendar:', calendarId);
        continue;
      }

      const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${API_KEY}`;
      const response = await fetch(url);
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
