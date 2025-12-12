// screens/ProfileScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Platform,
  ImageBackground,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';
import DisclaimerModal from '../components/DisclaimerModal';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode as decodeBase64 } from 'base64-arraybuffer';

import { useAuth } from '../context/AuthContext';
import { TranslationContext } from '../context/TranslationContext';
import { supabase } from '../services/supabaseClient';

const COLORS = {
  headerBg: '#2d4887',
  pillActiveBg: '#0EA5B5',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut, refreshUser } = useAuth();
  const { t } = React.useContext(TranslationContext);

  const fullName = user?.user_metadata?.full_name || null;
  const email = user?.email ?? t('profile.unknownUser');
  const userId = user?.id ?? '—';
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  // Name change state
  const [showNameForm, setShowNameForm] = React.useState(false);
  const [newName, setNewName] = React.useState(fullName || '');

  // Password change state
  const [showPasswordForm, setShowPasswordForm] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');
  const [isUpdating, setIsUpdating] = React.useState(false);

  // Success modal state
  const [showSuccessModal, setShowSuccessModal] = React.useState(false);
  const [successTitle, setSuccessTitle] = React.useState('');
  const [successMessage, setSuccessMessage] = React.useState('');

  // Error modal state
  const [showErrorModal, setShowErrorModal] = React.useState(false);
  const [errorTitle, setErrorTitle] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');



  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      navigation.goBack();
    } catch (err) {
      console.error('[ProfileScreen] signOut error:', err);
    }
  }, [signOut, navigation]);

  const handleUpdateName = React.useCallback(async () => {
    if (!user || !newName.trim()) {
      Alert.alert('Error', t('profile.nameUpdateFailed'));
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: newName.trim() },
      });

      if (error) {
        console.error('[ProfileScreen] updateName error:', error);
        Alert.alert('Error', t('profile.nameUpdateFailed'));
        return;
      }

      await refreshUser();
      
      // Update profiles table so other users can see the updated name
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { 
            id: user.id, 
            full_name: newName.trim(),
            email: user.email 
          },
          { onConflict: 'id' }
        );
      
      if (profileError) {
        console.error('[ProfileScreen] Error updating profile:', profileError);
        // Continue even if profile update fails
      }
      
      // Update existing comments with the new name
      const { error: updateCommentsError } = await supabase
        .from('event_comments')
        .update({ username: newName.trim() })
        .eq('user_id', user.id);
      
      if (updateCommentsError) {
        console.error('[ProfileScreen] Error updating comments:', updateCommentsError);
        // Don't fail the whole operation if comment update fails
      }
      
      setShowNameForm(false);
      setSuccessTitle(t('profile.success'));
      setSuccessMessage(t('profile.nameUpdated'));
      setShowSuccessModal(true);
    } catch (err) {
      console.error('[ProfileScreen] updateName unexpected error:', err);
      Alert.alert('Error', t('profile.nameUpdateFailed'));
    } finally {
      setIsUpdating(false);
    }
  }, [user, newName, refreshUser, t]);

  const handleUpdatePassword = React.useCallback(async () => {
    if (!user || !currentPassword || !newPassword || !confirmPassword) {
      setErrorTitle(t('profile.error'));
      setErrorMessage(t('profile.passwordUpdateFailed'));
      setShowErrorModal(true);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorTitle(t('profile.error'));
      setErrorMessage(t('profile.passwordMismatch'));
      setShowErrorModal(true);
      return;
    }

    if (newPassword.length < 6) {
      setErrorTitle(t('profile.error'));
      setErrorMessage(t('profile.passwordTooShort'));
      setShowErrorModal(true);
      return;
    }

    setIsUpdating(true);
    try {
      // First verify current password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        // Extract user-friendly error message from Supabase error
        let errorMsg = t('profile.invalidCurrentPassword');
        if (signInError.message) {
          errorMsg = signInError.message;
        } else if (signInError.error_description) {
          errorMsg = signInError.error_description;
        } else if (signInError.msg) {
          errorMsg = signInError.msg;
        }
        setErrorTitle(t('profile.error'));
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        setIsUpdating(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        console.error('[ProfileScreen] updatePassword error:', updateError);
        // Extract user-friendly error message from Supabase error
        let errorMsg = t('profile.passwordUpdateFailed');
        if (updateError.message) {
          errorMsg = updateError.message;
        } else if (updateError.error_description) {
          errorMsg = updateError.error_description;
        } else if (updateError.msg) {
          errorMsg = updateError.msg;
        }
        setErrorTitle(t('profile.error'));
        setErrorMessage(errorMsg);
        setShowErrorModal(true);
        setIsUpdating(false);
        return;
      }

      // Clear form
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setSuccessTitle(t('profile.success'));
      setSuccessMessage(t('profile.passwordUpdated'));
      setShowSuccessModal(true);
    } catch (err) {
      console.error('[ProfileScreen] updatePassword unexpected error:', err);
      // Extract user-friendly error message
      let errorMsg = t('profile.passwordUpdateFailed');
      if (err?.message) {
        errorMsg = err.message;
      } else if (err?.error_description) {
        errorMsg = err.error_description;
      } else if (err?.msg) {
        errorMsg = err.msg;
      } else if (err?.toString) {
        errorMsg = err.toString();
      }
      setErrorTitle(t('profile.error'));
      setErrorMessage(errorMsg);
      setShowErrorModal(true);
    } finally {
      setIsUpdating(false);
    }
  }, [user, currentPassword, newPassword, confirmPassword, t]);

  const handleChangeAvatar = React.useCallback(async () => {
    try {
      if (!user) return;

      // Ask for permission (on web this just returns granted)
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alert(t('profile.permissionRequired'));
        return;
      }

      const mediaTypes =
        (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
        (ImagePicker.MediaTypeOptions &&
          ImagePicker.MediaTypeOptions.Images);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true, // request base64 to avoid extra filesystem reads
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) {
        console.error('[ProfileScreen] No asset URI returned from picker');
        alert(t('profile.avatarChangeError'));
        return;
      }

      // Build path & mimetype
      const fileExt =
        (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const mimeType = asset.mimeType || 'image/jpeg';

      let uploadError = null;

      if (Platform.OS === 'web') {
        // 🔹 WEB: upload File / Blob directly
        let fileToUpload = asset.file || null;

        // Fallback: fetch the asset URI and convert to Blob
        if (!fileToUpload && asset.uri) {
          const res = await fetch(asset.uri);
          const blob = await res.blob();
          fileToUpload = blob;
        }

        if (!fileToUpload) {
          console.error('[ProfileScreen] No file to upload on web');
          alert(t('profile.uploadFailed'));
          return;
        }

        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, fileToUpload, {
            contentType: mimeType,
            upsert: true,
          });

        uploadError = error;
      } else {
        // 🔹 NATIVE: keep your existing base64 -> ArrayBuffer upload
        const fileUri = asset.uri;
        // Prefer picker-provided base64 to avoid deprecated file-system API
        const base64 =
          asset.base64 ||
          (await FileSystem.readAsStringAsync(fileUri, {
            encoding: FileSystem.EncodingType?.Base64 || 'base64',
          }));

        const arrayBuffer = decodeBase64(base64);

        const { error } = await supabase.storage
          .from('avatars')
          .upload(filePath, arrayBuffer, {
            contentType: mimeType,
            upsert: true,
          });

        uploadError = error;
      }

      if (uploadError) {
        console.error('[ProfileScreen] upload error:', uploadError);
        alert(t('profile.uploadFailed'));
        return;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const baseUrl = publicData?.publicUrl;
      if (!baseUrl) {
        alert(t('profile.avatarUrlFailed'));
        return;
      }

      // Cache-busting so browser doesn't reuse old image
      const versionedUrl = `${baseUrl}?t=${Date.now()}`;

      // Save URL in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: versionedUrl },
      });

      if (updateError) {
        console.error('[ProfileScreen] updateUser error:', updateError);
        alert(t('profile.saveAvatarFailed'));
        return;
      }

      // Persist avatar URL in profiles so other users can see it (e.g., in comments)
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(
          { id: user.id, avatar_url: versionedUrl, email: user.email },
          { onConflict: 'id' }
        );

      if (profileError) {
        console.error('[ProfileScreen] profile upsert error:', profileError);
        // continue; not fatal for current user cache
      }

      // Refresh user so UI gets new avatar_url
      await refreshUser();

      setSuccessTitle(t('profile.success'));
      setSuccessMessage(t('profile.profileUpdated'));
      setShowSuccessModal(true);
    } catch (err) {
      console.error(
        '[ProfileScreen] handleChangeAvatar unexpected error:',
        err
      );
      alert(t('profile.avatarChangeError'));
    }
  }, [user, t, refreshUser]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <ImageBackground
        source={require('../assets/beach-bg.jpg')}
        resizeMode="cover"
        style={styles.image}
        blurRadius={0}
      >
        <Header 
          title={t('profile.title')}
        />

        <View style={styles.darken}>
          <View style={styles.container}>
        {/* profile card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              {avatarUrl ? (
                <View style={styles.avatarWrapper}>
                  <Image
                    key={avatarUrl || 'default-avatar'}
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                  />
                </View>
              ) : (
                <Icon name="person-circle-outline" size={52} color="#ffffff" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>
                {fullName || email}
              </Text>
              {fullName && (
                <Text style={styles.userEmailSecondary}>{email}</Text>
              )}
              <Text style={styles.userLabel}>{t('profile.signedInTo')}</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('profile.userId')}</Text>
            <Text
              style={styles.infoValue}
              numberOfLines={1}
              ellipsizeMode="middle"
            >
              {userId}
            </Text>
          </View>
        </View>

        {/* actions */}
        <ScrollView style={styles.actionsCard} showsVerticalScrollIndicator={false}>
          <TouchableOpacity
            style={styles.avatarButton}
            onPress={handleChangeAvatar}
            activeOpacity={0.9}
          >
            <Icon
              name="camera-outline"
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.avatarButtonText}>
              {t('profile.changeProfilePhoto')}
            </Text>
          </TouchableOpacity>

          {/* Change Name Section */}
          {!showNameForm ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => {
                setNewName(fullName || '');
                setShowNameForm(true);
              }}
              activeOpacity={0.9}
            >
              <Icon
                name="person-outline"
                size={18}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>
                {t('profile.changeName')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('profile.name')}</Text>
              <TextInput
                style={styles.formInput}
                value={newName}
                onChangeText={setNewName}
                placeholder={t('profile.enterName')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                autoCapitalize="words"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonCancel]}
                  onPress={() => {
                    setShowNameForm(false);
                    setNewName(fullName || '');
                  }}
                  disabled={isUpdating}
                >
                  <Text style={styles.formButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonSave]}
                  onPress={handleUpdateName}
                  disabled={isUpdating || !newName.trim()}
                  activeOpacity={0.8}
                >
                  <Text style={styles.formButtonText}>{t('profile.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* Change Password Section */}
          {!showPasswordForm ? (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => setShowPasswordForm(true)}
              activeOpacity={0.9}
            >
              <Icon
                name="lock-closed-outline"
                size={18}
                color="#ffffff"
                style={{ marginRight: 6 }}
              />
              <Text style={styles.actionButtonText}>
                {t('profile.changePassword')}
              </Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.formContainer}>
              <Text style={styles.formLabel}>{t('profile.currentPassword')}</Text>
              <TextInput
                style={styles.formInput}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder={t('profile.enterCurrentPassword')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.formLabel}>{t('profile.newPassword')}</Text>
              <TextInput
                style={styles.formInput}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder={t('profile.enterNewPassword')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                secureTextEntry
                autoCapitalize="none"
              />
              <Text style={styles.formLabel}>{t('profile.confirmPassword')}</Text>
              <TextInput
                style={styles.formInput}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('profile.enterConfirmPassword')}
                placeholderTextColor="rgba(209,213,219,0.5)"
                secureTextEntry
                autoCapitalize="none"
              />
              <View style={styles.formButtons}>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonCancel]}
                  onPress={() => {
                    setShowPasswordForm(false);
                    setCurrentPassword('');
                    setNewPassword('');
                    setConfirmPassword('');
                  }}
                  disabled={isUpdating}
                >
                  <Text style={styles.formButtonText}>{t('profile.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.formButton, styles.formButtonSave]}
                  onPress={handleUpdatePassword}
                  disabled={isUpdating || !currentPassword || !newPassword || !confirmPassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.formButtonText}>{t('profile.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={styles.signOutButton}
            onPress={handleSignOut}
            activeOpacity={0.9}
          >
            <Icon
              name="log-out-outline"
              size={18}
              color="#ffffff"
              style={{ marginRight: 6 }}
            />
            <Text style={styles.signOutText}>{t('profile.signOut')}</Text>
          </TouchableOpacity>

          <Text style={styles.subText}>
            {t('profile.signOutMessage')}
          </Text>
        </ScrollView>
          </View>
        </View>
      </ImageBackground>
      <DisclaimerModal
        visible={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        title={successTitle}
        message={successMessage}
      />
      <DisclaimerModal
        visible={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorTitle}
        message={errorMessage}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  image: { flex: 1, width: '100%', height: '100%' },
  darken: { flex: 1, backgroundColor: 'rgba(0,0,0,0.40)' },


  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 12,
  },

  card: {
    backgroundColor: 'rgba(15,23,42,0.9)',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.5)',
    marginBottom: 16,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarCircle: {
    marginRight: 12,
  },
  avatarWrapper: {
    width: 52,
    height: 52,
    borderRadius: 26,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.pillActiveBg,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  userInfo: {
    flex: 1,
  },
  userEmail: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  userEmailSecondary: {
    color: 'rgba(209,213,219,0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  userLabel: {
    marginTop: 4,
    color: 'rgba(209,213,219,0.8)',
    fontSize: 13,
  },
  divider: {
    marginTop: 12,
    marginBottom: 10,
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(148,163,184,0.7)',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoLabel: {
    color: 'rgba(209,213,219,0.9)',
    fontSize: 13,
  },
  infoValue: {
    color: '#E5E7EB',
    fontSize: 12,
    maxWidth: '65%',
  },

  actionsCard: {
    backgroundColor: 'rgba(15,23,42,0.95)',
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(148,163,184,0.4)',
    maxHeight: 600,
  },
  avatarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27427a',
    borderRadius: 999,
    paddingVertical: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27427a',
    borderRadius: 999,
    paddingVertical: 10,
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    backgroundColor: 'rgba(30,41,59,0.8)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
  },
  formLabel: {
    color: 'rgba(209,213,219,0.9)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 12,
  },
  formInput: {
    backgroundColor: 'rgba(15,23,42,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(148,163,184,0.3)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 10,
  },
  formButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formButtonCancel: {
    backgroundColor: 'rgba(148,163,184,0.2)',
  },
  formButtonSave: {
    backgroundColor: COLORS.pillActiveBg,
  },
  formButtonText: {
    color: '#F9FAFB',
    fontSize: 14,
    fontWeight: '600',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillActiveBg,
    borderRadius: 999,
    paddingVertical: 10,
    justifyContent: 'center',
    marginTop: 10,
  },
  signOutText: {
    color: '#F9FAFB',
    fontSize: 15,
    fontWeight: '700',
  },
  subText: {
    marginTop: 10,
    color: 'rgba(209,213,219,0.8)',
    fontSize: 12,
    textAlign: 'center',
  },
});
