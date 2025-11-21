// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load initial session and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    async function initAuth() {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session fetch timeout')), 10000)
        );
        
        const sessionPromise = supabase.auth.getSession();
        const { data, error } = await Promise.race([sessionPromise, timeoutPromise]);
        
        if (!isMounted) return;

        if (error) {
          console.error('[AuthContext] getSession error:', error);
          // Set session to null on error, don't block the app
          setSession(null);
        } else {
          setSession(data?.session ?? null);
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err);
        // On any error (including timeout), set loading to false and continue
        if (isMounted) {
          setSession(null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    // Set up auth state change listener
    try {
      const {
        data: { subscription: authSubscription },
      } = supabase.auth.onAuthStateChange((_event, newSession) => {
        if (isMounted) {
          setSession(newSession);
        }
      });
      subscription = authSubscription;
    } catch (err) {
      console.error('[AuthContext] onAuthStateChange error:', err);
      // If subscription fails, still set loading to false
      if (isMounted) setLoading(false);
    }

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Email/password sign up
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  };

  // Email/password sign in
  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  };

  // Sign out
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  // Google login – web/PWA flow
  const signInWithGoogleWeb = async () => {
    if (Platform.OS !== 'web') {
      console.warn('signInWithGoogleWeb called on non-web platform');
    }

    const redirectTo =
      typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo,
      },
    });

    if (error) throw error;
    return data;
  };

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogleWeb,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return ctx;
}
