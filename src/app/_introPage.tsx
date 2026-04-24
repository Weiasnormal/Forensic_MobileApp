import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, Pressable, SafeAreaView, StyleSheet, Text, View } from 'react-native';

const logo = require('../../assets/expo.icon/Assets/Avera_Logo.webp');
const orb = require('../../assets/expo.icon/Assets/orb1.webp');

export default function IntroPage() {
	const router = useRouter();

	const handleGetStarted = () => {
		router.push('/_login/LogInPage');
	};

	const handleSignIn = () => {
		router.push('/_login/LogInPage');
	};

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar style="light" />

			<View style={styles.container}>
				<Image source={orb} style={styles.topOrb} resizeMode="cover" />
				<Image source={orb} style={styles.bottomOrb} resizeMode="cover" />

				<View style={styles.logoWrapper}>
					<Image source={logo} style={styles.logo} resizeMode="contain" />
					<Text style={styles.brandName}>Avera</Text>
					<Text style={styles.tagline}>FORENSIC SIGNATURE ANALYSIS</Text>
				</View>

				<View style={styles.buttonContainer}>
					<Pressable style={styles.primaryButton} onPress={handleGetStarted}>
						<Text style={styles.primaryButtonText}>Get started</Text>
					</Pressable>

					<Pressable style={styles.secondaryButton} onPress={handleSignIn}>
						<Text style={styles.secondaryButtonText}>Sign in</Text>
					</Pressable>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#042D5B',
	},
	container: {
		flex: 1,
		backgroundColor: '#042D5B',
		overflow: 'hidden',
		justifyContent: 'space-between',
		paddingHorizontal: 28,
		paddingTop: 24,
		paddingBottom: 44,
	},
	topOrb: {
		position: 'absolute',
		width: 325,
		height: 325,
		top: -84,
		left: -90,
		opacity: 0.92,
	},
	bottomOrb: {
		position: 'absolute',
		width: 230,
		height: 230,
		bottom: 72,
		left: -90,
		opacity: 0.92,
	},
	logoWrapper: {
		alignItems: 'center',
		marginTop: 170,
	},
	logo: {
		width: 148,
		height: 128,
	},
	brandName: {
		color: '#F5F7FB',
		fontSize: 50,
		fontWeight: '700',
		lineHeight: 44,
		letterSpacing: 0.3,
	},
	tagline: {
		marginTop: 8,
		color: '#6E8BAE',
		fontSize: 12,
		fontWeight: '600',
		letterSpacing: 0.9,
	},
	buttonContainer: {
		width: '100%',
		gap: 12,
	},
	primaryButton: {
		height: 50,
		borderRadius: 12,
		backgroundColor: '#E4E5E7',
		alignItems: 'center',
		justifyContent: 'center',
	},
	primaryButtonText: {
		color: '#1A4D86',
		fontSize: 19,
		fontWeight: '700',
	},
	secondaryButton: {
		height: 50,
		borderRadius: 12,
		backgroundColor: '#1B4A7C',
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		color: '#F3F7FF',
		fontSize: 19,
		fontWeight: '700',
	},
});
