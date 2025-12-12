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
  ImageBackground,
  ScrollView,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import { useAuth } from '../context/AuthContext';
import { TranslationContext } from '../context/TranslationContext';
import { useContext } from 'react';
import Header from '../components/Header';
import DisclaimerModal from '../components/DisclaimerModal';
import { normalize, spacing } from '../utils/responsive';

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
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const [finalPasswordConfirm, setFinalPasswordConfirm] = useState('');

  const isSignIn = mode === 'signin';



  const handleModeSignIn = React.useCallback(() => {
    setMode('signin');
    setErrorMsg('');
    setUsername('');
  }, []);

  const handleModeSignUp = React.useCallback(() => {
    setMode('signup');
    setErrorMsg('');
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
        // On success, AccountScreenGate will switch to ProfileScreen automatically
      } else {
        if (!username.trim()) {
          throw new Error(t('login.enterUsername'));
        }
        if (password !== confirmPassword) {
          throw new Error(t('login.passwordsDoNotMatch'));
        }
        if (password.length < 6) {
          throw new Error(t('login.passwordTooShort'));
        }
        // Show final confirmation modal before creating account
        setShowFinalConfirm(true);
      }
    } catch (err) {
      setErrorMsg(err.message ?? t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, confirmPassword, username, isSignIn, signIn, signUp, t]);

  const handleFinalConfirm = React.useCallback(async () => {
    try {
      setSubmitting(true);
      setErrorMsg('');

      // Final password confirmation - must match the original password
      if (!finalPasswordConfirm) {
        throw new Error(t('login.enterFinalPassword'));
      }
      if (password !== finalPasswordConfirm) {
        throw new Error(t('login.finalPasswordMismatch'));
      }

      setShowFinalConfirm(false);
      await signUp(email.trim(), password, username.trim());
      // Show success message for signup (user needs to verify email)
      setSuccessMessage(t('login.verificationEmailSent'));
      setShowSuccessModal(true);
      // Clear form
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setFinalPasswordConfirm('');
      setUsername('');
    } catch (err) {
      setErrorMsg(err.message ?? t('common.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  }, [email, password, finalPasswordConfirm, username, signUp, t]);

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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header 
          title={t('login.title')}
          showProfile={false}
        />

        <View style={styles.darken}>
          <ScrollView 
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.container}>
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
          {!isSignIn && (
            <>
              <Text style={styles.label}>{t('login.username')}</Text>
              <TextInput
                style={styles.input}
                autoCapitalize="none"
                placeholder={t('login.usernamePlaceholder')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                value={username}
                onChangeText={setUsername}
              />
            </>
          )}

          <Text style={[styles.label, !isSignIn && { marginTop: 10 }]}>{t('login.email')}</Text>
          <TextInput
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
            placeholder={t('login.emailPlaceholder')}
            placeholderTextColor="rgba(209,213,219,0.5)"
            value={email}
            onChangeText={setEmail}
          />

          <Text style={[styles.label, { marginTop: 10 }]}>{t('login.password')}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            placeholder={t('login.passwordPlaceholder')}
            placeholderTextColor="rgba(209,213,219,0.5)"
            value={password}
            onChangeText={setPassword}
          />

          {!isSignIn && (
            <>
              <Text style={[styles.label, { marginTop: 10 }]}>{t('login.confirmPassword')}</Text>
              <TextInput
                style={styles.input}
                secureTextEntry
                placeholder={t('login.confirmPasswordPlaceholder')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
            </>
          )}
        </View>

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
          </ScrollView>
        </View>
      </ImageBackground>
      <DisclaimerModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={t('login.signUpSuccess')}
        message={successMessage}
      />
      <Modal
        transparent={true}
        visible={showFinalConfirm}
        animationType="fade"
        onRequestClose={() => setShowFinalConfirm(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowFinalConfirm(false)}
            >
              <Text style={styles.modalCloseIcon}>✕</Text>
            </TouchableOpacity>
            
            <Text style={styles.modalTitle}>{t('login.confirmAccountCreation')}</Text>
            <Text style={styles.modalMessage}>{t('login.finalPasswordConfirm')}</Text>
            <Text style={styles.modalWarning}>{t('login.passwordRecoveryWarning')}</Text>
            
            <Text style={styles.modalLabel}>{t('login.password')}</Text>
            <TextInput
              style={styles.modalInput}
              secureTextEntry
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor="rgba(0,0,0,0.5)"
              value={finalPasswordConfirm}
              onChangeText={setFinalPasswordConfirm}
              autoFocus
            />
            
            <View style={styles.modalButtonRow}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonCancel]} 
                onPress={() => {
                  setShowFinalConfirm(false);
                  setFinalPasswordConfirm('');
                }}
              >
                <Text style={styles.modalButtonText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.modalButtonConfirm]} 
                onPress={handleFinalConfirm}
                disabled={submitting || !finalPasswordConfirm}
              >
                <Text style={styles.modalButtonText}>{t('login.createAccount')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  darken: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.40)',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
  },
  container: {
    width: '100%',
    maxWidth: normalize(400),
    alignSelf: 'center',
  },
  subtitle: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.9)',
    fontSize: normalize(16),
    marginBottom: spacing.lg,
    fontWeight: '500',
  },

  pillRow: { 
    alignItems: 'center', 
    marginBottom: spacing.lg 
  },
  pillGroup: {
    flexDirection: 'row',
    backgroundColor: COLORS.pillGroupBg,
    padding: normalize(6),
    borderRadius: normalize(20),
  },
  pill: {
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    backgroundColor: COLORS.pillBg,
    borderRadius: normalize(18),
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  pillActive: {
    backgroundColor: COLORS.pillActiveBg,
    borderColor: 'transparent',
  },
  pillRight: { marginLeft: normalize(10) },
  pillText: { 
    color: COLORS.pillText, 
    fontWeight: '700',
    fontSize: normalize(14),
  },
  pillTextActive: { color: COLORS.pillTextActive },

  error: {
    color: '#FCA5A5',
    textAlign: 'center',
    marginBottom: spacing.md,
    fontSize: normalize(14),
    paddingHorizontal: spacing.sm,
  },

  card: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: normalize(16),
    padding: spacing.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.5)',
    marginBottom: spacing.md,
  },

  label: { 
    color: '#fff', 
    fontWeight: '600', 
    marginBottom: spacing.xs,
    fontSize: normalize(14),
  },
  input: {
    backgroundColor: 'rgba(15,23,42,0.7)',
    borderRadius: normalize(10),
    padding: normalize(12),
    color: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
    fontSize: normalize(16),
  },

  primaryButton: {
    marginTop: spacing.md,
    backgroundColor: COLORS.pillActiveBg,
    paddingVertical: normalize(14),
    borderRadius: normalize(12),
    alignItems: 'center',
    minHeight: normalize(48),
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: normalize(16),
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: spacing.lg,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    marginHorizontal: spacing.sm,
    color: 'rgba(255,255,255,0.8)',
    fontSize: normalize(14),
  },

  googleButton: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: normalize(14),
    borderRadius: normalize(10),
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: normalize(48),
  },
  googleButtonText: {
    color: '#1f2937',
    fontWeight: '700',
    fontSize: normalize(16),
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: COLORS.pillActiveBg,
    fontSize: 13,
    fontWeight: '600',
  },
  resetInstructions: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 20,
  },
  backButton: {
    marginTop: 12,
    alignItems: 'center',
  },
  backButtonText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
  },
  modalContainer: {
    width: '100%',
    maxWidth: normalize(400),
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: normalize(16),
    padding: spacing.lg,
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: normalize(30),
    height: normalize(30),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalCloseIcon: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#2d4887',
  },
  modalTitle: {
    fontSize: normalize(22),
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#2d4887',
  },
  modalMessage: {
    fontSize: normalize(16),
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#333',
    lineHeight: normalize(22),
  },
  modalWarning: {
    fontSize: normalize(14),
    textAlign: 'center',
    marginBottom: spacing.md,
    color: '#ef4444',
    fontWeight: '600',
    lineHeight: normalize(20),
  },
  modalLabel: {
    fontSize: normalize(14),
    fontWeight: '600',
    marginBottom: spacing.xs,
    color: '#333',
    marginTop: spacing.sm,
  },
  modalInput: {
    backgroundColor: 'rgba(15,23,42,0.1)',
    borderRadius: normalize(10),
    padding: normalize(12),
    color: '#333',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.2)',
    fontSize: normalize(16),
    marginBottom: spacing.md,
  },
  modalButtonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  modalButton: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalButtonCancel: {
    backgroundColor: 'rgba(148,163,184,0.3)',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.pillActiveBg,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: normalize(16),
  },
});
