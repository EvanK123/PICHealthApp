import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AboutUs from './screens/AboutUs';
import HealthScreen from './screens/HealthScreen';
import CalendarScreen from './screens/CalendarScreen';
import EducationScreen from './screens/EducationScreen';
import CultureScreen from './screens/CultureScreen';
import Popup from './components/PopUp';

const Tab = createBottomTabNavigator();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true); // State of welcome popup

  return (
    <>
      <Popup visible={showWelcome} onClose={() => setShowWelcome(false)} mode="welcome" />
      <NavigationContainer>
        <Tab.Navigator
          initialRouteName='Home' // Set the initial route to Home (CalendarScreen)
          screenOptions={({ route }) => ({
            tabBarIcon: ({ color, size }) => {
              let iconName;

              if (route.name === 'About Us') {
                iconName = 'list';
              } else if (route.name === 'Home') {
                iconName = 'calendar';
              } else if (route.name === 'Health') {
                iconName = 'heart';
              } else if (route.name === 'Education') {
                iconName = 'book';
              } else if (route.name === 'Culture') {
                iconName = 'globe';
              }

              return <Icon name={iconName} size={size} color={color} />;
            },
            tabBarActiveTintColor: 'white',
            tabBarInactiveTintColor: 'darkgray',
            headerShown: false,
            tabBarStyle: {
              backgroundColor: '#2d4887'
            }
          })}
        >
          <Tab.Screen name='Home' component={CalendarScreen} />
          <Tab.Screen name='Health' component={HealthScreen} />
          <Tab.Screen name='Education' component={EducationScreen} />
          <Tab.Screen name='Culture' component={CultureScreen} />
          <Tab.Screen name='About Us' component={AboutUs} />
        </Tab.Navigator>
      </NavigationContainer>
    </>
  );
}

export default App;