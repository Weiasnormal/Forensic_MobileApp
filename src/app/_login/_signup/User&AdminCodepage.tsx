import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useState } from 'react';
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
		title: 'Join Your Organization',
		subtitle: 'Enter the code your admin gave you',
		noCodeText: 'No code yet? Ask your organization admin',
	},
	admin: {
		title: 'Join Your Organization',
		subtitle: 'Enter the code your Super Admin gave you',
		noCodeText: 'No code yet? Reach out to your Super Admin',
	},
} as const;

export default function UserAndAdminCodePage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = params.role === 'admin' ? 'admin' : 'analyst';
	const roleConfig = ROLE_CONFIG[activeRole as SignupRole];

	const [codeValues, setCodeValues] = useState(Array(7).fill(''));
	const inputRefs = useRef<(TextInput | null)[]>([]);

	const handleCodeChange = (index: number, value: string) => {
		if (value.length > 1) {
			value = value[value.length - 1];
		}

		const newValues = [...codeValues];
		newValues[index] = value;
		setCodeValues(newValues);

		if (value && index < 6) {
			inputRefs.current[index + 1]?.focus();
		}
	};

	const handleCodeKeyPress = (index: number, key: string) => {
		if (key === 'Backspace' && !codeValues[index] && index > 0) {
			inputRefs.current[index - 1]?.focus();
		}
	};

	const handleVerify = () => {
		const code = codeValues.join('');
		if (code.length === 7) {
			router.push({
				pathname: '/_login/_signup/PendingUser&Admin',
				params: { role: activeRole },
			});
		}
	};

	return (
		<KeyboardAvoidingView
			style={styles.container}
			behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
		>
			<StatusBar style="light" translucent backgroundColor="#2D72D1" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.hero}>
					<TouchableOpacity style={styles.backButton} activeOpacity={0.8} onPress={() => router.back()}>
						<Ionicons name="chevron-back" size={22} color="#EAF3FF" />
					</TouchableOpacity>

					<Text style={styles.title}>{roleConfig.title}</Text>
					<Text style={styles.subtitle}>{roleConfig.subtitle}</Text>
				</View>

				<View style={styles.formArea}>
					<Text style={styles.label}>Invite code</Text>

					<View style={styles.codeInputContainer}>
						{codeValues.map((value, index) => (
							<View key={index}>
								{index === 3 && <Text style={styles.codeHyphen}>-</Text>}
								<TextInput
									ref={(ref): void => {
										inputRefs.current[index] = ref;
									}}
									style={styles.codeInput}
									keyboardType="number-pad"
									maxLength={1}
									value={value}
									onChangeText={(text) => handleCodeChange(index, text)}
									onKeyPress={(e) => handleCodeKeyPress(index, e.nativeEvent.key)}
									placeholder=""
									placeholderTextColor="#94a3b8"
								/>
							</View>
						))}
					</View>

					<Text style={styles.helperText}>{roleConfig.noCodeText}</Text>

					<TouchableOpacity
						style={[styles.primaryButton, codeValues.join('').length !== 7 && styles.primaryButtonDisabled]}
						activeOpacity={0.85}
						onPress={handleVerify}
						disabled={codeValues.join('').length !== 7}
					>
						<Text style={styles.primaryButtonText}>Verify & continue</Text>
					</TouchableOpacity>
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
		paddingTop: 32,
		paddingBottom: 22,
	},
	label: {
		color: '#8A99AE',
		fontSize: 11,
		fontWeight: '700',
		letterSpacing: 0,
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
		borderColor: '#D0DAE8',
		backgroundColor: '#F8FAFC',
		textAlign: 'center',
		color: '#0f172a',
		fontSize: 18,
		fontWeight: '600',
	},
	codeHyphen: {
		position: 'absolute',
		top: -7,
		color: '#8A99AE',
		fontSize: 22,
		fontWeight: '300',
		right: -16,
	},
	helperText: {
		color: '#8A99AE',
		fontSize: 12,
		textAlign: 'center',
		marginBottom: 24,
	},
	primaryButton: {
		backgroundColor: '#2D72D1',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 'auto',
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
});
