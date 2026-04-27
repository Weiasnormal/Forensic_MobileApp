import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export default function CreateAccountPage() {
	const router = useRouter();
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<StatusBar style="light" />

			<ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={20} color="#ffffff" />
					</TouchableOpacity>

					<Text style={styles.title}>Create account</Text>
					<Text style={styles.subtitle}>Join as a forensic analyst</Text>
				</View>

				<View style={styles.formArea}>
					<TouchableOpacity style={styles.googleButton} activeOpacity={0.85}>
						<Image
							source={require('../../../assets/googleIcon.webp')}
							style={styles.googleIcon}
							contentFit="contain"
						/>
						<Text style={styles.googleButtonText}>Sign up with Google</Text>
					</TouchableOpacity>

					<View style={styles.dividerRow}>
						<View style={styles.dividerLine} />
						<Text style={styles.dividerText}>or</Text>
						<View style={styles.dividerLine} />
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Full name</Text>
						<TextInput
							style={styles.input}
							placeholder="Your full name"
							placeholderTextColor="#94a3b8"
							autoCapitalize="words"
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							placeholder="you@institution.gov.ph"
							placeholderTextColor="#94a3b8"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
						/>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Password</Text>
						<View style={styles.passwordWrap}>
							<TextInput
								style={styles.passwordInput}
								placeholder="Create a password"
								placeholderTextColor="#94a3b8"
								secureTextEntry={!showPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								style={styles.eyeButton}
								activeOpacity={0.75}
								onPress={() => setShowPassword((prev) => !prev)}
							>
								<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a99af" />
							</TouchableOpacity>
						</View>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Confirm password</Text>
						<View style={styles.passwordWrap}>
							<TextInput
								style={styles.passwordInput}
								placeholder="Repeat password"
								placeholderTextColor="#94a3b8"
								secureTextEntry={!showConfirmPassword}
								autoCapitalize="none"
							/>
							<TouchableOpacity
								style={styles.eyeButton}
								activeOpacity={0.75}
								onPress={() => setShowConfirmPassword((prev) => !prev)}
							>
								<Ionicons
									name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
									size={20}
									color="#8a99af"
								/>
							</TouchableOpacity>
						</View>
					</View>

					<TouchableOpacity
						style={styles.primaryButton}
						activeOpacity={0.85}
						onPress={() => router.push('/User/user_dashboard')}
					>
						<Text style={styles.primaryButtonText}>Create account</Text>
					</TouchableOpacity>

					<TouchableOpacity
						style={styles.adminButton}
						activeOpacity={0.85}
						onPress={() => router.push('/Admin/admin_dashboard')}
					>
						<Ionicons name="lock-closed-outline" size={16} color="#1e3a5f" />
						<Text style={styles.adminButtonText}>Sign up as Admin</Text>
					</TouchableOpacity>

					<View style={styles.footerRow}>
						<Text style={styles.footerPrompt}>Already have an account? </Text>
						<TouchableOpacity activeOpacity={0.75} onPress={() => router.push('/_login/LogInPage')}>
							<Text style={styles.footerLink}>Sign in</Text>
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
		backgroundColor: '#f8fafc',
	},
	scrollContent: {
		flexGrow: 1,
		backgroundColor: '#f8fafc',
	},
	hero: {
		backgroundColor: '#0f4c8a',
		paddingHorizontal: 24,
		paddingTop: 42,
		paddingBottom: 26,
	},
	backButton: {
		width: 34,
		height: 34,
		borderRadius: 10,
		backgroundColor: 'rgba(255,255,255,0.12)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 18,
	},
	title: {
		color: '#ffffff',
		fontSize: 33,
		lineHeight: 40,
		fontWeight: '800',
		letterSpacing: -0.6,
	},
	subtitle: {
		color: 'rgba(255,255,255,0.65)',
		fontSize: 14,
		marginTop: 4,
		fontWeight: '500',
	},
	formArea: {
		flex: 1,
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: 30,
	},
	googleButton: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
		backgroundColor: '#ffffff',
		borderWidth: 1,
		borderColor: '#d8e1ee',
		borderRadius: 14,
		paddingVertical: 14,
	},
	googleIcon: {
		width: 18,
		height: 18,
	},
	googleButtonText: {
		color: '#334155',
		fontSize: 14,
		fontWeight: '700',
	},
	dividerRow: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 18,
	},
	dividerLine: {
		flex: 1,
		height: 1,
		backgroundColor: '#e2e8f0',
	},
	dividerText: {
		color: '#94a3b8',
		fontSize: 12,
		marginHorizontal: 12,
		fontWeight: '600',
	},
	fieldGroup: {
		marginBottom: 14,
	},
	label: {
		color: '#64748b',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0.4,
		textTransform: 'uppercase',
		marginBottom: 7,
	},
	input: {
		height: 50,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#cfd8e3',
		backgroundColor: '#f8fafc',
		paddingHorizontal: 14,
		color: '#0f172a',
		fontSize: 14,
	},
	passwordWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#cfd8e3',
		backgroundColor: '#f8fafc',
		height: 50,
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 14,
		color: '#0f172a',
		fontSize: 14,
	},
	eyeButton: {
		paddingHorizontal: 14,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButton: {
		marginTop: 4,
		backgroundColor: '#185fa5',
		borderRadius: 12,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#185fa5',
		shadowOpacity: 0.25,
		shadowRadius: 10,
		shadowOffset: { width: 0, height: 4 },
		elevation: 2,
	},
	primaryButtonText: {
		color: '#ffffff',
		fontSize: 15,
		fontWeight: '800',
	},
	adminButton: {
		marginTop: 10,
		borderRadius: 12,
		height: 48,
		borderWidth: 1,
		borderColor: '#c8d5e6',
		backgroundColor: '#eef4fb',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 8,
	},
	adminButtonText: {
		color: '#1e3a5f',
		fontSize: 14,
		fontWeight: '700',
	},
	footerRow: {
		marginTop: 14,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
	},
	footerPrompt: {
		color: '#64748b',
		fontSize: 13,
	},
	footerLink: {
		color: '#185fa5',
		fontSize: 13,
		fontWeight: '800',
	},
});
