import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import ErrorBanner from '@/_components/common/ErrorBanner';

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';
import { type ForgotPasswordFormValues, forgotPasswordSchema } from '../../../utils/validation';
import { forgotPassword } from '@/services/authApi';

export default function EnterEmailPage() {
	const router = useRouter();
	const insets = useSafeAreaInsets();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;
	const [requestError, setRequestError] = useState<string | null>(null);
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<ForgotPasswordFormValues>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: '',
		},
	});

	const handleSendCode = async (values: ForgotPasswordFormValues) => {
		setRequestError(null);
		const { implemented } = await forgotPassword(values.email);
		if (!implemented) {
			setRequestError('Password recovery is temporarily unavailable. Please try again later.');
			return;
		}

		router.push({
			pathname: '/_login/forgot_password/verify',
			params: { role: activeRole, email: values.email },
		});
	};

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="light" translucent backgroundColor={colors.primary} />

			<View style={styles.hero}>
				<TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
					<Ionicons name="chevron-back" size={22} color={colors.primaryText} />
				</TouchableOpacity>

				<View style={styles.heroCopy}>
					<Text allowFontScaling={false} style={styles.title}>Forgot Password?</Text>
					<Text allowFontScaling={false} style={styles.subtitle}>
						Enter your email and we&apos;ll send you a verification code
					</Text>
				</View>
			</View>

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				keyboardShouldPersistTaps="handled"
				showsVerticalScrollIndicator={false}
			>
				<View style={styles.content}>
					<View style={styles.inputGroup}>
						<Controller
							control={control}
							name="email"
							render={({ field: { onChange, onBlur, value } }) => (
								<FormField
									label="Email"
									value={value}
									onChangeText={onChange}
									onBlur={onBlur}
									placeholder={roleConfig.emailPlaceholder}
									keyboardType="email-address"
									autoCapitalize="none"
									autoComplete="email"
									textContentType="emailAddress"
									error={errors.email?.message}
									style={styles.noMargin}
								/>
							)}
						/>
						<Text allowFontScaling={false} style={styles.helperText}>
							We&apos;ll send a 6-digit code to {roleConfig.verificationEmail}.
						</Text>
					</View>
				</View>
			</ScrollView>

			<View style={[styles.bottomActions, { paddingBottom: insets.bottom + 12 }]}>
				<ErrorBanner message={requestError} />

				<PrimaryButton
					label="Send code"
					onPress={handleSubmit(handleSendCode)}
					size="large"
				/>

				<View style={styles.footerRow}>
					<Text allowFontScaling={false} style={styles.footerPrompt}>Remember your password? </Text>
					<TouchableOpacity activeOpacity={0.7} onPress={() => router.push('/_login/SignInPage')}>
						<Text allowFontScaling={false} style={styles.footerAction}>Sign in</Text>
					</TouchableOpacity>
				</View>
			</View>
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
		color: colors.primaryText,
	},
	subtitle: {
		...getTypographyStyle('c1Caption', 'regular'),
		color: colors.heroSubtitleText,
		marginTop: 4,
		paddingRight: 20,
	},
	heroCopy: {
		marginTop: 20,
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
	content: {
		paddingHorizontal: 20,
		paddingTop: 24,
	},
	inputGroup: {
		marginBottom: 14,
	},
	noMargin: {
		marginBottom: 0,
	},
	helperText: {
		...getTypographyStyle('c2Caption'),
		color: colors.textTertiary,
		marginTop: 10,
	},
	bottomActions: {
		paddingHorizontal: 20,
		paddingTop: 12,
		backgroundColor: colors.background2,
	},
	footerRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 3,
		marginTop: 14,
	},
	footerPrompt: {
		...getTypographyStyle('c1Caption'),
		color: colors.textSecondary,
	},
	footerAction: {
		...getTypographyStyle('c1Caption'),
		color: colors.primary,
	},
});