import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { type AppRole, ROLE_LABEL, ROLE_SETTINGS } from '../../constants/roles';

export default function LogInPage() {
  const router = useRouter();
  const [activeRole, setActiveRole] = useState<AppRole>('analyst');
  const [showPassword, setShowPassword] = useState(false);

  const roleConfig = ROLE_SETTINGS[activeRole].signIn;

  const emailPlaceholder = roleConfig.emailPlaceholder;
  const forgotPasswordRoute = {
    pathname: '/_login/forgot_password/enterEmail' as const,
    params: { role: activeRole },
  };

  const handleSignIn = () => {
    router.push(roleConfig.redirectTo);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <StatusBar style="light" translucent backgroundColor="#2D72D1" />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={22} color="#EAF3FF" />
          </TouchableOpacity>

          <View style={styles.heroCopy}>
            <Text allowFontScaling={false} style={styles.title}>Welcome Back</Text>
            <Text allowFontScaling={false} style={styles.subtitle}>Sign in to continue to Avera</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.roleTabs}>
            <TouchableOpacity
              style={[styles.roleTab, activeRole === 'analyst' && styles.roleTabActive]}
              activeOpacity={0.85}
              onPress={() => setActiveRole('analyst')}
            >
              <Text allowFontScaling={false} style={[styles.roleTabText, activeRole === 'analyst' && styles.roleTabTextActive]}>{ROLE_LABEL.analyst}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.roleTab, activeRole === 'admin' && styles.roleTabActive]}
              activeOpacity={0.85}
              onPress={() => setActiveRole('admin')}
            >
              <Text allowFontScaling={false} style={[styles.roleTabText, activeRole === 'admin' && styles.roleTabTextActive]}>{ROLE_LABEL.admin}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formFields}>
            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder={emailPlaceholder}
                placeholderTextColor="#8FA0B7"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                defaultValue=""
              />
            </View>

            <View style={styles.inputGroup}>
              <Text allowFontScaling={false} style={styles.label}>Password</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Create a password"
                  placeholderTextColor="#8FA0B7"
                  secureTextEntry={!showPassword}
                  defaultValue=""
                />
                <TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.forgotPasswordWrap}
                activeOpacity={0.7}
                onPress={() => router.push(forgotPasswordRoute)}
              >
                <Text allowFontScaling={false} style={styles.forgotPasswordText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity
              style={styles.primaryButton}
              activeOpacity={0.9}
              onPress={handleSignIn}
            >
              <Text allowFontScaling={false} style={styles.primaryButtonText}>Sign In</Text>
            </TouchableOpacity>

            <View style={styles.footerRow}>
              <Text allowFontScaling={false} style={styles.footerPrompt}>Don't have an account?</Text>
              <TouchableOpacity activeOpacity={0.7}>
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
    backgroundColor: '#ffffff',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: '#ffffff',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  hero: {
    backgroundColor: '#2D72D1',
    paddingHorizontal: 16,
    paddingTop: 38,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  title: {
    color: '#ffffff',
    fontSize: 33,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: -0.6,
  },
  subtitle: {
    color: 'rgba(233, 241, 255, 0.9)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontWeight: '500',
  },
  heroCopy: {
    marginTop: 18,
    marginBottom: 2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(233, 243, 255, 0.9)',
    backgroundColor: 'rgba(47, 112, 200, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: '#E8EDF5',
    borderRadius: 18,
    padding: 4,
    marginBottom: 22,
  },
  roleTab: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 9,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: '#2D72D1',
  },
  roleTabText: {
    color: '#3F3F3F',
    fontSize: 13,
    fontWeight: '700',
  },
  roleTabTextActive: {
    color: '#F7FBFF',
  },
  inputGroup: {
    marginBottom: 14,
  },
  label: {
    color: '#8A99AE',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#E9EEF5',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1F2B3E',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#D0DAE8',
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E9EEF5',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D0DAE8',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: '#1F2B3E',
    fontSize: 14,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotPasswordText: {
    color: '#1E63CA',
    fontSize: 12,
    fontWeight: '700',
  },
  formFields: {
    marginBottom: 12,
  },
  bottomActions: {
    marginTop: 'auto',
  },
  primaryButton: {
    backgroundColor: '#2D72D1',
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '800',
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 3,
  },
  footerPrompt: {
    color: '#8A99AE',
    fontSize: 13,
    fontWeight: '600',
  },
  footerAction: {
    color: '#1E63CA',
    fontSize: 13,
    fontWeight: '800',
  },
});
