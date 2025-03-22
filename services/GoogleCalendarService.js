const API_KEY = 'AIzaSyB6GhOVk1xTk7kaDzEVHrfez_z4cC5FTe4';

export async function fetchCalendarEvents(calendarIds) {
  try {
    const allEvents = [];

    for (const calendarId of calendarIds) {
      const response = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/${calendarId}/events?key=${API_KEY}`
      );
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
