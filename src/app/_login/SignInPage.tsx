import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  KeyboardAvoidingView,
  LayoutChangeEvent,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { type AppRole, ROLE_LABEL, ROLE_SETTINGS } from '../../constants/roles';
import { type SignInFormValues, signInSchema } from '../../utils/validation';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';

export default function LogInPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<AppRole>('analyst');
  const [showPassword, setShowPassword] = useState(false);

  const [tabsWidth, setTabsWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = analyst, 1 = admin

  const roleConfig = ROLE_SETTINGS[activeRole].signIn;
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInFormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailPlaceholder = roleConfig.emailPlaceholder;
  const forgotPasswordRoute = {
    pathname: '/_login/forgot_password/enterEmail' as const,
    params: { role: activeRole },
  };

  const handleTabsLayout = (e: LayoutChangeEvent) => {
    setTabsWidth(e.nativeEvent.layout.width);
  };

  const selectRole = (role: AppRole) => {
    setActiveRole(role);
    Animated.timing(slideAnim, {
      toValue: role === 'analyst' ? 0 : 1,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const pillWidth = tabsWidth > 0 ? (tabsWidth - 8) / 2 : 0;
  const pillTranslateX = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, pillWidth],
  });

  const handleSignIn = (_values: SignInFormValues) => {
    router.push(roleConfig.redirectTo);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
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
          <View style={styles.roleTabs} onLayout={handleTabsLayout}>
            {tabsWidth > 0 && (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.rolePill,
                  {
                    width: pillWidth,
                    transform: [{ translateX: pillTranslateX }],
                  },
                ]}
              />
            )}
            <TouchableOpacity
              style={styles.roleTab}
              activeOpacity={0.85}
              onPress={() => selectRole('analyst')}
            >
              <Text
                allowFontScaling={false}
                style={[styles.roleTabText, activeRole === 'analyst' && styles.roleTabTextActive]}
              >
                {ROLE_LABEL.analyst}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.roleTab}
              activeOpacity={0.85}
              onPress={() => selectRole('admin')}
            >
              <Text
                allowFontScaling={false}
                style={[styles.roleTabText, activeRole === 'admin' && styles.roleTabTextActive]}
              >
                {ROLE_LABEL.admin}
              </Text>
            </TouchableOpacity>
          </View>

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
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={handleSubmit(handleSignIn)}
            >
              <Text allowFontScaling={false} style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text allowFontScaling={false} style={styles.footerPrompt}>Don&apos;t have an account?</Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/_signup/SignUppage')}>
                <Text allowFontScaling={false} style={styles.footerAction}>Create account</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
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
  primaryButtonText: {
    ...getTypographyStyle('b1Button'),
    color: colors.primaryText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
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