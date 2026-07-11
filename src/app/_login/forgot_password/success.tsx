import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';

const successIllustration = require('../../../../assets/expo.icon/Assets/success.webp');

export default function SuccessPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="dark" translucent backgroundColor={colors.background2} />

			<ScrollView
				style={styles.scrollView}
				contentContainerStyle={styles.scrollContent}
				bounces={false}
				keyboardShouldPersistTaps="handled"
			>
				<View style={styles.content}>
					<View style={styles.mainContent}>
						<View style={styles.illustrationWrap}>
							<Image source={successIllustration} style={styles.illustration} contentFit="contain" />
						</View>

						<Text allowFontScaling={false} style={styles.title}>Password Reset</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>
							{roleConfig.successMessage}
							{'\n'}Sign in with your new password.
						</Text>
					</View>

					<View style={styles.bottomActions}>
						<PrimaryButton
							label="Back to Welcome Page"
							onPress={() => router.push('/_login/GetStarted')}
							size="large"
							style={styles.signInButton}
						/>
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
	content: {
		flex: 1,
		backgroundColor: colors.background2,
		paddingHorizontal: 20,
		paddingTop: 42,
		paddingBottom: 20,
		justifyContent: 'space-between',
	},
	mainContent: {
		alignItems: 'center',
		paddingTop: 100,
	},
	illustrationWrap: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 6,
		marginBottom: 18,
	},
	illustration: {
		width: 300,
		height: 250,
	},
	title: {
		...getTypographyStyle('t1Title'),
		color: colors.textPrimary,
		textAlign: 'center',
	},
	subtitle: {
		...getTypographyStyle('body'),
		fontSize: 14,
		marginTop: 8,
		color: colors.textSecondary,
		textAlign: 'center',
	},
	bottomActions: {
		marginTop: 'auto',
		width: '100%',
	},
	signInButton: {
		marginTop: 10,
		marginBottom: 12,
	},
});