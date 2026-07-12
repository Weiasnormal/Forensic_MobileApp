import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Animated, Image, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

import { useRippleTransition } from '../_components/transition';

const averaMark = require('../../assets/expo.icon/Assets/Avera_Logo.webp');

export default function IntroPage() {
	const router = useRouter();

	const { stage: rippleStage, rippleStyle, brandOpacity, brandTranslateY } = useRippleTransition({
		width: 390,
		height: 844,
	});

	useEffect(() => {
		if (rippleStage !== 'brand') {
			return;
		}

		const finalTimer = setTimeout(() => {
			router.replace('/_login/GetStarted');
		}, 2000);

		return () => clearTimeout(finalTimer);
	}, [router, rippleStage]);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar style="light" />

			<View style={[styles.container, rippleStage === 'splash' ? styles.splashStage : styles.brandStage]}>
				<Animated.View pointerEvents="none" style={[styles.ripple, rippleStyle]} />

				<View style={styles.logoLockup}>
					<Image source={averaMark} style={styles.logo} resizeMode="contain" />

					<Animated.Text
						style={[
							styles.brandName,
							{ opacity: brandOpacity, transform: [{ translateY: brandTranslateY }] },
						]}
					>
						Avera
					</Animated.Text>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#000000',
	},
	container: {
		flex: 1,
		overflow: 'hidden',
	},
	splashStage: {
		backgroundColor: '#000000',
	},
	brandStage: {
		backgroundColor: colors.primary,
	},
	ripple: {
		position: 'absolute',
	},
	logoLockup: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
	},
	logo: {
		width: 155,
		height: 98,
	},
	brandName: {
		...getTypographyStyle('largeTitle'),
		marginTop: 4,
		color: colors.primaryText,
		fontSize: 34,
		letterSpacing: 0.2,
		textAlign: 'center',
		fontFamily: 'Sora_800ExtraBold',
	},
});