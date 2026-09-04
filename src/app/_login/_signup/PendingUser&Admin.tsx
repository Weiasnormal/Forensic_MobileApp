import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export default function PendingUserAndAdminPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].pendingApproval;
	const handleWelcomePage = () => {
		router.push('/_login/GetStarted');
	};
	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<ScreenStatusBar variant="onBrand" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.content}>
					<View style={styles.mainContent}>
						<View style={styles.illustrationWrap}>
						<Image source={require('../../../../assets/expo.icon/Assets/pending.webp')} style={styles.illustration} contentFit="contain" />
						</View>

						<Text allowFontScaling={false} style={styles.title}>Pending Approval</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>{roleConfig.description}</Text>
					</View>

					<View style={styles.stepsContainer}>
						{roleConfig.steps.map((step, index) => (
							<View key={index} style={styles.stepRow}>
								<View style={styles.stepNumber}>
									<Text allowFontScaling={false} style={styles.stepNumberText}>{index + 1}</Text>
								</View>
								<Text allowFontScaling={false} style={styles.stepText}>{step}</Text>
							</View>
						))}
					</View>

					<View style={styles.bottomActions}>
						<PrimaryButton
							label="Back to Welcome Page"
							onPress={handleWelcomePage}
							size="large"
							backgroundColor={colors.primary}
							textColor={colors.primaryText}
							textStyle={styles.primaryButtonText}
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
	scrollView: {
		flex: 1,
		backgroundColor: colors.background2,
	},
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 10,
		backgroundColor: colors.background2,
	},
	content: {
		flex: 1,
		backgroundColor: colors.background2,
		paddingHorizontal: 16,
		paddingTop: 42,
		paddingBottom: 20,
		justifyContent: 'space-between',
	},
	mainContent: {
		alignItems: 'center',
		paddingTop: 50,
	},
	illustrationWrap: {
		width: 320,
		height: 270,
		marginTop: 6,
		marginBottom: 18,
		alignItems: 'center',
		justifyContent: 'center',
	},
	illustration: {
		width: '100%',
		height: '100%',
	},
	title: {
		...getTypographyStyle('t1Title'),
		lineHeight: 28,
		textAlign: 'center',
	},
	subtitle: {
		marginTop: 8,
		color: colors.textSecondary,
		...getTypographyStyle('body', 'regular'),
		lineHeight: 20,
		textAlign: 'center',
        marginBottom: 12,
	},
	stepsContainer: {
		width: '100%',
		marginBottom: 24,
		paddingTop: 6,
        marginLeft: 8,
	},
	stepRow: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		marginBottom: 12,
		gap: 10,
	},
	stepNumber: {
		width: 34,
		height: 34,
		borderRadius: 17,
		borderWidth: 1,
		borderColor: colors.primary,
		backgroundColor: colors.background2,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 1,
        outlineWidth: 2,
		outlineColor: colors.primary,  
	},
	stepNumberText: {
		color: colors.primary,
		...getTypographyStyle('body', 'bold'),
	},
	stepText: {
		flex: 1,
		paddingTop: 4,
		color: colors.textSecondary,
		...getTypographyStyle('body', 'regular'),
		lineHeight: 20,
	},
	bottomActions: {
		marginTop: 'auto',
		width: '100%',
		paddingTop: 6,
		paddingBottom: 30,
	},
	primaryButtonText: {
		...getTypographyStyle('b1Button'),
	},
});
