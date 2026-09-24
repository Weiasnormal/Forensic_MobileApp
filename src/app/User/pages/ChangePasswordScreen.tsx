import { PasswordStrengthGuide } from "@/_components/auth/PasswordStrengthGuide";
import ErrorBanner from "@/_components/common/ErrorBanner";
import FormField from "@/_components/common/FormField";
import PrimaryButton from "@/_components/common/PrimaryButton";
import ScreenHeader from "@/_components/common/ScreenHeader";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { usePasswordStrength } from "@/hooks/usePasswordStrength";
import { useAuthStore } from "@/store/authStore";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ChangePasswordScreen() {
  const router = useRouter();
  const changePassword = useAuthStore((state) => state.changePassword);
  const logout = useAuthStore((state) => state.logout);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [wasPasswordBlurred, setWasPasswordBlurred] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const passwordStrength = usePasswordStrength(newPassword);
  const showPasswordError =
    wasPasswordBlurred &&
    !isPasswordFocused &&
    newPassword.trim().length > 0 &&
    !passwordStrength.isValid;

  const canSubmit =
    currentPassword.length > 0 &&
    passwordStrength.isValid &&
    confirmPassword.length > 0 &&
    newPassword === confirmPassword;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setError(null);
    setIsSubmitting(true);
    try {
      await changePassword(currentPassword, newPassword);
      await logout();
      router.replace("/_login/SignInPage");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to change password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Change Password" onBackPress={() => router.back()} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <FormField
          label="Current password"
          value={currentPassword}
          onChangeText={setCurrentPassword}
          secureTextEntry={!showCurrentPassword}
          placeholder="Enter current password"
          rightIcon={
            <Ionicons
              name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textTertiary}
            />
          }
          onRightIconPress={() => setShowCurrentPassword((visible) => !visible)}
        />
        <FormField
          label="New password"
          value={newPassword}
          onChangeText={setNewPassword}
          onFocus={() => {
            setIsPasswordFocused(true);
            setWasPasswordBlurred(false);
          }}
          onBlur={() => {
            setIsPasswordFocused(false);
            setWasPasswordBlurred(true);
          }}
          secureTextEntry={!showNewPassword}
          placeholder="Enter new password"
          rightIcon={
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textTertiary}
            />
          }
          onRightIconPress={() => setShowNewPassword((visible) => !visible)}
          style={styles.noMargin}
        />
        <PasswordStrengthGuide
          password={newPassword}
          isVisible={isPasswordFocused}
          showError={showPasswordError}
          errorMessage="Password does not meet requirements"
        />
        <FormField
          label="Confirm new password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry={!showConfirmPassword}
          placeholder="Repeat new password"
          rightIcon={
            <Ionicons
              name={showConfirmPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textTertiary}
            />
          }
          onRightIconPress={() => setShowConfirmPassword((visible) => !visible)}
          error={
            confirmPassword.length > 0 && newPassword !== confirmPassword
              ? "Passwords do not match"
              : undefined
          }
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16 },
  errorText: {
    ...getTypographyStyle("c1Caption"),
    color: colors.danger,
    marginBottom: 12,
  },
  button: { marginTop: 8 },
  noMargin: { marginBottom: 0 },
});
