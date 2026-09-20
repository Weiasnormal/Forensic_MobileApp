import ErrorBanner from '@/_components/common/ErrorBanner';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAdminStore } from '@/store/adminStore';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { z } from 'zod';

const organizationSchema = z.object({
  organizationName: z.string().trim().min(1, 'Organization name is required.'),
});

export default function SignUpPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const createTenant = useAdminStore((state) => state.createTenant);
  const fetchTenantProfile = useAdminStore((state) => state.fetchTenantProfile);
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

      await fetchTenantProfile();
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
        showsVerticalScrollIndicator={false}
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
        </View>
      </KeyboardAwareScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + 12 }]}>
        <ErrorBanner message={organizationError} />
        <ErrorBanner message={createTenantError && !organizationError ? createTenantError : null} />

        <PrimaryButton
          label={isCreatingTenant ? 'Creating organization…' : 'Continue'}
          onPress={handleSubmit(handleContinue)}
          loading={isCreatingTenant}
          disabled={isCreatingTenant}
          size="large"
        />
      </View>
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
    borderColor: colors.heroIconButtonBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...getTypographyStyle('t1Title'),
    color: colors.primaryText,
    marginTop: 20,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.heroSubtitleText,
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
  footer: {
    backgroundColor: colors.background2,
    paddingHorizontal: 20,
    paddingTop: 12,
  },
});