import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Slide = {
	title: string;
	description: string;
	image: any;
	imageStyle?: object;
};

const slides: Slide[] = [
	{
		title: 'See What Others Miss',
		description: 'Avera gives you a definitive answer on every signature you question.',
		image: require('../../../assets/expo.icon/Assets/Onboarding1.webp'),
	},
	{
		title: 'AI That Reads Every Line',
		description: 'Our system scans every stroke, angle, and pressure point across your document.',
		image: require('../../../assets/expo.icon/Assets/Onboarding2.webp'),
	},
	{
		title: 'Three Visualization Modes',
		description: 'Use heatmaps, bounding boxes, and stroke diff overlays to clearly show where signatures deviate.',
		image: require('../../../assets/expo.icon/Assets/Onboarding3.webp'),
	},
];

export default function OnBoardingPage() {
	const router = useRouter();
	const { width } = useWindowDimensions();
	const [currentIndex, setCurrentIndex] = useState(0);

	const currentSlide = slides[currentIndex];
	const isLastSlide = currentIndex === slides.length - 1;

	const handleNext = () => {
		if (!isLastSlide) {
			setCurrentIndex((value) => value + 1);
			return;
		}

		router.push('/_login/SignInPage');
	};

	const handleSkip = () => {
		router.push('/_login/SignInPage');
	};

	const progressSegments = useMemo(
		() => slides.map((_, index) => index === currentIndex),
		[currentIndex]
	);

	return (
		<SafeAreaView style={styles.safeArea}>
			<StatusBar style="light" />
			<View style={styles.container}>
				<View style={styles.topArtWrap}>
					<Image source={require('../../../assets/expo.icon/Assets/OnboardingBG.webp')} style={styles.topBlob} contentFit="cover" />
					<Image source={currentSlide.image} style={[styles.heroImage, currentIndex === 2 && styles.heroImageLast]} contentFit="contain" />
				</View>
				<View style={styles.copyBlock}>
					<Text style={styles.title}>{currentSlide.title}</Text>
					<Text style={styles.description}>{currentSlide.description}</Text>
				</View>

				<View style={styles.footer}>
					<View style={styles.progressRow}>
						{progressSegments.map((active, index) => (
							<View key={index} style={[styles.progressSegment, active && styles.progressSegmentActive]} />
						))}
					</View>

					<View style={styles.buttonRow}>
						<TouchableOpacity style={styles.skipButton} activeOpacity={0.82} onPress={handleSkip}>
							<Text style={styles.skipButtonText}>Skip</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.nextButton} activeOpacity={0.86} onPress={handleNext}>
							<Text style={styles.nextButtonText}>{isLastSlide ? 'Get started' : 'Next'}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
		</SafeAreaView>
	);
}

const styles = StyleSheet.create({
	safeArea: {
		flex: 1,
		backgroundColor: '#1E6FD9',
	},
	container: {
		flex: 1,
		backgroundColor: '#FFFFFF',
	},
	topArtWrap: {
		height: 420,
		position: 'relative',
		overflow: 'hidden',
	},
	topBlob: {
		position: 'absolute',
		bottom: 30,
		left: 0,
		width: '105%',
		height: '100%',
	},
	heroImage: {
		position: 'absolute',
		top: 90,
		width: '100%',
		height: 400,
	},
	heroImageLast: {
		top: 90,
		height: 400,
	},
	copyBlock: {
		paddingHorizontal: 28,
		paddingTop: 35,
	},
	title: {
		color: '#2B2D31',
		fontSize: 28,
		lineHeight: 34,
		fontWeight: '800',
		letterSpacing: -0.6,
		textAlign: 'left',
	},
	description: {
		marginTop: 10,
		color: '#66748B',
		fontSize: 15,
		lineHeight: 22,
	},
	footer: {
		marginTop: 'auto',
		paddingHorizontal: 24,
		paddingTop: 20,
		paddingBottom: 30,
	},
	progressRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		gap: 8,
		marginBottom: 20,
	},
	progressSegment: {
		width: 7,
		height: 7,
		borderRadius: 3.5,
		backgroundColor: '#CBD5E1',
	},
	progressSegmentActive: {
		width: 18,
		backgroundColor: '#1F6FE5',
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
	},
	skipButton: {
		width: 102,
		height: 52,
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#D8E0EC',
		backgroundColor: '#FFFFFF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	skipButtonText: {
		color: '#6D7F98',
		fontSize: 16,
		fontWeight: '700',
	},
	nextButton: {
		flex: 1,
		height: 52,
		borderRadius: 14,
		backgroundColor: '#1F6FE5',
		alignItems: 'center',
		justifyContent: 'center',
		shadowColor: '#1F6FE5',
		shadowOpacity: 0.2,
		shadowRadius: 14,
		shadowOffset: { width: 0, height: 8 },
		elevation: 3,
	},
	nextButtonText: {
		color: '#FFFFFF',
		fontSize: 16,
		fontWeight: '800',
	},
});
