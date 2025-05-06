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

\*You may need to install these dependencies:

```bash
npx expo install react-native-web react-dom @expo/metro-runtime
expo install @react-navigation/native @react-navigation/bottom-tabs
npm install react-native-calendars
npm install react-native-dropdown-select-list
npm install react-native-icons
npm install @react-navigation/native-stack
npm install @supabase/supabase-js
npm install uuid
npx expo install @react-native-async-storage/async-storage
expo install expo-image-picker
npm install localforage

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

- Nathan Potraz: [https://www.linkedin.com/in/nathan-potraz-a538482b2/] [ntpotraz@pm.me]
- Adam Salter: [www.linkedin.com/in/adam-salter-10-11-7-rmn] [apsalter11@gmail.com]
- Billy Vo: [billyvo97@gmail.com]
- Michael Duggan: [linkedin] [email]
- Kane Svelan: [linkedin] [email]
- PIC Health Team: pichealth@gmail.com instagram: @pichealth