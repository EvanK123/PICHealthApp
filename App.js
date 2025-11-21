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
import { TranslationProvider, TranslationContext } from './context/TranslationContext';
import { useContext } from 'react';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useContext(TranslationContext);

  return (
    <Tab.Navigator
      initialRouteName="Home"
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
      <Tab.Screen name="Home" component={CalendarScreen} options={{ tabBarLabel: t('app.tabs.home') }} />
      <Tab.Screen name="Health" component={HealthScreen} options={{ tabBarLabel: t('app.tabs.health') }} />
      <Tab.Screen name="Education" component={EducationScreen} options={{ tabBarLabel: t('app.tabs.education') }} />
      <Tab.Screen name="Culture" component={CultureScreen} options={{ tabBarLabel: t('app.tabs.culture') }} />
      <Tab.Screen name="About Us" component={AboutUs} options={{ tabBarLabel: t('app.tabs.aboutUs') }} />
    </Tab.Navigator>
  );
};

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);

  return (
    <TranslationProvider>
      <Popup visible={showWelcome} onClose={() => setShowWelcome(false)} mode="welcome" />
      <NavigationContainer>
        <TabNavigator />
      </NavigationContainer>
    </TranslationProvider>
  );
};

export default App;