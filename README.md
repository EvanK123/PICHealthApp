# PIC Health App

A community driven event and health application for the Pacific Islander and Latino community.

## Table of Contents

- [Features](#features)
- [Setting Up the Environment](#setting-up-the-environment)
- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)
- [Contact](#contact)

## Features

- Pacific Islander and Latino Community event calendar
- Event data fetching via Google Calendar API
- User event submission with Google Forms
- List of resourcesful links related to health, language, arts, culture, etc.
- iOS, Android, and Web compatibility

## Setting Up the Environment

- https://reactnative.dev/docs/set-up-your-environment
- https://docs.expo.dev/more/expo-cli/

\*You may need to install these dependencies (if you run into errors with npm install):

```bash
npx expo install react-native-web react-dom @expo/metro-runtime
npx expo install @react-navigation/bottom-tabs
npx expo install react-native-url-polyfill
npx expo install react-native-get-random-values
npx expo install expo-image-picker expo-file-system
npx expo install react-native-screens react-native-safe-area-context react-native-gesture-handler
npm install @react-navigation/native@6.1.18 @react-navigation/native-stack@6.9.20
npm install react-native-calendars
npm install react-native-dropdown-select-list
npm install react-native-icons 
npm install base64-arraybuffer
npm install @supabase/supabase-js@2.39.7
npx expo install expo-web-browser
```

## Installation

1. Clone the github repository:

```bash
git clone https://github.com/pichealthapps/PIC-Health-App
```

2. Navigate to repository

```bash
cd PIC-Health-App
```

3. Install node packages

```bash
npm install
npm install expo
```

## Usage

Before running the application, start the Metro Bundler using this command:

```bash
npx expo start
```
Instructions for opening the app on the desired platform (iOS, Android, Web) will be displayed in your terminal.

Web view will be waiting at: http://localhost:8081

- Generate the native Android and iOS directories for your project: (`npx expo prebuild`).
- Build and Run the native apps locally: (`npx expo run:ios`) and (`npx expo run:android`)
- Install and update packages: (`npx expo install package-name`)
- To view a list of available commands in the Expo CLI, run the following command:

```bash
- npx expo -h
```

- You can also run (`yarn expo -h`) if you prefer to use yarn as your package manager.

## Adding New Features

### Adding a New Calendar

To add a new Google Calendar to the application:

1. **Get the Calendar ID**: 
   - The calendar ID is typically in the format: `[calendar-id]@group.calendar.google.com`
   - You can find this in your Google Calendar settings under "Integrate calendar"

2. **Update `locales/config/calendars.json`**:
   ```json
   {
     "calendars": [
       {
         "id": "your-calendar-id@group.calendar.google.com",
         "translationKey": "calendar.calendarOptions.yourCalendarName",
         "color": "#HEXCOLOR",
         "defaultSelected": true
       }
     ]
   }
   ```
   - `id`: The Google Calendar ID
   - `translationKey`: A key path for the calendar's display name (see step 3)
   - `color`: Hex color code for calendar events in the UI
   - `defaultSelected`: Whether this calendar should be selected by default

3. **Add Translation Keys**:
   Add the translation key to all language files in `locales/translations/`:
   
   For example, in `locales/translations/en.json`:
   ```json
   {
     "calendar": {
       "calendarOptions": {
         "yourCalendarName": "Your Calendar Display Name"
       }
     }
   }
   ```
   
   Repeat this for all language files (`en.json`, `es.json`, `sm.json`, `ch.json`, `to.json`, etc.)

4. **Verify**: 
   - The calendar will automatically appear in the calendar selector dropdown
   - Events from the calendar will be fetched and displayed when selected
   - Make sure your Google Calendar API key has access to the calendar

### Adding New Resources/Services

Resources and services are organized under four main sections: **Health**, **Culture**, **Education**, and **About Us**. To add a new resource:

1. **Add the URL to `locales/config/links.json`**:
   
   Add your resource URL under the appropriate section (health, culture, education, or aboutUs):
   ```json
   {
     "health": {
       "yourServiceId": {
         "homepage": "https://example.com",
         "anotherLink": "https://example.com/another-page"
       }
     }
   }
   ```
   
   - The key (e.g., `"yourServiceId"`) must match the `id` in the translation file (see step 2)
   - You can add multiple links per service (e.g., `"homepage"`, `"screening"`, etc.)

2. **Add the service definition to translation files**:
   
   In all language files (`locales/translations/*.json`), add your service under the appropriate section:
   
   For example, in `locales/translations/en.json`:
   ```json
   {
     "health": {
       "services": [
         {
           "id": "yourServiceId",
           "title": "Your Service Name",
           "text": "Description of your service and what it provides.",
           "links": [
             {
               "label": "Visit Homepage",
               "linkId": "homepage"
             },
             {
               "label": "Take Screening",
               "linkId": "anotherLink"
             }
           ]
         }
       ]
     }
   }
   ```
   
   - `id`: Must match the key in `links.json`
   - `title`: Display name of the service
   - `text`: Description shown to users
   - `links`: Array of links with `label` (display text) and `linkId` (key in links.json)

3. **Adding to different sections**:
   
   - **Health**: Add to `"health"` section in both `links.json` and translation files
   - **Culture**: Add to `"culture"` section
   - **Education**: Add to `"education"` section
   - **About Us**: Add sections to `"aboutUs.sections"` array in translation files (no links.json entry needed for About Us sections)

4. **Verify**:
   - The service will appear in the appropriate screen (Health, Culture, Education, or About Us)
   - Links will be clickable and open in a web view
   - Make sure to add translations for all supported languages

### Adding a New Language

To add support for a new language:

1. **Create a translation file**:
   - Create a new JSON file in `locales/translations/` named `[code].json`
   - Use a two-letter language code (e.g., `fr.json` for French, `ja.json` for Japanese)
   - Copy the structure from `locales/translations/en.json` and translate all values

2. **Update `locales/config/languages.config.json`**:
   ```json
   {
     "[code]": {
       "code": "[code]",
       "name": "Language Name",
       "nativeName": "Native Language Name",
       "translationKey": "common.languages.[languageKey]"
     }
   }
   ```
   
   For example:
   ```json
   {
     "fr": {
       "code": "fr",
       "name": "French",
       "nativeName": "Français",
       "translationKey": "common.languages.french"
     }
   }
   ```

3. **Add language name translations**:
   In all existing translation files, add the new language name under `common.languages`:
   
   For example, in `locales/translations/en.json`:
   ```json
   {
     "common": {
       "languages": {
         "french": "French"
       }
     }
   }
   ```

4. **Update `locales/translations.map.js`**:
   Add the new language to the `TRANSLATIONS` object:
   ```javascript
   export const TRANSLATIONS = {
     en: require('./translations/en.json'),
     es: require('./translations/es.json'),
     // ... existing languages
     [code]: require('./translations/[code].json'),
   };
   ```

5. **Verify**:
   - The new language should appear in the language selector
   - All UI text should be translated when the language is selected
   - Ensure all translation keys from `en.json` are present in your new language file

## Contributing

1. Fork the repository.
2. Create a new branch (`git switch -c feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push --set-upstream origin feature-branch`).
6. Open a pull request.

## Future Feature Ideas

- Fetch calendar events right at startup
- Store each calendar and the calendars that are being selected into seperate variables or states for faster calendar filtering.
- Have the calendars selected by default at startup. This will most likely require a different dropdown component
- Setup a database so that the users can start "Liking" events and have it persist and sync accross all users in order to guage interests in events
- Support repeated events. Right now if you make an event on Google Calendar that repeats, it'll only show up on the on the first day.
- Have the location on events be clickable and bring up the address in Google/Apple Maps
- Allow for users to have their own event list that keeps track of the events that they plan on attending
- Allow user accounts, either custom or connect Google accounts.
    - Using Google accounts could also also allow for events that the user is planning on attending to be added to their own personal Calendar

## License

MIT License

## Contact
Current Contacts
- Evan Knaggs: [https://www.linkedin.com/in/evanknaggs] [evan.knaggs@gmail.com]
- Joshua Tupas: [https://www.linkedin.com/in/joshua-tupas-073849363/]
- Stetson Baldwin: [stetsonbaldwin03@gmail.com]
- Chris Fileccia: [https://www.linkedin.com/in/chris-fileccia-487903214/]
- Mai Bridge: [maiandbr@gmail.com]


Previous Contacts
- Nathan Potraz: [https://www.linkedin.com/in/nathan-potraz-a538482b2/] [ntpotraz@pm.me]
- Adam Salter: [www.linkedin.com/in/adam-salter-10-11-7-rmn] [apsalter11@gmail.com]
- Billy Vo: [billyvo97@gmail.com]
- Michael Duggan: [linkedin] [email]
- Kane Svelan: [linkedin] [email]
- PIC Health Team: pichealth@gmail.com instagram: @pichealth
