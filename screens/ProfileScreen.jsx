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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import Header from '../components/Header';

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



  const handleSignOut = React.useCallback(async () => {
    try {
      await signOut();
      navigation.goBack();
    } catch (err) {
      console.error('[ProfileScreen] signOut error:', err);
    }
  }, [signOut, navigation]);

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

      alert(t('profile.profileUpdated'));
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
        <View style={styles.actionsCard}>
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
        </View>
          </View>
        </View>
      </ImageBackground>
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
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.pillActiveBg,
    borderRadius: 999,
    paddingVertical: 10,
    justifyContent: 'center',
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
