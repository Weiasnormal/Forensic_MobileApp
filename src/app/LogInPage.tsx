import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function LogInPage() {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar style="light" />
      <ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
        <View style={styles.hero}>
          <TouchableOpacity style={styles.backButton} activeOpacity={0.8}>
            <Ionicons name="chevron-back" size={22} color="#e7f0ff" />
          </TouchableOpacity>

          <View style={styles.heroCopy}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue to Avera</Text>
          </View>

          <View style={styles.roleTabs}>
            <TouchableOpacity style={[styles.roleTab, styles.roleTabActive]} activeOpacity={0.85}>
              <Text style={[styles.roleTabText, styles.roleTabTextActive]}>Forensic Analyst</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.roleTab} activeOpacity={0.85}>
              <Text style={styles.roleTabText}>Org Admin</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.formCard}>
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
            <Image
              source={require('../../assets/googleIcon.webp')}
              style={styles.googleIcon}
              contentFit="contain"
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="analyst.cruz@pnp.gov.ph"
              placeholderTextColor="#9caabf"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              defaultValue=""
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordInputWrap}>
              <TextInput
                style={styles.passwordInput}
                placeholder="••••••••"
                placeholderTextColor="#9caabf"
                secureTextEntry
                defaultValue=""
              />
              <TouchableOpacity activeOpacity={0.7} style={styles.eyeButton}>
                <Ionicons name="eye-outline" size={20} color="#8a99af" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.forgotPasswordWrap} activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Don't have an account?</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.footerAction}>Create account</Text>
            </TouchableOpacity>
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
    backgroundColor: '#ffffff',
  },
  hero: {
    backgroundColor: '#0f4c8a',
    paddingHorizontal: 20,
    paddingTop: 38,
    paddingBottom: 22,
  },
  title: {
    color: '#ffffff',
    fontSize: 36,
    lineHeight: 48,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(237, 245, 255, 0.74)',
    fontSize: 19,
    lineHeight: 28,
    marginTop: 3,
    fontWeight: '400',
  },
  heroCopy: {
    marginTop: 18,
    marginBottom: 18,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roleTabs: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 63, 113, 0.92)',
    borderRadius: 10,
    padding: 4,
  },
  roleTab: {
    flex: 1,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  roleTabActive: {
    backgroundColor: 'rgba(148, 187, 232, 0.35)',
  },
  roleTabText: {
    color: 'rgba(210, 224, 242, 0.86)',
    fontSize: 16,
    fontWeight: '600',
  },
  roleTabTextActive: {
    color: '#f4f9ff',
  },
  formCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    color: '#62748f',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#eceef2',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#1c2738',
    fontSize: 20,
    borderWidth: 1,
    borderColor: '#cfd7e2',
  },
  passwordInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#eceef2',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#cfd7e2',
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: '#1c2738',
    fontSize: 20,
  },
  eyeButton: {
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  forgotPasswordWrap: {
    alignSelf: 'flex-end',
    marginTop: 8,
  },
  forgotPasswordText: {
    color: '#1c62c9',
    fontSize: 13,
    fontWeight: '700',
  },
  primaryButton: {
    backgroundColor: '#1761ab',
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
    shadowColor: '#0a4382',
    shadowOpacity: 0.26,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 16,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#c7d0dd',
  },
  separatorText: {
    color: '#8796a9',
    fontSize: 13,
    fontWeight: '600',
    paddingHorizontal: 12,
  },
  googleButton: {
    backgroundColor: '#f2f4f8',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#cad3e0',
  },
  googleIcon: {
    width: 26,
    height: 26,
    marginRight: 12,
  },
  googleButtonText: {
    color: '#2f3d52',
    fontSize: 15,
    fontWeight: '700',
  },
  footerRow: {
    marginTop: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerPrompt: {
    color: '#7a8797',
    fontSize: 13,
    fontWeight: '500',
  },
  footerAction: {
    color: '#1761ab',
    fontSize: 13,
    fontWeight: '800',
  },
});
