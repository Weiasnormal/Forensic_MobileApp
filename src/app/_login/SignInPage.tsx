import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, TouchableOpacity, View, } from 'react-native';
import { type AppRole, ROLE_SETTINGS } from '../../constants/roles';
import { type SignInFormValues, signInSchema } from '../../utils/validation';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { useAuthStore } from '@/store/authStore';
import ErrorBanner from '@/_components/common/ErrorBanner';
import SuccessModal from '@/_components/modals/success_modal';
import { isFirstLoginForUser, markUserAsSeen } from '@/utils/firstLoginTracker';
import { useFeedbackStore } from '@/store/feedbackStore';
import { useAdminStore } from '@/store/adminStore';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';

export default function LogInPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ verifiedEmail?: string }>();
  const [showPassword, setShowPassword] = useState(false);
  const login = useAuthStore((state) => state.login);
  const isAuthenticating = useAuthStore((state) => state.isAuthenticating);
  const [signInError, setSignInError] = useState<string | null>(null);
  const [welcomeInfo, setWelcomeInfo] = useState<{ isFirstTime: boolean } | null>(null);
  const [resolvedRole, setResolvedRole] = useState<AppRole>('user');

  function resolveRoleFromClaims(roles: string[] | undefined): AppRole {
    return (roles ?? []).some((r) => r.toLowerCase().includes('admin')) ? 'admin' : 'user';
  }

  
  const {
    control,
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
  try {
    await login(values.email, values.password);

    const authUser = useAuthStore.getState().user;
    const role = resolveRoleFromClaims(authUser?.roles);
    setResolvedRole(role);

    const pendingOrgName = useEmailVerificationStore.getState().pendingOrganizationName;
    if (role === 'admin' && pendingOrgName && !authUser?.tenantId) {
      const tenantId = await useAdminStore.getState().createTenant(pendingOrgName);
      if (tenantId) {
        useEmailVerificationStore.getState().reset();
      } else {
        useFeedbackStore.getState().showToast('Signed in — organization setup failed, retry in Profile', 'infoLight');
      }
    }

    const isFirstTime = authUser ? await isFirstLoginForUser(authUser.userId) : false;
    setWelcomeInfo({ isFirstTime });
  } catch (error) {
    setSignInError(
      error instanceof Error ? error.message : 'Unable to sign in. Check your email and password.',
    );
  }
};

  const handleDismissWelcome = async () => {
  const user = useAuthStore.getState().user;
  if (user) {
    await markUserAsSeen(user.userId);
  }
  setWelcomeInfo(null);
  router.replace(ROLE_SETTINGS[resolvedRole].signIn.redirectTo);
};

  return (
    <KeyboardAvoidingView
      style={styles.container}
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
                  onBlur={onBlur}
                  placeholder={emailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={errors.email?.message}
                />
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
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

          <View style={styles.bottomActions}>
            
            <ErrorBanner message={signInError} />

            <PrimaryButton
              label="Sign In"
              onPress={handleSubmit(handleSignIn)}
              loading={isAuthenticating}
              style={styles.primaryButton}
            />

            <View style={styles.footerRow}>
              <Text allowFontScaling={false} style={styles.footerPrompt}>Don&apos;t have an account?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/_signup/SignUppage')}>
                <Text allowFontScaling={false} style={styles.footerAction}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

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
    paddingBottom: 10,
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
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCopy: {
    marginTop: 20,
  },
  title: {
    ...getTypographyStyle('t1Title'),
    fontSize: 28,
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle('body'),
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background2,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderRadius: 18,
    padding: 4,
    marginBottom: 24,
    position: 'relative',
  },
  rolePill: {
    position: 'absolute',
    top: 4,
    left: 4,
    bottom: 4,
    backgroundColor: colors.primary,
    borderRadius: 14,
  },
  roleTab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 1,
  },
  roleTabText: {
    ...getTypographyStyle('b3Button'),
    color: colors.textSecondary,
  },
  roleTabTextActive: {
    color: colors.primaryText,
  },
  formFields: {
    marginBottom: 12,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: -6,
  },
  forgotPasswordText: {
    ...getTypographyStyle('c1Caption'),
    color: colors.primary,
  },
  bottomActions: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 20,
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