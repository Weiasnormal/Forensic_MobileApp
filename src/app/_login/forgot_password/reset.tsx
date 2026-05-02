import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LoginRole = 'analyst' | 'admin';

const ROLE_CONFIG = {
	analyst: {
		emailPlaceholder: 'admin@institution.gov.ph',
	},
	admin: {
		emailPlaceholder: 'user@institution.gov.ph',
	},
} as const;

export default function ResetPasswordPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = params.role === 'admin' ? 'admin' : 'analyst';
	const roleConfig = ROLE_CONFIG[activeRole as LoginRole];
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
							<TextInput
								style={styles.passwordInput}
								placeholder="Create a password"
								placeholderTextColor="#8FA0B7"
								secureTextEntry={!showPassword}
								autoCapitalize="none"
								defaultValue=""
							/>
							<TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowPassword((v) => !v)}>
								<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
							</TouchableOpacity>
						</View>

						<View style={styles.strengthRow}>
							<View style={[styles.strengthBar, styles.strengthBarWeak]} />
							<View style={styles.strengthBar} />
							<View style={styles.strengthBar} />
							<View style={styles.strengthBar} />
						</View>
						<Text allowFontScaling={false} style={styles.strengthLabel}>Poor password</Text>
					</View>

					<View style={styles.inputGroup}>
						<Text allowFontScaling={false} style={styles.label}>Confirm new password</Text>
						<View style={styles.passwordInputWrap}>
							<TextInput
								style={styles.passwordInput}
								placeholder="Repeat password"
								placeholderTextColor="#8FA0B7"
								secureTextEntry={!showConfirmPassword}
								autoCapitalize="none"
								defaultValue=""
							/>
							<TouchableOpacity activeOpacity={0.7} style={styles.eyeButton} onPress={() => setShowConfirmPassword((v) => !v)}>
								<Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9AA6B7" />
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.bottomActions}>
						<TouchableOpacity
							style={styles.primaryButton}
							activeOpacity={0.9}
							onPress={() => router.push({ pathname: '/_login/forgot_password/success', params: { role: activeRole } })}
						>
							<Text allowFontScaling={false} style={styles.primaryButtonText}>Reset password</Text>
						</TouchableOpacity>

						<View style={styles.footerRow}>
							<Text allowFontScaling={false} style={styles.footerPrompt}>Don&apos;t have an account? </Text>
							<TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/CreateAccountpage')}>
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
	strengthBarWeak: {
		backgroundColor: '#F05B57',
	},
	strengthLabel: {
		marginTop: 8,
		color: '#F05B57',
		fontSize: 12,
		fontWeight: '700',
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
