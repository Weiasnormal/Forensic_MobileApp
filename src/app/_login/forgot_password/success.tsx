import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { resolveRole, ROLE_SETTINGS } from '../../../constants/roles';

const successIllustration = require('../../../../assets/expo.icon/Assets/success.webp');

export default function SuccessPage() {
	const router = useRouter();
	const params = useLocalSearchParams<{ role?: string }>();
	const activeRole = resolveRole(params.role);
	const roleConfig = ROLE_SETTINGS[activeRole].forgotPassword;

	return (
		<KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
			<StatusBar style="dark" translucent backgroundColor="#ffffff" />

			<ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} bounces={false} keyboardShouldPersistTaps="handled">
				<View style={styles.content}>

					<View style={styles.mainContent}>
					<View style={styles.illustrationWrap}>
						<Image source={successIllustration} style={styles.illustration} contentFit="contain" />
					</View>

					<Text allowFontScaling={false} style={styles.title}>Password Reset</Text>
						<Text allowFontScaling={false} style={styles.subtitle}>{roleConfig.successMessage}{"\n"}Sign in with your new password.</Text>
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
	scrollContent: {
		flexGrow: 1,
		paddingBottom: 10,
		backgroundColor: '#ffffff',
	},
	scrollView: {
		flex: 1,
		backgroundColor: '#ffffff',
	},
	backButton: {
		width: 36,
		height: 36,
		borderRadius: 10,
		borderWidth: 1,
		borderColor: '#D0DAE8',
		backgroundColor: '#F3F7FC',
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'flex-start',
		marginTop: 38,
		marginLeft: 16,
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
	},
	bottomActions: {
		marginTop: 'auto',
		width: '100%',
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
