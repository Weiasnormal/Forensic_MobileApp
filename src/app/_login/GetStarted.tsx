import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export default function GetStartedPage() {
	const router = useRouter();
	const opacity = useRef(new Animated.Value(0)).current;
	const translateY = useRef(new Animated.Value(22)).current;

	const handleGetStarted = () => {
		router.push('/_login/OnBoardingpage');
		//router.push('/Admin/profileScreens/MemberDetailsScreen');
	};

	const handleSignIn = () => {
		router.push('/_login/SignInPage');
	};
	
	const handleDevScan = () => {
		router.push('/_devscan');
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
				<Image source={useMemo(() => require('../../../assets/expo.icon/Assets/logo_placeholder.webp'), [])} style={styles.finalWordmark} resizeMode="contain" />

				<View style={styles.heroWrap}>
					<View style={styles.heroGlow} />
					<Image source={useMemo(() => require('../../../assets/expo.icon/Assets/introcomponent.webp'), [])} style={styles.heroArt} resizeMode="contain" />
				</View>

				<View style={styles.copyBlock}>
					<Text style={styles.headline}>
						<Text>Detect Forgery{"\n"}with </Text>
						<Text style={styles.headlineAccent}>Confidence.</Text>
					</Text>
					<Text style={styles.subheadline}>Catch forgeries your eyes might miss</Text>
				</View>

				<View style={styles.buttonContainer}>
					<PrimaryButton
						label="Get started"
						onPress={handleGetStarted}
						size="large"
						backgroundColor="#F8FAFC"
						textColor="#1E6FD9"
						textStyle={styles.primaryButtonText}
					/>

					<SecondaryButton
						label="Sign in"
						onPress={handleSignIn}
						size="large"
						backgroundColor="#1E6FD9"
						borderColor="#F8FAFC"
						textColor="#F8FAFC"
						textStyle={styles.secondaryButtonText}
					/>

					{__DEV__ && (
						<SecondaryButton
							label="Scan (Dev Only)"
							onPress={handleDevScan}
							size="small"
							backgroundColor="#1E6FD9"
							borderColor="#F8FAFC"
							textColor="#F8FAFC"
							textStyle={{ ...styles.secondaryButtonText, fontSize: 14 }}
						/>
					)}
				</View>
			</Animated.View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: colors.primary,
	},
	container: {
		flex: 1,
		backgroundColor: colors.primary,
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
        marginBottom: -100,
	},
	heroGlow: {
		position: 'absolute',
		width: 270,
		height: 255,
		borderRadius: 135,
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
	},
	heroArt: {
		width: '120%',
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
		lineHeight: 31,
		textAlign: 'center',
		...getTypographyStyle('t1Title'),
	},
	headlineAccent: {
		color: '#8FD4FF',
		...getTypographyStyle('t1Title'),

	},
	subheadline: {
		marginTop: 10,
		color: colors.primaryLight,
		lineHeight: 20,
		textAlign: 'center',
		opacity: 0.95,
		...getTypographyStyle('c1Caption', 'regular'),
	},
	buttonContainer: {
		gap: 12,
	},
	primaryButtonText: {
		...getTypographyStyle('b1Button'),
	},
	secondaryButtonText: {
		...getTypographyStyle('b1Button'),
	},
});
