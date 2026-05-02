import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Animated, Easing, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const introComponent = require('../../../assets/expo.icon/Assets/introcomponent.webp');
const logoPlaceholder = require('../../../assets/expo.icon/Assets/logo_placeholder.webp');

export default function GetStartedPage() {
	const router = useRouter();
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(22)).current;

	const handleGetStarted = () => {
		router.push('/_login/OnBoardingpage');
	};

	const handleSignIn = () => {
		router.push('/_login/SignInPage');
	};

	useEffect(() => {
		Animated.parallel([
			Animated.timing(opacity, {
				toValue: 1,
				duration: 420,
				useNativeDriver: true,
			}),
			Animated.timing(translateY, {
				toValue: 0,
				duration: 460,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}),
		]).start();
	}, [opacity, translateY]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar style="light" />

			<Animated.View style={[styles.container, { opacity, transform: [{ translateY }] }]}>
				<Image source={logoPlaceholder} style={styles.finalWordmark} resizeMode="contain" />

				<View style={styles.heroWrap}>
					<View style={styles.heroGlow} />
					<Image source={introComponent} style={styles.heroArt} resizeMode="contain" />
				</View>

				<View style={styles.copyBlock}>
					<Text style={styles.headline}>
						<Text>Detect Forgery{"\n"}with </Text>
						<Text style={styles.headlineAccent}>Confidence.</Text>
					</Text>
					<Text style={styles.subheadline}>Catch forgeries your eyes might miss</Text>
				</View>

				<View style={styles.buttonContainer}>
					<Pressable style={styles.primaryButton} onPress={handleGetStarted}>
						<Text style={styles.primaryButtonText}>Get started</Text>
					</Pressable>

					<Pressable style={styles.secondaryButton} onPress={handleSignIn}>
						<Text style={styles.secondaryButtonText}>Sign in</Text>
					</Pressable>
				</View>
			</Animated.View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#2A71D8',
	},
	container: {
		flex: 1,
		backgroundColor: '#2A71D8',
		overflow: 'hidden',
		paddingHorizontal: 26,
		paddingTop: 18,
		paddingBottom: 34,
		justifyContent: 'space-between',
	},
	finalWordmark: {
		alignSelf: 'center',
		width: 110,
		height: 40,
		marginTop: 40,
	},
	heroWrap: {
		alignItems: 'center',
		justifyContent: 'center',
        marginBottom: -65,
	},
	heroGlow: {
		position: 'absolute',
		width: 270,
		height: 255,
		borderRadius: 135,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	heroArt: {
		width: '100%',
		height: 340,
	},
	heroBadge: {
		position: 'absolute',
		top: 10,
		right: 20,
		width: 54,
		height: 54,
		opacity: 0.95,
	},
	copyBlock: {
		alignItems: 'center',
		paddingHorizontal: 10,
        paddingBottom: 30,
	},
	headline: {
		color: '#FFFFFF',
		fontSize: 26,
		fontWeight: '800',
		lineHeight: 31,
		textAlign: 'center',
	},
	headlineAccent: {
		color: '#BBD4FF',
	},
	subheadline: {
		marginTop: 10,
		color: '#EAF1FF',
		fontSize: 15,
		lineHeight: 20,
		textAlign: 'center',
		opacity: 0.95,
	},
	buttonContainer: {
		gap: 12,
	},
	primaryButton: {
		height: 52,
		borderRadius: 14,
		backgroundColor: '#F4F7FF',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#000',
		shadowOpacity: 0.15,
		shadowRadius: 16,
		shadowOffset: { width: 0, height: 8 },
		elevation: 3,
	},
	primaryButtonText: {
		color: '#2A71D8',
		fontSize: 18,
		fontWeight: '800',
	},
	secondaryButton: {
		height: 52,
		borderRadius: 14,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		borderWidth: 1,
		borderColor: 'rgba(255, 255, 255, 0.72)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	secondaryButtonText: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '800',
	},
});
