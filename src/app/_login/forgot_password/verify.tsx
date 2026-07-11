import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
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
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';
import { type VerificationCodeFormValues, verificationCodeSchema } from '../../../utils/validation';

export default function VerifyPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;

	const [codeValues, setCodeValues] = useState(Array(6).fill(''));
	const codeRefs = useRef<(TextInput | null)[]>([]);
	const {
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm<VerificationCodeFormValues>({
		resolver: zodResolver(verificationCodeSchema),
		defaultValues: {
			code: '',
		},
	});

	const handleCodeChange = (index: number, value: string) => {
		const nextValue = value.replace(/\D/g, '').slice(-1);
		const nextValues = [...codeValues];
		nextValues[index] = nextValue;
		setCodeValues(nextValues);
		setValue('code', nextValues.join(''), { shouldValidate: true, shouldDirty: true });

		if (nextValue && index < 5) {
			codeRefs.current[index + 1]?.focus();
		}
	};

	const handleCodeKeyPress = (index: number, key: string) => {
		if (key === 'Backspace' && !codeValues[index] && index > 0) {
			codeRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = (_values: VerificationCodeFormValues) => {
		router.push({ pathname: '/_login/forgot_password/reset', params: { role: activeRole } });
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
						<Text allowFontScaling={false} style={styles.title}>Check Your Email</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>
							We sent a 6-digit code to {roleConfig.verificationEmail}
						</Text>
					</View>
				</View>

				<View style={styles.content}>
					<Text allowFontScaling={false} style={styles.sectionLabel}>Enter verification code</Text>

					<View style={styles.codeRow}>
						{codeValues.map((value, index) => (
							<View key={index} style={[styles.codeBox, errors.code && styles.codeBoxError]}>
								<TextInput
									ref={(ref): void => {
										codeRefs.current[index] = ref;
									}}
									style={styles.codeInput}
									keyboardType="number-pad"
									maxLength={1}
									textContentType="oneTimeCode"
									autoComplete="one-time-code"
									value={value}
									onChangeText={(text) => handleCodeChange(index, text)}
									onKeyPress={(e) => handleCodeKeyPress(index, e.nativeEvent.key)}
									placeholder=""
									placeholderTextColor={colors.textTertiary}
								/>
							</View>
						))}
					</View>

					{errors.code?.message ? (
						<Text allowFontScaling={false} style={styles.errorText}>{errors.code.message}</Text>
					) : null}

					<View style={styles.metaRow}>
						<Text allowFontScaling={false} style={styles.metaText}>Code expires in: 4:30</Text>
						<TouchableOpacity activeOpacity={0.7}>
							<Text allowFontScaling={false} style={styles.metaAction}>Resend code</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.bottomActions}>
						<PrimaryButton
							label="Verify"
							onPress={handleSubmit(handleVerify)}
							size="large"
							style={styles.verifyButton}
						/>

						<View style={styles.footerRow}>
							<Text allowFontScaling={false} style={styles.footerPrompt}>Wrong email? </Text>
							<TouchableOpacity
								activeOpacity={0.7}
								onPress={() =>
									router.push({ pathname: '/_login/forgot_password/enterEmail', params: { role: activeRole } })
								}
							>
								<Text allowFontScaling={false} style={styles.footerAction}>Change email</Text>
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
	sectionLabel: {
		...getTypographyStyle('c1Caption'),
		alignSelf: 'center',
		color: colors.textSecondary,
		marginBottom: 18,
	},
	codeRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		gap: 6,
	},
	codeBox: {
		flex: 1,
		height: 52,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.inputBorder,
		backgroundColor: colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	codeBoxError: {
		borderColor: colors.danger,
	},
	codeInput: {
		width: '100%',
		height: '100%',
		textAlign: 'center',
		...getTypographyStyle('t3Title'),
		color: colors.textPrimary,
		paddingVertical: 0,
	},
	errorText: {
		...getTypographyStyle('c2Caption'),
		marginTop: 10,
		color: colors.danger,
		textAlign: 'center',
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	},
	metaText: {
		...getTypographyStyle('c2Caption'),
		color: colors.textSecondary,
	},
	metaAction: {
		...getTypographyStyle('c2Caption', 'bold'),
		color: colors.primary,
	},
	bottomActions: {
		marginTop: 'auto',
	},
	verifyButton: {
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