// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import * as WebBrowser from 'expo-web-browser';

WebBrowser.maybeCompleteAuthSession();


const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);



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

  //Redirect URI
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "com.anonymous.PICHealthMobApp",
    path: "auth/callback",
  });

  // Google login – web/PWA flow
  const signInWithGoogle= async () => {
    const authUrl =
      `${process.env.EXPO_PUBLIC_SUPABASE_URL}/auth/v1/authorize` +
      `?provider=google&redirect_to=${encodeURIComponent(redirectUri)}`;

    const result = await AuthSession.startAsync({
      authUrl,
      returnUrl: redirectUri,
    });

    if (result.type !== "success") {
      throw new Error("Google sign-in was cancelled");
    }

    const { access_token, refresh_token } = result.params;

    const { data, error } = await supabase.auth.setSession({
      access_token,
      refresh_token,
    });

    if (error) throw error;
    return data;
  };

  //Google web sign in
  const signInWithGoogleWeb = async () => {
    let redirectUrl;

    if (Platform.OS === 'web') {
      redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;
    } else {
      redirectUrl = redirectUri;
    }

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;


    if (Platform.OS !== 'web' && data?.url) {
      await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectUrl
      );
    }

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
    signInWithGoogle,
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
