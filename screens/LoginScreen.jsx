// screens/LoginScreen.jsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { TranslationContext } from '../context/TranslationContext';
import { useContext } from 'react';

const COLORS = {
  headerBg: '#2d4887',
  pillGroupBg: 'rgba(255,255,255,0.12)',
  pillBg: '#27427a',
  pillActiveBg: '#0EA5B5',
  pillText: 'rgba(255,255,255,0.75)',
  pillTextActive: '#ffffff',
};

export default function LoginScreen() {
  const navigation = useNavigation();
  const { signIn, signUp, signInWithGoogleWeb } = useAuth();
  const { t } = useContext(TranslationContext);

  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isSignIn = mode === 'signin';



  const handleModeSignIn = React.useCallback(() => {
    setMode('signin');
  }, []);

  const handleModeSignUp = React.useCallback(() => {
    setMode('signup');
  }, []);

  const handleSubmit = React.useCallback(async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');

      if (!email || !password) {
        throw new Error(t('login.enterEmailPassword'));
      }

      if (isSignIn) {
        await signIn(email.trim(), password);
      } else {
        await signUp(email.trim(), password);
      }

      // On success, AccountScreenGate will switch to ProfileScreen automatically
    } catch (err) {
      setErrorMsg(err.message ?? t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, isSignIn, signIn, signUp, t]);

  const handleGoogle = React.useCallback(async () => {
    try {
      setSubmitting(true);
      setErrorMsg("");

      await signInWithGoogleWeb();

  } catch (err) {
    setErrorMsg(err.message ?? t("login.googleSignInFailed"));
  } finally {
    setSubmitting(false);
  }
}, [signInWithGoogleWeb, t]);

  return (
    <SafeAreaView style={styles.safeArea}>


      <View style={styles.container}>
        <Text style={styles.appTitle}>{t('login.title')}</Text>
        <Text style={styles.subtitle}>
          {t('login.subtitle')}
        </Text>

        {/* Toggle pills matching CalendarBar */}
        <View style={styles.pillRow}>
          <View style={styles.pillGroup}>
            <TouchableOpacity
              onPress={handleModeSignIn}
              activeOpacity={0.9}
              style={[styles.pill, isSignIn && styles.pillActive]}
            >
              <Text
                style={[styles.pillText, isSignIn && styles.pillTextActive]}
              >
                {t('login.logIn')}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleModeSignUp}
              activeOpacity={0.9}
              style={[
                styles.pill,
                styles.pillRight,
                !isSignIn && styles.pillActive,
              ]}
            >
              <Text
                style={[styles.pillText, !isSignIn && styles.pillTextActive]}
              >
                {t('login.signUp')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

        {/* Form card */}
        <View style={styles.card}>
          <Text style={styles.label}>{t('login.email')}</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 10 }]}>{t('login.password')}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.9}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>
                {isSignIn ? t('login.logIn') : t('login.createAccount')}
              </Text>
            )}
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.dividerRow}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>{t('common.or')}</Text>
            <View style={styles.divider} />
          </View>

          {/* Google sign-in */}
          <TouchableOpacity
            style={styles.googleButton}
            onPress={handleGoogle}
            disabled={submitting}
          >
            <Icon
              name="logo-google"
              size={18}
              color="#1f2937"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.googleButtonText}>{t('login.continueWithGoogle')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: COLORS.headerBg },

  container: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  appTitle: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.75)',
    marginBottom: 20,
  },

  pillRow: { alignItems: 'center', marginBottom: 18 },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.pillGroupBg,
    padding: 6,
    borderRadius: 20,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: COLORS.pillBg,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pillActive: {
    backgroundColor: COLORS.pillActiveBg,
    borderColor: 'transparent',
  },
  pillRight: { marginLeft: 10 },
  pillText: { color: COLORS.pillText, fontWeight: '700' },
  pillTextActive: { color: COLORS.pillTextActive },

  error: {
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: 10,
  },

  card: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.4)',
  },

  label: { color: '#fff', fontWeight: '600', marginBottom: 4 },
  input: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderRadius: 10,
    padding: 10,
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },

  primaryButton: {
    marginTop: 16,
    backgroundColor: COLORS.pillActiveBg,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    marginHorizontal: 10,
    color: 'rgba(255,255,255,0.8)',
  },

  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 12,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  googleButtonText: {
    color: '#1f2937',
    fontWeight: '700',
  },
});
