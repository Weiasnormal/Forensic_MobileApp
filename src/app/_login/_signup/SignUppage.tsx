import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Animated,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PasswordStrengthGuide } from '../../../_components/auth/PasswordStrengthGuide';
import { type AppRole, ROLE_LABEL, ROLE_SETTINGS } from '../../../constants/roles';
import { usePasswordStrength } from '../../../hooks/usePasswordStrength';
import { type SignUpFormValues, signUpSchema } from '../../../utils/validation';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';

export default function SignUpPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<AppRole>('analyst');
  const isOrgAdmin = activeRole === 'admin';
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);
  const [wasPasswordBlurred, setWasPasswordBlurred] = useState(false);

  const [tabsWidth, setTabsWidth] = useState(0);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = analyst, 1 = admin

  const roleConfig = ROLE_SETTINGS[activeRole].signUp;
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password') ?? '';
  const passwordStrength = usePasswordStrength(passwordValue);
  const showPasswordGuidance = isPasswordFocused;
  const showPasswordError =
    wasPasswordBlurred && !isPasswordFocused && passwordValue.trim().length > 0 && !passwordStrength.isValid;

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

  const handleContinue = (_values: SignUpFormValues) => {
    router.push({
      pathname: '/_login/_signup/User&AdminCodepage',
      params: { role: activeRole },
    });
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent backgroundColor={colors.primary} />

      
        <View style={styles.hero}>
          <TouchableOpacity
            style={styles.backButton}
            activeOpacity={0.8}
            onPress={() => router.push('/_login/GetStarted')}
          >
            <Ionicons name="chevron-back" size={22} color={colors.primaryText} />
          </TouchableOpacity>

          <Text allowFontScaling={false} style={styles.title}>Set Up Your Account</Text>
          <Text allowFontScaling={false} style={styles.subtitle}>{roleConfig.subtitle}</Text>
        </View>
	  <KeyboardAwareScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={24}
      >
        <View style={styles.formArea}>
          <View style={styles.roleTabsContainer} onLayout={handleTabsLayout}>
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
              activeOpacity={0.8}
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
              activeOpacity={0.8}
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

          <View style={styles.formBody}>
            <View style={styles.nameRow}>
              <Controller
                control={control}
                name="firstName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="First name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Your first name"
                    autoCapitalize="words"
                    textContentType="givenName"
                    autoComplete="name-given"
                    error={errors.firstName?.message}
                    style={styles.halfField}
                  />
                )}
              />

              <Controller
                control={control}
                name="lastName"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Last Name"
                    value={value}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    placeholder="Your last name"
                    autoCapitalize="words"
                    textContentType="familyName"
                    autoComplete="name-family"
                    error={errors.lastName?.message}
                    style={styles.halfField}
                  />
                )}
              />
            </View>

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Email"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder={roleConfig.emailPlaceholder}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                  error={errors.email?.message}
                />
              )}
            />

            <View style={styles.fieldGroup}>
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <FormField
                    label="Password"
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
                    rightIcon={
                      <Ionicons
                        name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                        size={20}
                        color={colors.textTertiary}
                      />
                    }
                    onRightIconPress={() => setShowPassword((prev) => !prev)}
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

            <Controller
              control={control}
              name="confirmPassword"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Confirm password"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="Repeat password"
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  autoComplete="password"
                  error={errors.confirmPassword?.message}
                  rightIcon={
                    <Ionicons
                      name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.textTertiary}
                    />
                  }
                  onRightIconPress={() => setShowConfirmPassword((prev) => !prev)}
                />
              )}
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryButton, isOrgAdmin && styles.primaryButtonDisabled]}
            activeOpacity={0.85}
            onPress={handleSubmit(handleContinue)}
            disabled={isOrgAdmin}
          >
            <Text allowFontScaling={false} style={styles.primaryButtonText}>Continue</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text allowFontScaling={false} style={styles.footerPrompt}>Already have an account? </Text>
            <TouchableOpacity activeOpacity={0.75} onPress={() => router.push('/_login/SignInPage')}>
              <Text allowFontScaling={false} style={styles.footerLink}>Sign in</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
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
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...getTypographyStyle('t1Title'),
    fontSize: 28,
    color: colors.primaryText,
    marginTop: 20,
  },
  subtitle: {
    ...getTypographyStyle('body'),
    fontSize: 14,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
  },
  formArea: {
    flex: 1,
    backgroundColor: colors.background2,
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  formBody: {
    minHeight: 360,
  },
  roleTabsContainer: {
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
  nameRow: {
    flexDirection: 'row',
    gap: 10,
  },
  halfField: {
    flex: 1,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  noMargin: {
    marginBottom: 0,
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  primaryButtonText: {
    ...getTypographyStyle('b1Button'),
    color: colors.primaryText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  footerPrompt: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
  },
  footerLink: {
    ...getTypographyStyle('c1Caption'),
    color: colors.primary,
  },
});