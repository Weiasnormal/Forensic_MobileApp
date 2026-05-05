import { Ionicons } from '@expo/vector-icons';
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

type SignupRole = 'analyst' | 'admin';

const ROLE_CONFIG = {
	analyst: {
		roleLabel: 'Forensic Analyst',
		subtitle: 'Almost there. Joining as a Forensic Analyst',
		emailPlaceholder: 'user@institution.gov.ph',
	},
	admin: {
		roleLabel: 'Org Admin',
		subtitle: 'Almost there. Joining as an Admin',
		emailPlaceholder: 'admin@institution.gov.ph',
	},
} as const;

export default function SignUpPage() {
	const router = useRouter();
	const [activeRole, setActiveRole] = useState<SignupRole>('analyst');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');

	const roleConfig = ROLE_CONFIG[activeRole];

	const handleContinue = () => {
		router.push({
			pathname: '/_login/_signup/User&AdminCodepage',
			params: { role: activeRole },
		});
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color="#EAF3FF" />
					</TouchableOpacity>

					<Text style={styles.title}>Set Up Your Account</Text>
					<Text style={styles.subtitle}>{roleConfig.subtitle}</Text>
				</View>

				<View style={styles.formArea}>
					<View style={styles.roleTabsContainer}>
						<TouchableOpacity
							style={[styles.roleTab, activeRole === 'analyst' && styles.roleTabActive]}
							activeOpacity={0.8}
							onPress={() => setActiveRole('analyst')}
						>
							<Text
								style={[
									styles.roleTabText,
									activeRole === 'analyst' && styles.roleTabTextActive,
								]}
							>
								Forensic Analyst
							</Text>
						</TouchableOpacity>

						<TouchableOpacity
							style={[styles.roleTab, activeRole === 'admin' && styles.roleTabActive]}
							activeOpacity={0.8}
							onPress={() => setActiveRole('admin')}
						>
							<Text
								style={[
									styles.roleTabText,
									activeRole === 'admin' && styles.roleTabTextActive,
								]}
							>
								Org Admin
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.nameRow}>
						<View style={[styles.fieldGroup, styles.halfField]}>
							<Text style={styles.label}>First name</Text>
							<TextInput
								style={styles.input}
								placeholder="Your first name"
								placeholderTextColor="#94a3b8"
								autoCapitalize="words"
								value={firstName}
								onChangeText={setFirstName}
							/>
						</View>

						<View style={[styles.fieldGroup, styles.halfField]}>
							<Text style={styles.label}>Last Name</Text>
							<TextInput
								style={styles.input}
								placeholder="Your last name"
								placeholderTextColor="#94a3b8"
								autoCapitalize="words"
								value={lastName}
								onChangeText={setLastName}
							/>
						</View>
					</View>

					<View style={styles.fieldGroup}>
						<Text style={styles.label}>Email</Text>
						<TextInput
							style={styles.input}
							placeholder={roleConfig.emailPlaceholder}
							placeholderTextColor="#94a3b8"
							keyboardType="email-address"
							autoCapitalize="none"
							autoCorrect={false}
							value={email}
							onChangeText={setEmail}
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
								value={password}
								onChangeText={setPassword}
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
								value={confirmPassword}
								onChangeText={setConfirmPassword}
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
						onPress={handleContinue}
					>
						<Text style={styles.primaryButtonText}>Continue</Text>
					</TouchableOpacity>

					<View style={styles.footerRow}>
						<Text style={styles.footerPrompt}>Already have an account? </Text>
						<TouchableOpacity activeOpacity={0.75} onPress={() => router.push('/_login/SignInPage')}>
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
		backgroundColor: '#ffffff',

	},
	scrollView: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 10,
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
	title: {
		color: '#ffffff',
		fontSize: 33,
		lineHeight: 40,
		fontWeight: '800',
		letterSpacing: -0.6,
		marginTop: 18,
	},
	subtitle: {
		color: 'rgba(233, 241, 255, 0.9)',
		fontSize: 14,
		lineHeight: 20,
		marginTop: 4,
		fontWeight: '500',
	},
	formArea: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		paddingHorizontal: 16,
		paddingTop: 24,
		paddingBottom:20,
	},
	roleTabsContainer: {
		flexDirection: 'row',
		backgroundColor: '#E8EDF5',
		borderRadius: 18,
		padding: 4,
		marginBottom: 22,
	},
	roleTab: {
		flex: 1,
		borderRadius: 14,
		paddingVertical: 9,
		alignItems: 'center',
	},
	roleTabActive: {
		backgroundColor: '#2D72D1',
	},
	roleTabText: {
		color: '#3F3F3F',
		fontSize: 13,
		fontWeight: '700',
	},
	roleTabTextActive: {
		color: '#F7FBFF',
	},
	nameRow: {
		flexDirection: 'row',
		gap: 10,
	},
	fieldGroup: {
		marginBottom: 14,
	},
	halfField: {
		flex: 1,
	},
	label: {
		color: '#8A99AE',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0,
		marginBottom: 8,
	},
	input: {
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#D0DAE8',
		backgroundColor: '#E9EEF5',
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#0f172a',
		fontSize: 14,
	},
	passwordWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 12,
		borderWidth: 1,
		borderColor: '#D0DAE8',
		backgroundColor: '#E9EEF5',
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#0f172a',
		fontSize: 14,
	},
	eyeButton: {
		paddingHorizontal: 14,
		paddingVertical: 9,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButton: {
		backgroundColor: '#2D72D1',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
		justifyContent: 'center',
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
		marginTop: 14,
	},
	footerPrompt: {
		color: '#8A99AE',
		fontSize: 13,
	},
	footerLink: {
		color: '#1E63CA',
		fontSize: 13,
		fontWeight: '800',
	},
});
