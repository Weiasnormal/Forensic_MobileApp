import { useUser } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
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

  const nav = router as any;
  const canContinue = firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 3;

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <TopBar title="Set Up Your Account" onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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
          <FieldLabel label="First name" />
          <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholder="First name" placeholderTextColor="#CBD5E1" />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Last name" />
          <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholder="Last name" placeholderTextColor="#CBD5E1" />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Email" />
          <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" placeholder="you@example.com" placeholderTextColor="#CBD5E1" />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Role" />
          <TextInput style={styles.input} value={role} onChangeText={setRole} placeholder="Role (e.g., Examiner)" placeholderTextColor="#CBD5E1" />
        </View>

        <View style={styles.field}>
          <FieldLabel label="Organization" />
          <TextInput style={styles.input} value={organization} onChangeText={setOrganization} placeholder="Organization" placeholderTextColor="#CBD5E1" />
        </View>

      </ScrollView>

      <View style={styles.buttonContainer}>
        <Pressable onPress={handleSave} disabled={!canContinue} style={[styles.primaryButton, !canContinue && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function getInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#FFFFFF' },
  topBarWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  /* progress styles removed */
  content: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 140,
    gap: 16,
  },
  avatarWrap: { alignSelf: 'center', marginBottom: 8 },
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
    right: -1,
    bottom: -1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  field: { marginBottom: 14 },
  label: { color: '#94A3B8', fontSize: 13, fontWeight: '700', marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EBF0',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: '#1F6FE5',
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    opacity: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

function TopBar({ title, step, onBackPress }: { title: string; step?: string; onBackPress: () => void }) {
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backButtonBox}>
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        {step ? <Text style={styles.stepCounter}>{step}</Text> : <View style={{ width: 48 }} />}
      </View>
    </View>
  );
}

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}
