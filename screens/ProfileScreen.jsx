// screens/ProfileScreen.jsx
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';

import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { decode as decodeBase64 } from 'base64-arraybuffer';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../services/supabaseClient';

const COLORS = {
  headerBg: '#2d4887',
  pillActiveBg: '#0EA5B5',
};

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { user, signOut } = useAuth();

  const email = user?.email ?? 'Unknown user';
  const userId = user?.id ?? '—';
  const avatarUrl = user?.user_metadata?.avatar_url ?? null;

  const handleSignOut = async () => {
    try {
      await signOut();
      navigation.goBack();
    } catch (err) {
      console.error('[ProfileScreen] signOut error:', err);
    }
  };

  const handleChangeAvatar = async () => {
    try {
      if (!user) return;

      // Ask for permission
      const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        alert(
          'Permission to access photos is required to set a profile picture.'
        );
        return;
      }

      // Pick image – support both old (MediaTypeOptions) and new (MediaType) APIs
      const mediaTypes =
        (ImagePicker.MediaType && ImagePicker.MediaType.Images) ||
        (ImagePicker.MediaTypeOptions &&
          ImagePicker.MediaTypeOptions.Images);

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) return;

      const asset = result.assets[0];
      const fileUri = asset.uri;

      // Read file as base64
      const base64 = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Convert base64 -> ArrayBuffer (binary)
      const arrayBuffer = decodeBase64(base64);

      // Build path & mime type
      const fileExt =
        (asset.fileName?.split('.').pop() || 'jpg').toLowerCase();
      const fileName = `${user.id}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      const mimeType = asset.mimeType || 'image/jpeg';

      // Upload raw binary to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: mimeType,
          upsert: true,
        });

      if (uploadError) {
        console.error('[ProfileScreen] upload error:', uploadError);
        alert('Failed to upload profile picture.');
        return;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = publicData?.publicUrl;
      if (!publicUrl) {
        alert('Could not retrieve avatar URL.');
        return;
      }

      // Save URL in user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { avatar_url: publicUrl },
      });

      if (updateError) {
        console.error('[ProfileScreen] updateUser error:', updateError);
        alert('Failed to save avatar URL.');
        return;
      }

      alert('Profile picture updated! It may take a moment to refresh.');
    } catch (err) {
      console.error(
        '[ProfileScreen] handleChangeAvatar unexpected error:',
        err
      );
      alert('Something went wrong while changing your avatar.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          activeOpacity={0.8}
        >
          <Icon name="chevron-back" size={22} color="#ffffff" />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>Account</Text>
        <View style={{ width: 22 }} />
      </View>

      <View style={styles.container}>
        {/* profile card */}
        <View style={styles.card}>
          <View style={styles.profileRow}>
            <View style={styles.avatarCircle}>
              {avatarUrl ? (
                <View style={styles.avatarWrapper}>
                  <Image
                    source={{ uri: avatarUrl }}
                    style={styles.avatarImage}
                  />
                </View>
              ) : (
                <Icon name="person-circle-outline" size={52} color="#ffffff" />
              )}
            </View>
            <View style={styles.userInfo}>
              <Text style={styles.userEmail}>{email}</Text>
              <Text style={styles.userLabel}>Signed in to PIC Health</Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>User ID</Text>
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
            <Text style={styles.avatarButtonText}>Change profile photo</Text>
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
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <Text style={styles.subText}>
            You’ll be returned to the app after signing out.
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.headerBg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 8,
    paddingTop: 4,
  },
  backButton: {
    padding: 4,
  },
  topBarTitle: {
    flex: 1,
    textAlign: 'center',
    color: '#F9FAFB',
    fontSize: 18,
    fontWeight: '700',
  },

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
