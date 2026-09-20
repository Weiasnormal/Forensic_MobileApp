import ErrorBanner from '@/_components/common/ErrorBanner';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SuccessModal from '@/_components/modals/success_modal';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { isEmailVerificationRequired } from '@/services/authApi';
import { resendVerificationEmail } from '@/services/emailVerificationApi';
import { useAuthStore } from '@/store/authStore';
import { clearPendingSignupCredentials, useEmailVerificationStore } from '@/store/emailVerificationStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import { isFirstLoginForUser, markUserAsSeen } from '@/utils/firstLoginTracker';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { type AppRole, ROLE_SETTINGS } from '../../constants/roles';
import { type SignInFormValues, signInSchema } from '../../utils/validation';

export default function LogInPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ verifiedEmail?: string; role?: string; next?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const [isEmailFocused, setIsEmailFocused] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [showVerifyEmail, setShowVerifyEmail] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [welcomeInfo, setWelcomeInfo] = useState<{ isFirstTime: boolean } | null>(null);
  const [resolvedRole, setResolvedRole] = useState<AppRole>('user');

  function resolveRoleFromClaims(roles: string[] | undefined): AppRole {
    return (roles ?? []).some((r) => r.toLowerCase().includes('admin')) ? 'admin' : 'user';
  }

  function hasSupportedRole(roles: string[] | undefined): boolean {
    return (roles ?? []).some((role) => {
      const normalizedRole = role.toLowerCase();
      return normalizedRole.includes('admin') || normalizedRole.includes('user') || normalizedRole.includes('analyst');
    });
  }

  const {
    control,
    getValues,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: params.verifiedEmail ?? '',
      password: '',
    },
  });

  const emailPlaceholder = 'avera@institution.gov.ph';
  const forgotPasswordRoute = {
    pathname: '/_login/forgot_password/enterEmail' as const,
    params: {},
  };

  const handleSignIn = async (values: SignInFormValues) => {
    setSignInError(null);
    setShowVerifyEmail(false);
    try {
      await login(values.email, values.password);

      const authUser = useAuthStore.getState().user;
      const role = resolveRoleFromClaims(authUser?.roles);
      setResolvedRole(role);

      const authState = useAuthStore.getState();
      const hasValidSession = Boolean(authState.accessToken) && !authState.isTokenExpired();
      const hasTenantMembership = Boolean(authUser?.tenantId?.trim());
      const shouldEnterOrganizationCode = params.next === 'organizationCode' && role === 'user';

      if (!authUser?.userId || !hasSupportedRole(authUser.roles) || !hasValidSession) {
        await logout();
        router.replace('/_login/GetStarted');
        return;
      }

      if (!hasTenantMembership || shouldEnterOrganizationCode) {
        router.replace(
          role === 'admin'
            ? '/_login/_signup/OrganizationCreate'
            : '/_login/_signup/User&AdminCodepage?role=user',
        );
        return;
      }

      const isFirstTime = await isFirstLoginForUser(authUser.userId);
      setWelcomeInfo({ isFirstTime });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      setShowVerifyEmail(isEmailVerificationRequired(error));
      setSignInError(
        message || 'Unable to sign in. Check your email and password.',
      );
    }
  };

  const handleVerifyEmail = async () => {
    if (isSendingVerification) return;

    const email = getValues('email')?.trim();
    if (!email) return;

    setIsSendingVerification(true);
    const role = params.role === 'admin' ? 'admin' : 'user';
    clearPendingSignupCredentials();
    try {
      useEmailVerificationStore.getState().setPendingVerification(email, role);
      const { ok } = await resendVerificationEmail(email);
      useFeedbackStore.getState().showToast(
        ok ? 'Verification email sent' : 'Unable to send verification email',
        ok ? 'success' : 'infoLight',
      );
      router.push({
        pathname: '/_login/_signup/VerifyEmailInstruction',
        params: { role, email },
      });
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleDismissWelcome = async () => {
    const authState = useAuthStore.getState();
    const user = authState.user;
    const hasValidSession = Boolean(authState.accessToken) && !authState.isTokenExpired();
    const hasTenantMembership = Boolean(user?.tenantId?.trim());

    if (!user?.userId || !hasSupportedRole(user.roles) || !hasValidSession) {
      setWelcomeInfo(null);
      await logout();
      router.replace('/_login/GetStarted');
      return;
    }

    if (!hasTenantMembership) {
      setWelcomeInfo(null);
      router.replace(
        resolvedRole === 'admin'
          ? '/_login/_signup/OrganizationCreate'
          : '/_login/_signup/User&AdminCodepage?role=user',
      );
      return;
    }

    if (user) {
      await markUserAsSeen(user.userId);
    }
    setWelcomeInfo(null);
    router.replace(ROLE_SETTINGS[resolvedRole].signIn.redirectTo);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" translucent backgroundColor={colors.primary} />

      <View style={styles.hero}>
        <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
        </TouchableOpacity>

        <View style={styles.heroCopy}>
          <Text allowFontScaling={false} style={styles.title}>Welcome Back</Text>
          <Text allowFontScaling={false} style={styles.subtitle}>Sign in to continue to Avera</Text>
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
          <View style={styles.formFields}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsEmailFocused(true)}
                  onBlur={() => {
                    onBlur();
                    setIsEmailFocused(false);
                  }}
                  focused={isEmailFocused}
                  placeholder={emailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={errors.email?.message}
                />
              )}
            />

            {showVerifyEmail && (
              <TouchableOpacity
                style={styles.verifyEmailWrap}
                activeOpacity={0.7}
                onPress={handleVerifyEmail}
                disabled={isSendingVerification}
              >
                {isSendingVerification ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                <Text allowFontScaling={false} style={styles.verifyEmailText}>
                  {isSendingVerification ? 'Sending verification email...' : 'Verify your email'}
                </Text>
              </TouchableOpacity>
            )}
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => {
                    onBlur();
                    setIsPasswordFocused(false);
                  }}
                  focused={isPasswordFocused}
                  placeholder="Create a password"
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  error={errors.password?.message}
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  }
                  onRightIconPress={() => setShowPassword((v) => !v)}
                />
              )}
            />

            <TouchableOpacity
              style={styles.forgotPasswordWrap}
              activeOpacity={0.7}
              onPress={() => router.push(forgotPasswordRoute)}
            >
              <Text allowFontScaling={false} style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
        <ErrorBanner message={signInError} />

        <PrimaryButton
          label="Sign In"
          onPress={handleSubmit(handleSignIn)}
          loading={isAuthenticating}
          size="large"
        />

        <View style={styles.footerRow}>
          <Text allowFontScaling={false} style={styles.footerPrompt}>Don&apos;t have an account?</Text>
          <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/_signup/SignUppage')}>
            <Text allowFontScaling={false} style={styles.footerAction}>Create account</Text>
          </TouchableOpacity>
        </View>
      </View>

      <SuccessModal
        visible={!!welcomeInfo}
        title={welcomeInfo?.isFirstTime ? 'Welcome aboard!' : 'Welcome back!'}
        message={
          welcomeInfo?.isFirstTime
            ? "Your analyst account is ready. Let's set up your first case."
            : 'Signed in successfully. Your dashboard and case queue are ready.'
        }
        primaryLabel="Continue"
        onPrimaryPress={handleDismissWelcome}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
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
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.heroIconButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    marginTop: 20,
  },
  title: {
    ...getTypographyStyle('t1Title'),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.heroSubtitleText, // NEW TOKEN — pending your confirm
    marginTop: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formFields: {
    marginBottom: 12,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  verifyEmailWrap: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  verifyEmailText: {
    ...getTypographyStyle('c3Caption'),
    color: colors.primary,
  },
  forgotPasswordText: {
    ...getTypographyStyle('c1Caption'),
    color: colors.primary,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background2,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    marginTop: 14,
  },
  footerPrompt: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
  },
  footerAction: {
    ...getTypographyStyle('c1Caption'),
    color: colors.primary,
  },
});