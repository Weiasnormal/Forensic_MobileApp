import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { PasswordStrengthGuide } from '../../../_components/auth/PasswordStrengthGuide';
import { type AppRole, ROLE_LABEL, ROLE_SETTINGS } from '../../../constants/roles';
import { usePasswordStrength } from '../../../hooks/usePasswordStrength';
import { type SignUpFormValues, signUpSchema } from '../../../utils/validation';

//const maintenanceImage = require('../../../../assets/expo.icon/Assets/under_maintenance.webp');

export default function SignUpPage() {
	const router = useRouter();
	const [activeRole, setActiveRole] = useState<AppRole>('analyst');
	const isOrgAdmin = activeRole === 'admin';
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [isPasswordFocused, setIsPasswordFocused] = useState(false);
	const [wasPasswordBlurred, setWasPasswordBlurred] = useState(false);

	const roleConfig = ROLE_SETTINGS[activeRole].signUp;
	const {
		control,
		handleSubmit,
		watch,
		formState: { errors },
	} = useForm<SignUpFormValues>({
		resolver: zodResolver(signUpSchema),
		defaultValues: {
			firstName: '',
			lastName: '',
			email: '',
			password: '',
			confirmPassword: '',
		},
	});

	const passwordValue = watch('password') ?? '';
	const passwordStrength = usePasswordStrength(passwordValue);
	const showPasswordGuidance = isPasswordFocused;
	const showPasswordError = wasPasswordBlurred && !isPasswordFocused && passwordValue.trim().length > 0 && !passwordStrength.isValid;

	const handleContinue = (_values: SignUpFormValues) => {
		router.push({
			pathname: '/_login/_signup/User&AdminCodepage',
			params: { role: activeRole },
		});
	};

	return (
		<View style={styles.container}>
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

			<KeyboardAwareScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				keyboardShouldPersistTaps="handled"
				enableOnAndroid={true}
				extraScrollHeight={24}
			>
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.push('/_login/GetStarted')}>
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
								{ROLE_LABEL.analyst}
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
								{ROLE_LABEL.admin}
							</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.formBody}>
						{/* {isOrgAdmin ? (
							<View style={styles.maintenanceWrap}>
								<Image source={maintenanceImage} style={styles.maintenanceImage} resizeMode="contain" />
								<Text style={styles.maintenanceTitle}>Feature Currently Unavailable</Text>
								<Text style={styles.maintenanceBody}>
									This section is currently being polished. We`&apos;`ll be ready for you shortly.
								</Text>
							</View>
						) : ( */}
						<>
						<View style={styles.nameRow}>
							<View style={[styles.fieldGroup, styles.halfField]}>
								<Text style={styles.label}>First name</Text>
								<Controller
								control={control}
								name="firstName"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={[styles.input, errors.firstName && styles.inputError]}
										placeholder="Your first name"
										placeholderTextColor="#94a3b8"
										autoCapitalize="words"
										textContentType="givenName"
										autoComplete="name-given"
										value={value}
										onBlur={onBlur}
										onChangeText={onChange}
									/>
								)}
							/>
							{errors.firstName?.message ? <Text style={styles.errorText}>{errors.firstName.message}</Text> : null}
							</View>

							<View style={[styles.fieldGroup, styles.halfField]}>
								<Text style={styles.label}>Last Name</Text>
								<Controller
								control={control}
								name="lastName"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={[styles.input, errors.lastName && styles.inputError]}
										placeholder="Your last name"
										placeholderTextColor="#94a3b8"
										autoCapitalize="words"
										textContentType="familyName"
										autoComplete="name-family"
										value={value}
										onBlur={onBlur}
										onChangeText={onChange}
									/>
								)}
							/>
							{errors.lastName?.message ? <Text style={styles.errorText}>{errors.lastName.message}</Text> : null}
							</View>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Email</Text>
							<Controller
							control={control}
							name="email"
							render={({ field: { onChange, onBlur, value } }) => (
								<TextInput
									style={[styles.input, errors.email && styles.inputError]}
									placeholder={roleConfig.emailPlaceholder}
									placeholderTextColor="#94a3b8"
									keyboardType="email-address"
									autoCapitalize="none"
									autoCorrect={false}
									textContentType="emailAddress"
									autoComplete="email"
									value={value}
									onBlur={onBlur}
									onChangeText={onChange}
								/>
							)}
							/>
							{errors.email?.message ? <Text style={styles.errorText}>{errors.email.message}</Text> : null}
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Password</Text>
							<View style={[styles.passwordWrap, isPasswordFocused && styles.passwordWrapFocused, showPasswordError && styles.passwordWrapError]}>
								<Controller
								control={control}
								name="password"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={styles.passwordInput}
										placeholder="Create a password"
										placeholderTextColor="#94a3b8"
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
							<TouchableOpacity
								style={styles.eyeButton}
								activeOpacity={0.75}
								onPress={() => setShowPassword((prev) => !prev)}
							>
								<Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#8a99af" />
							</TouchableOpacity>
						</View>
						<PasswordStrengthGuide
							password={passwordValue}
							isVisible={showPasswordGuidance}
							showError={showPasswordError}
							errorMessage="Password does not meet requirements"
						/>
						</View>

						<View style={styles.fieldGroup}>
							<Text style={styles.label}>Confirm password</Text>
							<View style={styles.passwordWrap}>
								<Controller
								control={control}
								name="confirmPassword"
								render={({ field: { onChange, onBlur, value } }) => (
									<TextInput
										style={[styles.passwordInput, errors.confirmPassword && styles.inputError]}
										placeholder="Repeat password"
										placeholderTextColor="#94a3b8"
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
							{errors.confirmPassword?.message ? <Text style={styles.errorText}>{errors.confirmPassword.message}</Text> : null}
						</View>
						</>
					</View>

					<TouchableOpacity
						style={[styles.primaryButton, isOrgAdmin && styles.primaryButtonDisabled]}
						activeOpacity={0.85}
						onPress={handleSubmit(handleContinue)}
						disabled={isOrgAdmin}
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
			</KeyboardAwareScrollView>
		</View>
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
		backgroundColor: '#ffffff',
	},
	hero: {
		backgroundColor: '#1E6FD9',
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
	formBody: {
		minHeight: 360,
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
		backgroundColor: '#1E6FD9',
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
	passwordWrapFocused: {
		borderColor: '#1E6FD9',
		backgroundColor: '#F5F9FF',
	},
	passwordWrapError: {
		borderColor: '#E24B4A',
		backgroundColor: '#FFF6F6',
	},
	passwordInput: {
		flex: 1,
		paddingHorizontal: 14,
		paddingVertical: 12,
		color: '#0f172a',
		fontSize: 14,
	},
	inputError: {
		borderColor: '#E24B4A',
	},
	eyeButton: {
		paddingHorizontal: 14,
		paddingVertical: 9,
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButton: {
		backgroundColor: '#1E6FD9',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		marginBottom: 12,
	},
	primaryButtonDisabled: {
		backgroundColor: '#C9D7EA',
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
	errorText: {
		marginTop: 6,
		left: 6,
		color: '#E24B4A',
		fontSize: 12,
		fontWeight: '600',
	},
	maintenanceWrap: {
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 8,
		marginBottom: 18,
		marginTop: 6,
	},
	maintenanceImage: {
		width: 210,
		height: 140,
		marginBottom: 10,
	},
	maintenanceTitle: {
		color: '#1F2B3E',
		fontSize: 18,
		fontWeight: '800',
		textAlign: 'center',
		marginBottom: 8,
	},
	maintenanceBody: {
		color: '#66768E',
		fontSize: 13,
		lineHeight: 19,
		textAlign: 'center',
		maxWidth: 300,
	},
});
