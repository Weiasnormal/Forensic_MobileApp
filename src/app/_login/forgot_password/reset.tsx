import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { resolveRole } from '../../../constants/roles';
import { type ResetPasswordFormValues, resetPasswordSchema } from '../../../utils/validation';

export default function ResetPasswordPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
	const passwordChecks = {
		minLength: passwordValue.trim().length >= 8,
		upper: /[A-Z]/.test(passwordValue),
		lower: /[a-z]/.test(passwordValue),
		number: /[0-9]/.test(passwordValue),
		special: /[^a-zA-Z0-9]/.test(passwordValue),
	};
	const metChecks = Object.values(passwordChecks).filter(Boolean).length;
	const strengthLabel =
		metChecks <= 1 ? 'Very weak' : metChecks === 2 ? 'Weak' : metChecks === 3 ? 'Fair' : metChecks === 4 ? 'Good' : 'Strong';
	const strengthColor =
		metChecks <= 1 ? '#F05B57' : metChecks === 2 ? '#F2903D' : metChecks === 3 ? '#F2C94C' : metChecks === 4 ? '#82C365' : '#2E9F5C';
	const missingRules = [
		!passwordChecks.minLength ? 'at least 8 characters' : null,
		!passwordChecks.upper ? 'an uppercase letter' : null,
		!passwordChecks.lower ? 'a lowercase letter' : null,
		!passwordChecks.number ? 'a number' : null,
		!passwordChecks.special ? 'a special character' : null,
	].filter(Boolean) as string[];

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
						<View style={styles.passwordInputWrap}>
							<Controller
								control={control}
								name="password"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={[styles.passwordInput, errors.password && styles.inputError]}
										placeholder="Create a password"
										placeholderTextColor="#8FA0B7"
										secureTextEntry={!showPassword}
										autoCapitalize="none"
										autoCorrect={false}
										textContentType="newPassword"
										autoComplete="new-password"
										value={value}
										onBlur={onBlur}
										onChangeText={onChange}
									/>
								)}
							/>
							<TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
								<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
							</TouchableOpacity>
						</View>
						{errors.password?.message ? <Text style={styles.errorText}>{errors.password.message}</Text> : null}

						<View style={styles.strengthRow}>
							<View style={[styles.strengthBar, metChecks >= 1 && { backgroundColor: strengthColor }]} />
							<View style={[styles.strengthBar, metChecks >= 2 && { backgroundColor: strengthColor }]} />
							<View style={[styles.strengthBar, metChecks >= 3 && { backgroundColor: strengthColor }]} />
							<View style={[styles.strengthBar, metChecks >= 4 && { backgroundColor: strengthColor }]} />
						</View>
						<Text allowFontScaling={false} style={[styles.strengthLabel, { color: strengthColor }]}>{strengthLabel}</Text>
						{missingRules.length > 0 ? (
							<Text allowFontScaling={false} style={styles.strengthHint}>
								Missing: {missingRules.join(', ')}
							</Text>
						) : (
							<Text allowFontScaling={false} style={styles.strengthHintSuccess}>
								All password requirements met.
							</Text>
						)}
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
	strengthRow: {
		flexDirection: 'row',
		gap: 8,
		marginTop: 10,
	},
	strengthBar: {
		flex: 1,
		height: 4,
		borderRadius: 999,
		backgroundColor: '#D5DCE8',
	},
	strengthLabel: {
		marginTop: 8,
		fontSize: 12,
		fontWeight: '700',
	},
	strengthHint: {
		marginTop: 6,
		color: '#8A99AE',
		fontSize: 12,
		fontWeight: '600',
	},
	strengthHintSuccess: {
		marginTop: 6,
		color: '#2E9F5C',
		fontSize: 12,
		fontWeight: '700',
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
