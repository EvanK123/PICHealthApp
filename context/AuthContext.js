// context/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { supabase } from '../services/supabaseClient';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';

WebBrowser.maybeCompleteAuthSession();


const AuthContext = createContext();



export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Handle OAuth callback on web
  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Check if we're on the OAuth callback route
      const url = window.location.href;
      if (url.includes('/auth/callback')) {
        // Supabase will automatically detect the session from the URL
        // Clean up the URL after a short delay to let Supabase process it
        setTimeout(() => {
          if (window.history && window.history.replaceState) {
            window.history.replaceState({}, document.title, '/');
          }
        }, 1000);
      }
    }
  }, []);

  // Load initial session and subscribe to changes
  useEffect(() => {
    let isMounted = true;
    let subscription = null;

    async function initAuth() {
      try {
        // Check if Supabase is configured
        const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
        const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
        
        if (!supabaseUrl || !supabaseKey) {
          if (isMounted) {
            setSession(null);
            setUser(null);
            setLoading(false);
          }
          return;
        }

        // Add timeout to prevent hanging (increased to 15 seconds for slower networks)
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Session fetch timeout - check your network connection and Supabase configuration')), 15000)
        );

        const sessionPromise = supabase.auth.getSession();
        const { data, error } = await Promise.race([
          sessionPromise,
          timeoutPromise,
        ]);

        if (!isMounted) return;

        if (error) {
          setSession(null);
          setUser(null);
        } else {
          const currentSession = data?.session ?? null;
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (err) {
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
      } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        if (!isMounted) return;
        
        // Store the event type for password recovery detection
        if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset link - they need to set a new password
          // The session is created but we'll handle navigation in the component
        }
        
        // When user signs in (after email verification), ensure profile exists and is up to date
        if (event === 'SIGNED_IN' && newSession?.user) {
          const userId = newSession.user.id;
          const userEmail = newSession.user.email;
          const fullName = newSession.user.user_metadata?.full_name;
          
          // Try to ensure profile exists and has the correct username
          if (fullName) {
            try {
              const { error: profileError } = await supabase
                .from('profiles')
                .upsert(
                  {
                    id: userId,
                    email: userEmail,
                    full_name: fullName,
                  },
                  { onConflict: 'id' }
                );
              
              if (profileError) {
                // Don't throw - profile should exist from trigger
              }
            } catch (err) {
              // Silently handle profile update errors
            }
          }
        }
        
        setSession(newSession);
        setUser(newSession?.user ?? null);
      });
      subscription = authSubscription;
    } catch (err) {
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
  const signUp = async (email, password, username = null) => {
    const { data, error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        data: {
          full_name: username || null
        }
      }
    });
    if (error) throw error;
    
    // Note: A database trigger should automatically create the profile
    // when a new user is created in auth.users. The trigger will extract
    // the full_name from the user's metadata.
    // 
    // We don't try to update the profile here because:
    // 1. The user needs to verify their email first (not authenticated yet)
    // 2. RLS policies prevent unauthenticated users from updating profiles
    // 3. The trigger already handles profile creation with the username from metadata
    // 
    // The profile will be updated automatically when the user verifies their email
    // and signs in, or we can handle it in the auth state change listener.
    
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
        return;
      }
      setUser(data.user ?? null);
    } catch (err) {
      // Silently handle refresh errors
    }
  };

  //Redirect URI - use the scheme from app.json
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: process.env.EXPO_PUBLIC_APP_SCHEME || "com.anonymous.PICHealthMobApp",
    path: "auth/callback",
  });

  // Google login for mobile (iOS/Android) - uses AuthSession
  const signInWithGoogle = async () => {
    const baseUrl = new URL('/auth/v1/authorize', process.env.EXPO_PUBLIC_SUPABASE_URL);
    baseUrl.searchParams.set('provider', 'google');
    baseUrl.searchParams.set('redirect_to', redirectUri);
    const authUrl = baseUrl.toString();

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

  //Google OAuth sign in - handles both web and mobile
  const signInWithGoogleWeb = async () => {
    let redirectUrl;

    if (Platform.OS === 'web') {
      redirectUrl = typeof window !== 'undefined'
        ? `${window.location.origin}/auth/callback`
        : undefined;
    } else {
      // For mobile, use the redirect URI
      redirectUrl = redirectUri;
    }

    if (Platform.OS === 'web') {
      // For web, use signInWithOAuth which will redirect
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

      if (error) {
        throw error;
      }
      
      // On web, the redirect will happen automatically
      // The session will be detected from the URL when the page loads
      // Supabase will automatically extract tokens from URL hash fragments
      return data;
    } else {
      // For mobile, use AuthSession to handle the OAuth flow properly
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          skipBrowserRedirect: true, // We'll handle the browser ourselves
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        throw error;
      }

      if (!data?.url) {
        throw new Error('Failed to get OAuth URL');
      }

      // Use AuthSession to open the browser and handle the callback
      const result = await AuthSession.startAsync({
        authUrl: data.url,
        returnUrl: redirectUrl,
      });

      if (result.type !== "success") {
        throw new Error(`Google sign-in was cancelled or failed: ${result.type}`);
      }

      // Extract tokens from the callback URL
      const { access_token, refresh_token } = result.params || {};

      if (!access_token || !refresh_token) {
        throw new Error("Failed to get authentication tokens from callback");
      }

      // Set the session with the tokens
      const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
        access_token,
        refresh_token,
      });

      if (sessionError) {
        throw sessionError;
      }

      return sessionData;
    }
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