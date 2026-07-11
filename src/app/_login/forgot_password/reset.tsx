import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';

import { PasswordStrengthGuide } from '../../../_components/auth/PasswordStrengthGuide';
import { resolveRole } from '../../../constants/roles';
import { usePasswordStrength } from '../../../hooks/usePasswordStrength';
import { type ResetPasswordFormValues, resetPasswordSchema } from '../../../utils/validation';

export default function ResetPasswordPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isPasswordFocused, setIsPasswordFocused] = useState(false);
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
			password: '',
			confirmPassword: '',
		},
	});

	const passwordValue = watch('password') ?? '';
	const passwordStrength = usePasswordStrength(passwordValue);
	const showPasswordGuidance = isPasswordFocused;
	const showPasswordError =
		wasPasswordBlurred && !isPasswordFocused && passwordValue.trim().length > 0 && !passwordStrength.isValid;

	const handleReset = async (_values: ResetPasswordFormValues) => {
		setIsSubmitting(true);
		try {
			router.push({ pathname: '/_login/forgot_password/success', params: { role: activeRole } });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="light" translucent backgroundColor={colors.primary} />

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color={colors.primaryText} />
					</TouchableOpacity>

					<View style={styles.heroCopy}>
						<Text allowFontScaling={false} style={styles.title}>Reset Password</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>Sign in to continue to Avera</Text>
					</View>
				</View>

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
											name={showPassword ? 'eye-off-outline' : 'eye-outline'}
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
									onRightIconPress={() => setShowConfirmPassword((v) => !v)}
								/>
							)}
						/>
					</View>

					<View style={styles.bottomActions}>
						<PrimaryButton
							label="Reset password"
							onPress={handleSubmit(handleReset)}
							size="large"
							loading={isSubmitting}
							style={styles.resetButton}
						/>

						<View style={styles.footerRow}>
							<Text allowFontScaling={false} style={styles.footerPrompt}>Don&apos;t have an account? </Text>
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
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 10,
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
	heroCopy: {
		marginTop: 20,
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
	content: {
		flex: 1,
		backgroundColor: colors.background2,
		paddingHorizontal: 20,
		paddingTop: 24,
		paddingBottom: 20,
	},
	inputGroup: {
		marginBottom: 18,
	},
	noMargin: {
		marginBottom: 0,
	},
	bottomActions: {
		marginTop: 'auto',
	},
	resetButton: {
		marginTop: 10,
		marginBottom: 12,
	},
	footerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 3,
	},
	footerPrompt: {
		...getTypographyStyle('c1Caption'),
		color: colors.textSecondary,
	},
	footerAction: {
		...getTypographyStyle('c1Caption', 'bold'),
		color: colors.primary,
	},
});