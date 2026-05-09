import { useUser } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
let ImagePicker: any;
try {
  // dynamically require to avoid TS errors when dependency is not installed in CI/editor
  // runtime will still attempt to require; if expo-image-picker is unavailable, image pick is disabled
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  ImagePicker = require('expo-image-picker');
} catch (e) {
  ImagePicker = null;
}

export default function SetupAccount() {
  const router = useRouter();
  const { user, setUser, copyImageToDocuments } = useUser();
  const [firstName, setFirstName] = useState(user.firstName);
  const [lastName, setLastName] = useState(user.lastName);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState(user.role || '');
  const [organization, setOrganization] = useState(user.organization || '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri || null);

  const pickImage = async () => {
    try {
      if (!ImagePicker) return;
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') return;
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });
      if (!result.cancelled) {
        // @ts-ignore
        const uri = result.uri;
        // Store the URI directly - Expo's image picker provides persistent cache URIs
        setAvatarUri(uri);
      }
    } catch (e) {
      console.warn('Failed to pick image:', e);
    }
  };

  const handleSave = async () => {
    await setUser({
      firstName,
      lastName,
      email,
      role,
      organization,
      avatarUri: avatarUri || undefined,
    });
    router.back();
  };

  return (
    <SafeAreaView style={styles.screen} edges={[ 'left', 'right', 'bottom' ]}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <View style={styles.headerRow}>
        <Pressable style={styles.back} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={20} color="#0F172A" />
        </Pressable>
        <Text style={styles.headerTitle}>Set Up Your Account</Text>
      </View>

      <View style={styles.container}>
        <Pressable style={styles.avatarWrap} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(firstName, lastName)}</Text>
              <View style={styles.editBadge}>
                <Ionicons name="pencil" size={14} color="#FFFFFF" />
              </View>
            </View>
          )}
        </Pressable>

        <View style={styles.field}>
          <Text style={styles.label}>First name</Text>
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Last name</Text>
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Email</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Role</Text>
          <TextInput style={styles.input} value={role} onChangeText={setRole} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Organization</Text>
          <TextInput style={styles.input} value={organization} onChangeText={setOrganization} />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} activeOpacity={0.9}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function getInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  headerRow: {
    height: 64,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEF2F7',
  },
  back: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    marginRight: 12,
  },
  headerTitle: { flex: 1, textAlign: 'center', fontWeight: '800', fontSize: 16, color: '#0F172A' },
  container: { paddingHorizontal: 20, paddingTop: 24 },
  avatarWrap: { alignSelf: 'center', marginBottom: 18 },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#1F6FE5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: { width: 96, height: 96, borderRadius: 48 },
  avatarInitials: { color: '#FFFFFF', fontWeight: '900', fontSize: 28 },
  editBadge: {
    position: 'absolute',
    right: -6,
    bottom: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  field: { marginBottom: 14 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    height: 48,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
  },
  saveButton: {
    marginTop: 18,
    backgroundColor: '#1F6FE5',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveText: { color: '#FFFFFF', fontWeight: '900', fontSize: 16 },
});
