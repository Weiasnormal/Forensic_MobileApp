import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

type SignupRole = 'analyst' | 'admin';

const ROLE_CONFIG = {
	analyst: {
		description: 'Your registration is under review.\nYou\'ll receive an email once approved by your Admin.',
		steps: ['Admin reviews your request', 'You receive an approval email', 'Sign in to access your dashboard'],
	},
	admin: {
		description: 'Your registration is under review.\nYou\'ll receive an email once approved by your Super Admin.',
		steps: ['Super Admin reviews your request', 'You receive an approval email', 'Sign in to access your dashboard'],
	},
} as const;

export default function PendingUserAndAdminPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = params.role === 'admin' ? 'admin' : 'analyst';
	const roleConfig = ROLE_CONFIG[activeRole as SignupRole];

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="dark" translucent backgroundColor="#ffffff" />

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
									<Text allowFontScaling={false} style={styles.stepNumberText}>{index + 1}.</Text>
								</View>
								<Text allowFontScaling={false} style={styles.stepText}>{step}</Text>
							</View>
						))}
					</View>

					<View style={styles.bottomActions}>
						<TouchableOpacity style={styles.primaryButton} activeOpacity={0.9} onPress={() => router.push('/_login/SignInPage')}>
							<Text allowFontScaling={false} style={styles.primaryButtonText}>Back to sign in</Text>
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
	content: {
		flex: 1,
		backgroundColor: '#FFFFFF',
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
		color: '#172033',
		fontSize: 22,
		lineHeight: 28,
		fontWeight: '800',
		textAlign: 'center',
	},
	subtitle: {
		marginTop: 8,
		color: '#6E7E96',
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
		fontWeight: '500',
        marginBottom: 12,
	},
	bodyText: {
		color: '#6E7E96',
        marginTop: 12,
		fontSize: 14,
		lineHeight: 20,
		textAlign: 'center',
		fontWeight: '500',
		marginBottom: 22,
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
		borderColor: '#2D72D1',
		backgroundColor: '#ffffff',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 1,
        outlineWidth: 2,
        outlineColor: '#2D72D1',  
	},
	stepNumberText: {
		color: '#2D72D1',
		fontSize: 14,
		fontWeight: '800',
	},
	stepText: {
		flex: 1,
		paddingTop: 4,
		color: '#6E7E96',
		fontSize: 14,
		lineHeight: 20,
	},
	bottomActions: {
		marginTop: 'auto',
		width: '100%',
		paddingTop: 6,
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
});
