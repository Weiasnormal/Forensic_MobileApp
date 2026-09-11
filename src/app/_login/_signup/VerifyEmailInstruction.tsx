import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { resolveRole } from '@/constants/roles';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';
import ErrorBanner from '@/_components/common/ErrorBanner';

const envelopeArt = require('../../../../assets/expo.icon/Assets/verify_email_1.webp');

const STEPS = [
	'Check your email inbox',
	'Tap the verification link',
	'Return here to continue',
];

export default function VerifyEmailInstruction() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string; email?: string }>();
	const activeRole = resolveRole(params.role);
	const email = params.email ?? 'your email';

	const isVerified = useEmailVerificationStore((s) => s.isVerified);
	const verificationError = useEmailVerificationStore((s) => s.lastError);

	const handleContinue = () => {
		if (!isVerified) return;

		router.replace({
			pathname: '/_login/SignInPage',
			params: { role: activeRole, verifiedEmail: email },
		});
	};

	return (
		<SafeAreaView style={styles.container}>
			<StatusBar style="dark" />

			<TouchableOpacity style={styles.backButton} activeOpacity={0.85} onPress={() => router.back()}>
				<Ionicons name="chevron-back" size={22} color={colors.primary} />
			</TouchableOpacity>

			<ScrollView contentContainerStyle={styles.scrollContent} bounces={false}>
				<View style={styles.illustrationWrap}>
					<Image source={envelopeArt} style={styles.illustration} contentFit="contain" />
				</View>

				<Text allowFontScaling={false} style={styles.title}>Verify Your Email</Text>
				<Text allowFontScaling={false} style={styles.subtitle}>
					We sent a verification link{'\n'}to {email}.
				</Text>

				<ErrorBanner message={verificationError} title="Verification issue" />

				<View style={styles.stepsList}>
					{STEPS.map((step, index) => (
						<View key={step} style={styles.stepRow}>
							<View style={[styles.stepBadge, index === 0 && isVerified && styles.stepBadgeDone]}>
								<Text allowFontScaling={false} style={styles.stepBadgeText}>{index + 1}</Text>
							</View>
							<Text allowFontScaling={false} style={styles.stepText}>{step}</Text>
						</View>
					))}
				</View>
			</ScrollView>

			<View style={styles.bottomActions}>
				<PrimaryButton
					label={isVerified ? 'Continue' : 'Waiting for verification…'}
					onPress={handleContinue}
					disabled={!isVerified}
					size="large"
				/>

				<View style={styles.resendRow}>
					<Text allowFontScaling={false} style={styles.resendPrompt}>Didn&apos;t receive the email? </Text>
					<TouchableOpacity activeOpacity={0.7} disabled>
						<Text allowFontScaling={false} style={[styles.resendAction, { opacity: 0.5 }]}>
							Resend unavailable — check spam folder
						</Text>
					</TouchableOpacity>
				</View>
				{/* BACKEND TODO: add POST /auth/resend-verification-email before re-enabling this. */}
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	container: { 
		flex: 1, 
		backgroundColor: colors.background2 
	},
	backButton: {
		width: 36, 
		height: 36, 
		borderRadius: 10, 
		borderWidth: 1,
		borderColor: colors.primary, 
		alignItems: 'center', 
		justifyContent: 'center',
		marginLeft: 20, 
		marginTop: 12,
	},
	scrollContent: { 
		flexGrow: 1, 
		paddingHorizontal: 24, 
		paddingTop: 12, 
		alignItems: 'center' 
	},
	illustrationWrap: { 
		width: '100%', 
		alignItems: 'center', 
		marginVertical: 20 
	},
	illustration: { 
		width: 260, 
		height: 200 
	},
	title: { 
		...getTypographyStyle('t1Title'), 
		color: colors.textPrimary, 
		textAlign: 'center' 
	},
	subtitle: {
		...getTypographyStyle('body'), 
		fontSize: 14, 
		color: colors.textSecondary,
		textAlign: 'center', 
		marginTop: 8, 
		marginBottom: 28,
	},
	stepsList: { 
		width: '100%', 
		gap: 16 
	},
	stepRow: { 
		flexDirection: 'row', 
		alignItems: 'center', 
		gap: 12 
	},
	stepBadge: {
		width: 28, 
		height: 28, 
		borderRadius: 14, 
		borderWidth: 1.5, 
		borderColor: colors.primary,
		alignItems: 'center', 
		justifyContent: 'center',
	},
	stepBadgeText: { 
		...getTypographyStyle('c1Caption', 'bold'), 
		color: colors.primary 
	},
	stepBadgeDone: { 
		backgroundColor: colors.primaryLight, 
		borderColor: colors.statusGenuine 
	},
	stepText: { 
		...getTypographyStyle('body'), 
		color: colors.textPrimary 
	},
	bottomActions: { 
		paddingHorizontal: 20, 
		paddingBottom: 24, 
		gap: 4 
	},
	resendRow: { 
		flexDirection: 'row', 
		justifyContent: 'center', 
		marginTop: 14 
	},
	resendPrompt: { 
		...getTypographyStyle('c1Caption'), 
		color: colors.textSecondary 
	},
	resendAction: { 
		...getTypographyStyle('c1Caption', 'bold'), 
		color: colors.primary 
	},
});