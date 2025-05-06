import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import localforage from 'localforage';
import { getCurrentEnv } from './config';

const supabaseUrl = 'https://fywwsvxhwbntsfmpfyuh.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ5d3dzdnhod2JudHNmbXBmeXVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI1MjQyNjIsImV4cCI6MjA1ODEwMDI2Mn0.-D3Qo2YXG7Sf_YzwxxknbHfgqy_v0j9JcDJiBh-mNZU';

const webStorage = {
  getItem:    key => localforage.getItem(key),
  setItem:    (key, value) => localforage.setItem(key, value),
  removeItem: key => localforage.removeItem(key),
};

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: Platform.OS === 'web' ? webStorage : AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,  // only needed for OAuth redirects
  },
  db: {
    schema: 'public'
  }
});

export { supabase };
