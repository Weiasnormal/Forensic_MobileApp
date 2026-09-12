import { useUser } from '@/store/userStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import ErrorModal from '@/_components/modals/error_modal';
import ErrorBanner from '@/_components/common/ErrorBanner';
import ScreenHeader from '@/_components/common/ScreenHeader';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useAuthStore } from '@/store/authStore';
import ProfileSaveModal from '@/_components/modals/profile_save';
import ChangeEmailModal from '@/_components/modals/change_email';
import ChangeEmailSuccessModal from '@/_components/modals/change_email_success';
import { resendVerificationEmail } from '@/services/emailVerificationApi';
import FormField from '@/_components/common/FormField';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export default function SetupAccount() {
  const router = useRouter();
  const { user, setUser } = useUser();
  const [firstName, setFirstName] = useState(user.firstName ?? '');
  const [lastName, setLastName] = useState(user.lastName ?? '');
  const authEmail = useAuthStore((state) => state.user?.email);
  const email = authEmail || user.email || '';
  const [role] = useState(user.role ?? '');
  const [organization] = useState(user.organization ?? '');
  const [avatarUri, setAvatarUri] = useState<string | null>(user.avatarUri ?? null);
  const [showSaveProfileModal, setShowSaveProfileModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [avatarError, setAvatarError] = useState<string | null>(null);

  const [showChangeEmail, setShowChangeEmail] = useState(false);
  const [showChangeEmailSuccess, setShowChangeEmailSuccess] = useState(false);
  const [pendingNewEmail, setPendingNewEmail] = useState<string | null>(null);


  const pickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.status !== 'granted') {
        setAvatarError('Photo library access was denied. Enable it in your device settings to change your avatar.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.7,
        allowsEditing: true,
        aspect: [1, 1],
      });

      if (!result.canceled) {
        const uri = result.assets?.[0]?.uri;
        if (!uri) {
          return;
        }
        setAvatarUri(uri);
        setAvatarError(null);
      }
      } catch {
        setAvatarError('Unable to open your photo library. Please try again.');
      }
  };

  const handleSave = async () => {
    try {
      await setUser({
        firstName,
        lastName,
        email,
        role,
        organization,
        avatarUri: avatarUri || undefined,
      });
      
      useFeedbackStore.getState().showToast('Profile updated successfully', 'success');
      router.back();
    } catch {
      setSaveError('Unable to save your profile changes. Please try again.');
    }
  };

  const handleConfirmSave = () => {
    setShowSaveProfileModal(true);
  };

  const canContinue = firstName.trim().length > 1 && lastName.trim().length > 1 && email.trim().length > 3;

  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" translucent backgroundColor="transparent" />

      <ScreenHeader title="Set Up Your Account" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(140, insets.bottom + 120) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Pressable style={styles.avatarWrap} onPress={pickImage}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarInitials}>{getInitials(firstName, lastName)}</Text>
            </View>
          )}
          <View style={styles.editBadge}>
            <Ionicons name="pencil" size={14} color={colors.primaryText} />
          </View>
        </Pressable>

        <ErrorBanner message={avatarError} />

        <View style={styles.field}>
          <FormField
            label="First name"
            value={firstName}
            onChangeText={setFirstName}
            style={styles.formField}
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Last name"
            value={lastName}
            onChangeText={setLastName}
            style={styles.formField}
          />
        </View>

        <View style={styles.field}>
          <Pressable onPress={() => setShowChangeEmail(true)}>
            <FormField
              label="Email"
              value={email}
              style={styles.formField}
              disabled
              rightIcon={<Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />}
              onRightIconPress={() => setShowChangeEmail(true)}
            />
          </Pressable>

          {pendingNewEmail ? (
            <View style={verifyStyles.pendingBox}>
              <Text style={verifyStyles.pendingTitle}>Verification Pending</Text>
              <Text style={verifyStyles.pendingSubtitle}>
                Link sent to {pendingNewEmail}. Current email stays active.
              </Text>
              <Pressable
                onPress={async () => {
                  const { ok } = await resendVerificationEmail(pendingNewEmail);
                  useFeedbackStore.getState().showToast(
                    ok ? 'Email resent' : 'Unable to resend right now',
                    ok ? 'successLight' : 'infoLight',
                  );
                }}
              >
                <Text style={verifyStyles.pendingResend}>Resend</Text>
              </Pressable>
            </View>
          ) : null}
        </View>

        <View style={styles.field}>
          <FormField
            label="Role"
            value={role}
            style={styles.formField}
            disabled
          />
        </View>

        <View style={styles.field}>
          <FormField
            label="Organization"
            value={organization}
            style={styles.formField}
            disabled
          />
        </View>

      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}> 
        <Pressable onPress={handleConfirmSave} disabled={!canContinue} style={[styles.primaryButton, !canContinue && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>Save</Text>
        </Pressable>
      </View>

      <ProfileSaveModal
        visible={showSaveProfileModal}
        onSave={() => {
          setShowSaveProfileModal(false);
          void handleSave();
        }}
        onCancel={() => setShowSaveProfileModal(false)}
      />

      <ChangeEmailModal
        visible={showChangeEmail}
        currentEmail={email}
        onClose={() => setShowChangeEmail(false)}
        onSent={(newEmail) => {
          setShowChangeEmail(false);
          setPendingNewEmail(newEmail);
          setShowChangeEmailSuccess(true);
        }}
      />
      <ChangeEmailSuccessModal
        visible={showChangeEmailSuccess}
        newEmail={pendingNewEmail ?? ''}
        onDone={() => setShowChangeEmailSuccess(false)}
      />

      <ErrorModal
        visible={!!saveError}
        title="Save Failed"
        message={saveError ?? ''}
        onPrimaryPress={() => setSaveError(null)}
      />
    </SafeAreaView>
  );
}

function getInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 36,
    paddingBottom: 140,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: 20,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatar: { width: 87, height: 87, borderRadius: 48 },
  avatarInitials: {
    ...getTypographyStyle('t1Title'),
    color: colors.primaryText,
  },
  editBadge: {
    position: 'absolute',
    right: -1,
    bottom: -1,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: colors.background,
    borderWidth: 2,
  },
  field: {
    marginBottom: 14,
  },
  formField: {
    marginBottom: 0,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: colors.disabledBackground,
    opacity: 1,
  },
  primaryButtonText: {
    ...getTypographyStyle('b1Button'),
    color: colors.primaryText,
  },
});

const verifyStyles = StyleSheet.create({
  pendingBox: {
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  pendingTitle: { ...getTypographyStyle('c1Caption', 'bold'), color: colors.textPrimary },
  pendingSubtitle: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary, marginTop: 2 },
  pendingResend: { ...getTypographyStyle('c1Caption', 'bold'), color: colors.primary, marginTop: 8 },
});

