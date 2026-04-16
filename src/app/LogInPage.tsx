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
          <Text style={styles.time}>9:41</Text>
          <View style={styles.heroCopy}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in to continue</Text>
          </View>
        </View>

        <View style={styles.formCard}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="analyst.cruz@pnp.gov.ph"
              placeholderTextColor="#a9b5c8"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              defaultValue=""
            />
          </View>

          <View style={styles.passwordRow}>
            <Text style={styles.label}>Password</Text>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder="••••••••"
            placeholderTextColor="#a9b5c8"
            secureTextEntry
            defaultValue=""
          />

          <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85}>
            <Text style={styles.primaryButtonText}>Sign in</Text>
          </TouchableOpacity>

          <View style={styles.separatorRow}>
            <View style={styles.separatorLine} />
            <Text style={styles.separatorText}>or</Text>
            <View style={styles.separatorLine} />
          </View>

          <TouchableOpacity style={styles.secondaryButton} activeOpacity={0.85}>
            <Text style={styles.secondaryButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.footerRow}>
            <Text style={styles.footerPrompt}>Dont have an account?</Text>
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
    backgroundColor: '#0d4a86',
    paddingHorizontal: 28,
    paddingTop: 16,
    paddingBottom: 40,
    minHeight: 200,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
  },
  time: {
    color: '#f8fbff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  title: {
    color: '#ffffff',
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.72)',
    fontSize: 16,
    lineHeight: 22,
    marginTop: 4,
    fontWeight: '400',
  },
  heroCopy: {
    marginTop: 34,
  },
  formCard: {
    paddingHorizontal: 28,
    paddingTop: 18,
    paddingBottom: 28,
  },
  inputGroup: {
    marginBottom: 10,
  },
  label: {
    color: '#9aa7b7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fbfcfe',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#1c2738',
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#dce4ef',
    shadowColor: '#d8e0eb',
    shadowOpacity: 0.22,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  passwordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 8,
  },
  forgotPasswordText: {
    color: '#1c62c9',
    fontSize: 12,
    fontWeight: '500',
  },
  primaryButton: {
    backgroundColor: '#1761ab',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 16,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '700',
  },
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#dbe5f0',
  },
  separatorText: {
    color: '#a2adba',
    fontSize: 13,
    paddingHorizontal: 12,
  },
  secondaryButton: {
    backgroundColor: '#f7f9fc',
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dce4ef',
  },
  secondaryButtonText: {
    color: '#19253a',
    fontSize: 15,
    fontWeight: '500',
  },
  footerRow: {
    marginTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  footerPrompt: {
    color: '#7a8797',
    fontSize: 13,
  },
  footerAction: {
    color: '#1761ab',
    fontSize: 13,
    fontWeight: '700',
  },
});
