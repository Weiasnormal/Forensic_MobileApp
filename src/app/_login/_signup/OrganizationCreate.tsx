import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';
import ErrorBanner from '@/_components/common/ErrorBanner';
import { useAdminStore } from '@/store/adminStore';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';

const organizationSchema = z.object({
  organizationName: z.string().trim().min(1, 'Organization name is required.'),
});

export default function SignUpPage() {
  const router = useRouter();
  const createTenant = useAdminStore((state) => state.createTenant);
  const isCreatingTenant = useAdminStore((state) => state.isCreatingTenant);
  const createTenantError = useAdminStore((state) => state.createTenantError);
  const [organizationError, setOrganizationError] = useState<string | null>(null);
  const {
    control,
    handleSubmit,
  } = useForm<{ organizationName: string }>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      organizationName: '',
    },
  });
  


const handleContinue = async (values: { organizationName: string }) => {
  const organizationName = values.organizationName?.trim() ?? '';
  if (!organizationName) {
    setOrganizationError('Organization name is required.');
    return;
  }

  setOrganizationError(null);
  try {
    const tenantId = await createTenant(organizationName);
    if (!tenantId) {
      setOrganizationError(createTenantError ?? 'Unable to create organization.');
      return;
    }

    useEmailVerificationStore.getState().reset();
    router.replace('/Admin/admin_dashboard');
  } catch (error) {
    setOrganizationError(error instanceof Error ? error.message : 'Unable to create organization.');
  }
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
          <Text allowFontScaling={false} style={styles.subtitle}>Set up your organization to continue</Text>
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
          <View style={styles.formBody}>
            <Controller
              control={control}
              name="organizationName"
              render={({ field: { onChange, onBlur, value } }) => (
                <FormField
                  label="Organization Name"
                  value={value ?? ''}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  placeholder="e.g. PNP Crime Laboratory"
                  autoCapitalize="words"
                />
              )}
            />
          </View>
          <TouchableOpacity
            style={styles.primaryButton}
            activeOpacity={0.85}
            onPress={handleSubmit(handleContinue)}
            disabled={isCreatingTenant}
          >
            <Text allowFontScaling={false} style={styles.primaryButtonText}>
              {isCreatingTenant ? 'Creating organization…' : 'Continue'}
            </Text>
          </TouchableOpacity>
            <ErrorBanner message={organizationError} />
            <ErrorBanner message={createTenantError && !organizationError ? createTenantError : null} />
        
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
  primaryButtonText: {
    ...getTypographyStyle('b1Button'),
    color: colors.primaryText,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
    paddingBottom: 20,
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