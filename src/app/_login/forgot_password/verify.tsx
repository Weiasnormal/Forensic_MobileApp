import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';
import { type VerificationCodeFormValues, verificationCodeSchema } from '../../../utils/validation';

export default function VerifyPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;
	const [codeValues, setCodeValues] = useState(Array(6).fill(''));
	const [codeRefs] = useState<(TextInput | null)[]>([]);
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
			codeRefs[index + 1]?.focus();
		}
	};

	const handleVerify = (_values: VerificationCodeFormValues) => {
		router.push({ pathname: '/_login/forgot_password/reset', params: { role: activeRole } });
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
						<Text allowFontScaling={false} style={styles.title}>Check Your Email</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>We sent a 6-digit code to {roleConfig.verificationEmail}</Text>
					</View>
				</View>

				<View style={styles.content}>
					<Text allowFontScaling={false} style={styles.sectionLabel}>Enter verification code</Text>

					<View style={styles.codeRow}>
						{codeValues.map((value, index) => (
							<View key={index} style={styles.codeBox}>
								<TextInput
									ref={(ref): void => {
										codeRefs[index] = ref;
									}}
									style={styles.codeInput}
									keyboardType="number-pad"
									maxLength={1}
 									textContentType="oneTimeCode"
 									autoComplete="one-time-code"
 									value={value}
 									onChangeText={(text) => handleCodeChange(index, text)}
									placeholder=""
									placeholderTextColor="#8FA0B7"
								/>
							</View>
						))}
					</View>

					{errors.code?.message ? <Text style={styles.errorText}>{errors.code.message}</Text> : null}

					<View style={styles.metaRow}>
						<Text allowFontScaling={false} style={styles.metaText}>Code expires in: 4:30</Text>
						<TouchableOpacity activeOpacity={0.7}>
							<Text allowFontScaling={false} style={styles.metaAction}>Resend code</Text>
						</TouchableOpacity>
					</View>

					<View style={styles.bottomActions}>
						<TouchableOpacity
							style={styles.primaryButton}
							activeOpacity={0.9}
							onPress={handleSubmit(handleVerify)}
						>
							<Text allowFontScaling={false} style={styles.primaryButtonText}>Verify</Text>
						</TouchableOpacity>

						<View style={styles.footerRow}>
							<Text allowFontScaling={false} style={styles.footerPrompt}>Wrong email? </Text>
							<TouchableOpacity activeOpacity={0.7} onPress={() => router.push({ pathname: '/_login/forgot_password/enterEmail', params: { role: activeRole } })}>
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
	sectionLabel: {
		alignSelf: 'center',
		color: '#8A99AE',
		fontSize: 12,
		fontWeight: '700',
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
		borderColor: '#D0DAE8',
		backgroundColor: '#E9EEF5',
		alignItems: 'center',
		justifyContent: 'center',
	},
	codeInput: {
		width: '100%',
		height: '100%',
		textAlign: 'center',
		fontSize: 18,
		color: '#1F2B3E',
		paddingVertical: 0,
	},
	errorText: {
		marginTop: 10,
		color: '#E24B4A',
		fontSize: 12,
		fontWeight: '600',
		textAlign: 'center',
	},
	metaRow: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginTop: 10,
	},
	metaText: {
		color: '#8A99AE',
		fontSize: 12,
		fontWeight: '600',
	},
	metaAction: {
		color: '#1E63CA',
		fontSize: 12,
		fontWeight: '800',
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
