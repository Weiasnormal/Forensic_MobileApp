import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { getTypographyStyle } from '@/constants/typography';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import { ScreenNavigationBar } from '@/_components/common/ScreenNavigationBar';

type Slide = {
	title: string;
	description: string;
	image: any;
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

const FADE_OUT_DURATION = 100;
const FADE_IN_DURATION = 100;
const AUTOPLAY_INTERVAL = 5000;

export default function OnBoardingPage() {
	const router = useRouter();
	const { width } = useWindowDimensions();
	const insets = useSafeAreaInsets();
	const [currentIndex, setCurrentIndex] = useState(0);
	const listRef = useRef<FlatList<Slide>>(null);
	const textOpacity = useRef(new Animated.Value(1)).current;
	const autoplayTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	const currentSlide = slides[currentIndex];
	const isLastSlide = currentIndex === slides.length - 1;

	const animateToIndex = (nextIndex: number) => {
		if (nextIndex === currentIndex) return;

		Animated.timing(textOpacity, {
			toValue: 0,
			duration: FADE_OUT_DURATION,
			easing: Easing.in(Easing.ease),
			useNativeDriver: true,
		}).start(() => {
			setCurrentIndex(nextIndex);
			Animated.timing(textOpacity, {
				toValue: 1,
				duration: FADE_IN_DURATION,
				easing: Easing.out(Easing.ease),
				useNativeDriver: true,
			}).start();
		});
	};

	useEffect(() => {
		autoplayTimer.current = setTimeout(() => {
			const nextIndex = (currentIndex + 1) % slides.length;
			listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
			animateToIndex(nextIndex);
		}, AUTOPLAY_INTERVAL);

		return () => {
			if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
		};
	}, [currentIndex]);

	const clearAutoplay = () => {
		if (autoplayTimer.current) clearTimeout(autoplayTimer.current);
	};

	const handleNext = () => {
		if (!isLastSlide) {
			const nextIndex = currentIndex + 1;
			listRef.current?.scrollToIndex({ index: nextIndex, animated: true });
			animateToIndex(nextIndex);
			return;
		}
		router.push('/_login/_signup/SignUppage');
	};

	const handleSkip = () => {
		router.push('/_login/_signup/SignUppage');
	};

	const progressSegments = useMemo(
		() => slides.map((_, index) => index === currentIndex),
		[currentIndex]
	);

	const handleSlideChange = (offsetX: number) => {
		const nextIndex = Math.round(offsetX / width);
		const clamped = Math.max(0, Math.min(nextIndex, slides.length - 1));
		animateToIndex(clamped);
	};

	return (
		<View style={styles.root}>
			<ScreenStatusBar variant="onBrand" />
			<ScreenNavigationBar variant="onLight" />

			{/* Top art bleeds fully to the edge, behind the transparent status bar */}
			<View style={[styles.topArtWrap, { paddingTop: insets.top }]}>
				<Image
					source={require('../../../assets/expo.icon/Assets/OnboardingBG.webp')}
					style={styles.topBlob}
					contentFit="cover"
				/>

				<FlatList
					ref={listRef}
					data={slides}
					horizontal
					pagingEnabled
					showsHorizontalScrollIndicator={false}
					keyExtractor={(_, index) => String(index)}
					onScrollBeginDrag={clearAutoplay}
					onMomentumScrollEnd={(event) => handleSlideChange(event.nativeEvent.contentOffset.x)}
					getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
					style={styles.heroList}
					renderItem={({ item, index }) => (
						<View style={[styles.slide, { width }]}>
							<Image
								source={item.image}
								style={[styles.heroImage, index === 2 && styles.heroImageLast]}
								contentFit="contain"
							/>
						</View>
					)}
				/>
			</View>

			<Animated.View style={[styles.copyBlock, { opacity: textOpacity }]}>
				<Text style={styles.title}>{currentSlide.title}</Text>
				<Text style={styles.description}>{currentSlide.description}</Text>
			</Animated.View>

			{/* Footer bleeds white fully to the bottom edge, behind the transparent nav bar */}
			<View style={[styles.footer, { paddingBottom: insets.bottom + 20 }]}>
				<View style={styles.progressRow}>
					{progressSegments.map((active, index) => (
						<View key={index} style={[styles.progressSegment, active && styles.progressSegmentActive]} />
					))}
				</View>

				<View style={styles.buttonRow}>
					<SecondaryButton label="Skip" onPress={handleSkip} size="large" />
					<PrimaryButton
						label={isLastSlide ? 'Get started' : 'Next'}
						onPress={handleNext}
						size="large"
						style={styles.nextButton}
					/>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	root: {
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
		top: -100,
		left: 0,
		right: 0,
		bottom: 20,
		width: '100%',
	},
	heroList: {
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
	heroImage: {
		position: 'absolute',
		top: 80,
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
		...getTypographyStyle('t2Title'),
		lineHeight: 34,
		textAlign: 'left',
	},
	description: {
		marginTop: 10,
		color: '#66748B',
		...getTypographyStyle('c1Caption'),
	},
	footer: {
		marginTop: 'auto',
		paddingHorizontal: 24,
		paddingTop: 20,
		backgroundColor: '#FFFFFF',
	},
	slide: {
		flex: 1,
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
		backgroundColor: '#1E6FD9',
	},
	buttonRow: {
		flexDirection: 'row',
		gap: 12,
	},
	nextButton: {
		flex: 1,
	},
});