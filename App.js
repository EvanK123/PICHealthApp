import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/Ionicons';
import AboutUs from './screens/AboutUs';
import HealthScreen from './screens/HealthScreen';
import CalendarScreen from './screens/CalendarScreen';
import EducationScreen from './screens/EducationScreen';
import CultureScreen from './screens/CultureScreen';
import AccountScreen from './screens/AccountScreen';
import Popup from './components/PopUp';
import { TranslationProvider } from './context/TranslationContext';

import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import { supabase } from './supabase';
import { SafeAreaProvider } from 'react-native-safe-area-context';

const Tab = createBottomTabNavigator();

const App = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const [session, setSession] = useState(null);
  const [showRegister, setShowRegister] = useState(false);

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <TranslationProvider>
        {!session ? (
          showRegister ? (
            <RegisterScreen navigation={{ navigate: () => setShowRegister(false) }} />
          ) : (
            <LoginScreen navigation={{ navigate: () => setShowRegister(true) }} />
          )
        ) : (
          <>
            <Popup visible={showWelcome} onClose={() => setShowWelcome(false)} mode="welcome" />
            <NavigationContainer>
              <Tab.Navigator
                initialRouteName='Home'
                screenOptions={({ route }) => ({
                  tabBarIcon: ({ color, size }) => {
                    let iconName;
                    if (route.name === 'About Us') iconName = 'list';
                    else if (route.name === 'Home') iconName = 'calendar';
                    else if (route.name === 'Health') iconName = 'heart';
                    else if (route.name === 'Education') iconName = 'book';
                    else if (route.name === 'Culture') iconName = 'globe';
                    else if (route.name === 'Account') iconName = 'person';

                    return <Icon name={iconName} size={size} color={color} />;
                  },
                  tabBarActiveTintColor: 'white',
                  tabBarInactiveTintColor: 'darkgray',
                  headerShown: false,
                  tabBarStyle: {
                    backgroundColor: '#2d4887',
                  },
                })}
              >
                <Tab.Screen name='Home' component={CalendarScreen} />
                <Tab.Screen name='Health' component={HealthScreen} />
                <Tab.Screen name='Education' component={EducationScreen} />
                <Tab.Screen name='Culture' component={CultureScreen} />
                <Tab.Screen name='About Us' component={AboutUs} />
                <Tab.Screen name='Account' component={AccountScreen} />
              </Tab.Navigator>
            </NavigationContainer>
          </>
        )}
      </TranslationProvider>
    </SafeAreaProvider>
  );
};

export default App;