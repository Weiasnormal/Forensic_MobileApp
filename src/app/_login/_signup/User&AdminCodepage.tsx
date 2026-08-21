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

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';
import { type InviteCodeFormValues, inviteCodeSchema } from '../../../utils/validation';

export default function UserAndAdminCodePage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].signUpCode;

	const [codeValues, setCodeValues] = useState(Array(7).fill(''));
	const inputRefs = useRef<(TextInput | null)[]>([]);
	const {
		setValue,
		handleSubmit,
		formState: { errors },
	} = useForm<InviteCodeFormValues>({
		resolver: zodResolver(inviteCodeSchema),
		defaultValues: {
			code: '',
		},
	});

	const handleCodeChange = (index: number, value: string) => {
		if (value.length > 1) {
			value = value[value.length - 1];
		}

		const allowedPattern = index < 3 ? /[A-Za-z]/ : /[A-Za-z0-9]/;
		if (value && !allowedPattern.test(value)) {
			return;
		}
		value = value.toUpperCase();

		const newValues = [...codeValues];
		newValues[index] = value;
		setCodeValues(newValues);
		setValue('code', newValues.join(''), { shouldValidate: true, shouldDirty: true });

		if (value && index < 6) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleCodeKeyPress = (index: number, key: string) => {
		if (key === 'Backspace' && !codeValues[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = (_values: InviteCodeFormValues) => {
		if (codeValues.join('').length === 7) {
			router.push({
				pathname: '/_login/_signup/PendingUser&Admin',
				params: { role: activeRole },
			});
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : undefined}
		>
			<StatusBar style="light" translucent backgroundColor={colors.primary} />

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color={colors.primaryText} />
					</TouchableOpacity>

					<Text allowFontScaling={false} style={styles.title}>{roleConfig.title}</Text>
					<Text allowFontScaling={false} style={styles.subtitle}>{roleConfig.subtitle}</Text>
				</View>

				<View style={styles.formArea}>
					<Text allowFontScaling={false} style={styles.label}>Invite code</Text>

					<View style={styles.codeInputContainer}>
						{codeValues.map((value, index) => (
							<View key={index}>
								{index === 3 && <Text allowFontScaling={false} style={styles.codeHyphen}>-</Text>}
								<TextInput
									ref={(ref): void => {
										inputRefs.current[index] = ref;
									}}
									style={[styles.codeInput, errors.code && styles.codeInputError]}
									keyboardType="default"
									autoCapitalize="characters"
									maxLength={1}
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

					<Text allowFontScaling={false} style={styles.helperText}>{roleConfig.noCodeText}</Text>

					<TouchableOpacity
						style={[styles.primaryButton, codeValues.join('').length !== 7 && styles.primaryButtonDisabled]}
						activeOpacity={0.85}
						onPress={handleSubmit(handleVerify)}
						disabled={codeValues.join('').length !== 7}
					>
						<Text allowFontScaling={false} style={styles.primaryButtonText}>Verify & continue</Text>
					</TouchableOpacity>
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
	scrollView: {
		flex: 1,
		backgroundColor: colors.background2,
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 10,
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
	title: {
		...getTypographyStyle('t1Title'),
		fontSize: 28,
		color: colors.primaryText,
		marginTop: 20,
	},
	subtitle: {
		...getTypographyStyle('body'),
		fontSize: 14,
		color: 'rgba(255,255,255,0.85)',
		marginTop: 4,
	},
	formArea: {
		flex: 1,
		backgroundColor: colors.background2,
		paddingHorizontal: 20,
		paddingTop: 32,
		paddingBottom: 22,
	},
	label: {
		...getTypographyStyle('c1Caption'),
		color: colors.textSecondary,
		marginBottom: 8,
		textAlign: 'center',
	},
	codeInputContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		gap: 8,
		marginBottom: 16,
		alignItems: 'center',
	},
	codeInput: {
		width: 44,
		height: 50,
		borderRadius: 12,
		borderWidth: 1,
		borderColor: colors.inputBorder,
		backgroundColor: colors.background,
		textAlign: 'center',
		...getTypographyStyle('t3Title'),
		color: colors.textPrimary,
	},
	codeInputError: {
		borderColor: colors.danger,
	},
	codeHyphen: {
		position: 'absolute',
		top: -7,
		color: colors.textSecondary,
		fontSize: 22,
		fontWeight: '300',
		right: -16,
	},
	helperText: {
		...getTypographyStyle('c2Caption'),
		color: colors.textSecondary,
		textAlign: 'center',
		marginBottom: 24,
	},
	errorText: {
		...getTypographyStyle('c2Caption'),
		color: colors.danger,
		textAlign: 'center',
		marginBottom: 10,
	},
	primaryButton: {
		backgroundColor: colors.primary,
		borderRadius: 12,
		paddingVertical: 15,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 'auto',
		marginBottom: 12,
	},
	primaryButtonDisabled: {
		backgroundColor: colors.primaryDisabled,
	},
	primaryButtonText: {
		...getTypographyStyle('b1Button'),
		color: colors.primaryText,
	},
});