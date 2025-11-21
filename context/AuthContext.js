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

    async function initAuth() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (!isMounted) return;

        if (error) {
          console.error('[AuthContext] getSession error:', error);
        } else {
          setSession(data.session ?? null);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    initAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
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
