import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

type LoginRole = 'analyst' | 'admin';

const ROLE_CONFIG = {
	analyst: {
		emailPlaceholder: 'admin@institution.gov.ph',
		verificationEmail: 'admin@institution.gov.ph',
	},
	admin: {
		emailPlaceholder: 'user@institution.gov.ph',
		verificationEmail: 'user@institution.gov.ph',
	},
} as const;

export default function EnterEmailPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = params.role === 'admin' ? 'admin' : 'analyst';
	const roleConfig = ROLE_CONFIG[activeRole as LoginRole];

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color="#EAF3FF" />
					</TouchableOpacity>

					<View style={styles.heroCopy}>
						<Text allowFontScaling={false} style={styles.title}>Forgot Password?</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>Enter your email and we&apos;ll send you a verification code</Text>
					</View>
				</View>

				<View style={styles.content}>
					<View style={styles.inputGroup}>
						<Text allowFontScaling={false} style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							placeholder={roleConfig.emailPlaceholder}
							placeholderTextColor="#8FA0B7"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							defaultValue=""
						/>
						<Text allowFontScaling={false} style={styles.helperText}>We&apos;ll send a 6-digit code to {roleConfig.verificationEmail}.</Text>
					</View>

					<View style={styles.bottomActions}>
						<TouchableOpacity
							style={styles.primaryButton}
							activeOpacity={0.9}
							onPress={() => router.push({ pathname: '/_login/forgot_password/verify', params: { role: activeRole } })}
						>
							<Text allowFontScaling={false} style={styles.primaryButtonText}>Send code</Text>
						</TouchableOpacity>

						<View style={styles.footerRow}>
							<Text allowFontScaling={false} style={styles.footerPrompt}>Remember your password? </Text>
							<TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/SignInPage')}>
								<Text allowFontScaling={false} style={styles.footerAction}>Sign in</Text>
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
	helperText: {
		marginTop: 10,
		color: '#8A99AE',
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
