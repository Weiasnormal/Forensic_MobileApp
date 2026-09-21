import FormField from "@/_components/common/FormField";
import PrimaryButton from "@/_components/common/PrimaryButton";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { Ionicons } from "@expo/vector-icons";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ErrorBanner from "@/_components/common/ErrorBanner";
import { resetPassword } from "@/services/authApi";
import { PasswordStrengthGuide } from "../../../_components/auth/PasswordStrengthGuide";
import { resolveRole } from "../../../constants/roles";
import { usePasswordStrength } from "../../../hooks/usePasswordStrength";
import {
  type ResetPasswordFormValues,
  resetPasswordSchema,
} from "../../../utils/validation";

export default function ResetPasswordPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{
    role?: string;
    email?: string;
    code?: string;
  }>();
  const activeRole = resolveRole(params.role);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [isConfirmPasswordFocused, setIsConfirmPasswordFocused] =
    useState(false);
  const [wasPasswordBlurred, setWasPasswordBlurred] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password") ?? "";
  const passwordStrength = usePasswordStrength(passwordValue);
  const showPasswordGuidance = isPasswordFocused;
  const showPasswordError =
    wasPasswordBlurred &&
    !isPasswordFocused &&
    passwordValue.trim().length > 0 &&
    !passwordStrength.isValid;

  const [resetError, setResetError] = useState<string | null>(null);

  const handleReset = async (values: ResetPasswordFormValues) => {
    setIsSubmitting(true);
    setResetError(null);
    try {
      await resetPassword({
        email: params.email ?? "",
        token: params.code ?? "",
        password: values.password,
      });
      router.push({
        pathname: "/_sucessPage/passwordReset",
        params: { role: activeRole },
      });
    } catch (error) {
      // TEMPORARY FIX I THINK: If the token is invalid, we should still redirect to the success page, 
      // since the password has already been reset. This is a temporary fix until we can implement a better solution.
      if (
        error instanceof Error &&
        /invalid\s+token/i.test(error.message)
      ) {
        router.push({
          pathname: "/_sucessPage/passwordReset",
          params: { role: activeRole },
        });
        return;
      }

      setResetError(
        error instanceof Error
          ? error.message
          : "Unable to reset your password. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar style="light" translucent backgroundColor={colors.primary} />

      <View style={styles.hero}>
        <TouchableOpacity
          style={styles.backButton}
          activeOpacity={0.85}
          onPress={() => router.back()}
        >
          <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.heroCopy}>
          <Text allowFontScaling={false} style={styles.title}>
            Reset Password
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Sign in to continue to Avera
          </Text>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="New password"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => {
                    setIsPasswordFocused(true);
                    setWasPasswordBlurred(false);
                  }}
                  onBlur={() => {
                    onBlur();
                    setIsPasswordFocused(false);
                    setWasPasswordBlurred(true);
                  }}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="new-password"
                  focused={isPasswordFocused}
                  error={showPasswordError ? undefined : undefined}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? "eye-off-outline" : "eye-outline"}
                      size={20}
                      color={colors.textTertiary}
                    />
                  }
                  onRightIconPress={() => setShowPassword((v) => !v)}
                  style={styles.noMargin}
                />
              )}
            />
            <PasswordStrengthGuide
              password={passwordValue}
              isVisible={showPasswordGuidance}
              showError={showPasswordError}
              errorMessage="Password does not meet requirements"
            />
          </View>

          <View style={styles.inputGroup}>
            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Confirm new password"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsConfirmPasswordFocused(true)}
                  onBlur={() => {
                    onBlur();
                    setIsConfirmPasswordFocused(false);
                  }}
                  placeholder="Repeat password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="password"
                  error={errors.confirmPassword?.message}
                  focused={isConfirmPasswordFocused}
                  rightIcon={
                    <Ionicons
                      name={
                        showConfirmPassword ? "eye-off-outline" : "eye-outline"
                      }
                      size={20}
                      color={colors.textTertiary}
                    />
                  }
                  onRightIconPress={() => setShowConfirmPassword((v) => !v)}
                />
              )}
            />
          </View>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomActions, { paddingBottom: insets.bottom + 35 }]}
      >
        {resetError ? (
          <ErrorBanner message={resetError} title="Reset failed" />
        ) : null}

        <PrimaryButton
          label="Reset password"
          onPress={handleSubmit(handleReset)}
          size="large"
          loading={isSubmitting}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  hero: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingTop: 44,
    paddingBottom: 28,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: {
    ...getTypographyStyle("t1Title"),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.heroSubtitleText,
    marginTop: 4,
  },
  heroCopy: {
    marginTop: 20,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.heroIconButtonBorder,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 18,
  },
  noMargin: {
    marginBottom: 0,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background2,
  },
});
