import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
	const showPasswordError = wasPasswordBlurred && !isPasswordFocused && passwordValue.trim().length > 0 && !passwordStrength.isValid;

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
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color="#EAF3FF" />
					</TouchableOpacity>

					<View style={styles.heroCopy}>
						<Text allowFontScaling={false} style={styles.title}>Reset Password</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>Sign in to continue to Avera</Text>
					</View>
				</View>

				<View style={styles.content}>
					<View style={styles.inputGroup}>
						<Text allowFontScaling={false} style={styles.label}>New password</Text>
						<View style={[styles.passwordInputWrap, isPasswordFocused && styles.passwordInputWrapFocused, showPasswordError && styles.passwordInputWrapError]}>
							<Controller
								control={control}
								name="password"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.passwordInput}
										placeholder="Create a password"
										placeholderTextColor="#8FA0B7"
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										autoCorrect={false}
										textContentType="newPassword"
										autoComplete="new-password"
										value={value}
										onFocus={() => {
											setIsPasswordFocused(true);
											setWasPasswordBlurred(false);
										}}
										onBlur={() => {
											onBlur();
											setIsPasswordFocused(false);
											setWasPasswordBlurred(true);
										}}
										onChangeText={onChange}
									/>
								)}
							/>
							<TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
								<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
							</TouchableOpacity>
						</View>
						<PasswordStrengthGuide password={passwordValue} isVisible={showPasswordGuidance} showError={showPasswordError} errorMessage="Password does not meet requirements" />
					</View>

					<View style={styles.inputGroup}>
						<Text allowFontScaling={false} style={styles.label}>Confirm new password</Text>
						<View style={styles.passwordInputWrap}>
							<Controller
								control={control}
								name="confirmPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
										placeholder="Repeat password"
										placeholderTextColor="#8FA0B7"
										secureTextEntry={!showConfirmPassword}
										autoCapitalize="none"
										autoCorrect={false}
										textContentType="newPassword"
										autoComplete="password"
										value={value}
										onBlur={onBlur}
										onChangeText={onChange}
									/>
								)}
							/>
							<TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
								<Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
							</TouchableOpacity>
						</View>
						{errors.confirmPassword?.message ? <Text style={styles.errorText}>{errors.confirmPassword.message}</Text> : null}
					</View>

					<View style={styles.bottomActions}>
						<TouchableOpacity
							style={[styles.primaryButton, isSubmitting && styles.primaryButtonDisabled]}
							activeOpacity={0.9}
							disabled={isSubmitting}
							onPress={handleSubmit(handleReset)}
						>
							{isSubmitting ? (
								<ActivityIndicator color="#ffffff" size="small" />
							) : (
								<Text allowFontScaling={false} style={styles.primaryButtonText}>Reset password</Text>
							)}
						</TouchableOpacity>

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
		paddingTop: 24,
		paddingBottom: 20,
	},
	inputGroup: {
		marginBottom: 18,
	},
	label: {
		color: '#8A99AE',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0,
		marginBottom: 8,
	},
	passwordInputWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#E9EEF5',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#D0DAE8',
	},
	passwordInputWrapFocused: {
		borderColor: '#2D72D1',
		backgroundColor: '#F5F9FF',
	},
	passwordInputWrapError: {
		borderColor: '#E24B4A',
		backgroundColor: '#FFF6F6',
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#1F2B3E',
		fontSize: 14,
	},
	inputError: {
		borderColor: '#E24B4A',
	},
	eyeButton: {
		paddingHorizontal: 12,
		paddingVertical: 9,
	},
	errorText: {
		marginTop: 6,
		color: '#E24B4A',
		fontSize: 12,
		fontWeight: '600',
	},
	bottomActions: {
		marginTop: 'auto',
	},
	primaryButton: {
		backgroundColor: '#2D72D1',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
		justifyContent: 'center',
		minHeight: 48,
		marginTop: 10,
		marginBottom: 12,
	},
	primaryButtonDisabled: {
		opacity: 0.7,
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
