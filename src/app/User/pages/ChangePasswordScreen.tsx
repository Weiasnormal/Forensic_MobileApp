import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import ScreenHeader from '@/_components/common/ScreenHeader';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ErrorBanner from '@/_components/common/ErrorBanner';
import SuccessModal from '@/_components/modals/success_modal';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changePassword = useAuthStore((state) => state.changePassword);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const canSubmit =
    currentPassword.length > 0 && newPassword.length >= 8 && newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      setShowSuccess(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to change password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Change Password" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <FormField
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry
          placeholder="Enter current password"
        />
        <FormField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          secureTextEntry
          placeholder="Enter new password"
        />
        <FormField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
          placeholder="Repeat new password"
        />

        <ErrorBanner message={error} />

        <PrimaryButton
          label="Update Password"
          onPress={handleSubmit}
          disabled={!canSubmit}
          loading={isSubmitting}
          size="large"
          style={styles.button}
        />
      </ScrollView>

      <SuccessModal
        visible={showSuccess}
        title="Password Changed"
        message="Your password has been updated successfully."
        primaryLabel="Done"
        onPrimaryPress={() => {
          setShowSuccess(false);
          router.back();
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  errorText: {
    ...getTypographyStyle('c1Caption'),
    color: colors.danger,
    marginBottom: 12,
  },
  button: { marginTop: 8 },
});