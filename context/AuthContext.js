// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
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
        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ]);

        if (!isMounted) return;

        if (error) {
          console.error('[AuthContext] getSession error:', error);
          setSession(null);
          setUser(null);
        } else {
          const currentSession = data?.session ?? null;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
        console.error('[AuthContext] initAuth error:', err);
        if (isMounted) {
          setSession(null);
          setUser(null);
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
        if (!isMounted) return;
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });
      subscription = authSubscription;
    } catch (err) {
      console.error('[AuthContext] onAuthStateChange error:', err);
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

  // Force-refresh the user object (e.g., after updating metadata/avatar)
  const refreshUser = async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error('[AuthContext] refreshUser error:', error);
        return;
      }
      setUser(data.user ?? null);
    } catch (err) {
      console.error('[AuthContext] refreshUser unexpected error:', err);
    }
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
    user,              // real state, not derived
    loading,
    signUp,
    signIn,
    signOut,
    signInWithGoogleWeb,
    refreshUser,       // <– now actually available to consumers
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
