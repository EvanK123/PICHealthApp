// App.js
import 'react-native-url-polyfill/auto';
import 'react-native-get-random-values';

import React, { useState } from 'react';
import { ActivityIndicator, View, Text } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Icon from 'react-native-vector-icons/Ionicons';

import AboutUs from './screens/AboutUs';
import HealthScreen from './screens/HealthScreen';
import CalendarScreen from './screens/CalendarScreen';
import EducationScreen from './screens/EducationScreen';
import CultureScreen from './screens/CultureScreen';

import Popup from './components/PopUp';
import ErrorBoundary from './components/ErrorBoundary';
import { TranslationProvider, TranslationContext } from './context/TranslationContext';
import { useContext } from 'react';

import { AuthProvider, useAuth } from './context/AuthContext';

import LoginScreen from './screens/LoginScreen';
import ProfileScreen from './screens/ProfileScreen';
import CommentsScreen from './screens/CommentsScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TabNavigator = () => {
  const { t } = useContext(TranslationContext);

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'About Us') iconName = 'list';
          else if (route.name === 'Home') iconName = 'calendar';
          else if (route.name === 'Health') iconName = 'heart';
          else if (route.name === 'Education') iconName = 'book';
          else if (route.name === 'Culture') iconName = 'globe';
          else if (route.name === 'Comments') iconName = 'chatbubbles';

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: 'white',
        tabBarInactiveTintColor: 'darkgray',
        headerShown: false,
        tabBarStyle: { backgroundColor: '#2d4887' },
      })}
    >
      <Tab.Screen
        name="Home"
        component={CalendarScreen}
        options={{ tabBarLabel: t('app.tabs.home') }}
      />
      <Tab.Screen
        name="Health"
        component={HealthScreen}
        options={{ tabBarLabel: t('app.tabs.health') }}
      />
      <Tab.Screen
        name="Education"
        component={EducationScreen}
        options={{ tabBarLabel: t('app.tabs.education') }}
      />
      <Tab.Screen
        name="Culture"
        component={CultureScreen}
        options={{ tabBarLabel: t('app.tabs.culture') }}
      />
      <Tab.Screen
        name="About Us"
        component={AboutUs}
        options={{ tabBarLabel: t('app.tabs.aboutUs') }}
      />
      <Tab.Screen
        name="Comments"
        component={CommentsScreen}
        options={{ tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
};

// Wrapper that chooses Login or Profile based on auth state
const AccountScreenGate = () => {
  const { session } = useAuth();
  return session ? <ProfileScreen /> : <LoginScreen />;
};

const RootApp = () => {
  const { loading } = useAuth();
  const [showWelcome, setShowWelcome] = useState(true);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: '#111827',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  // Always show the main app; Account route will handle auth
  return (
    <>
      <Popup
        visible={showWelcome}
        onClose={() => setShowWelcome(false)}
        mode="welcome"
      />

      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="MainTabs" component={TabNavigator} />
          <Stack.Screen name="Account" component={AccountScreenGate} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
};

export default function App() {
  try {
    return (
      <ErrorBoundary>
        <AuthProvider>
          <TranslationProvider>
            <RootApp />
          </TranslationProvider>
        </AuthProvider>
      </ErrorBoundary>
    );
  } catch (error) {
    console.error('[App] Error in render:', error);
    return (
      <View style={{ flex: 1, backgroundColor: '#111827', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: '#ef4444', fontSize: 18 }}>Something went wrong. Please try again.</Text>
      </View>
    );
  }
}
