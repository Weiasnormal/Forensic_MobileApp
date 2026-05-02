import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';

export type RippleIntroStage = 'splash' | 'brand';

interface UseRippleTransitionOptions {
	width: number;
	height: number;
	brandRevealDelay?: number;
	rippleDuration?: number;
	brandFadeDuration?: number;
	brandLiftDuration?: number;
	startScale?: number;
	rippleColor?: string;
}

export function useRippleTransition({
	width,
	height,
	brandRevealDelay = 380,
	rippleDuration = 860,
	brandFadeDuration = 380,
	brandLiftDuration = 420,
	startScale = 0.02,
	rippleColor = '#2A71D8',
}: UseRippleTransitionOptions) {
	const [stage, setStage] = useState<RippleIntroStage>('splash');
	const rippleProgress = useRef(new Animated.Value(0)).current;
	const rippleOpacity = useRef(new Animated.Value(0)).current;
	const splashLogoOpacity = useRef(new Animated.Value(1)).current;
	const brandOpacity = useRef(new Animated.Value(0)).current;
	const brandTranslateY = useRef(new Animated.Value(18)).current;

	const rippleSize = useMemo(() => Math.max(width, height) * 2.2, [height, width]);

	useEffect(() => {
		const timer = setTimeout(() => {
			Animated.parallel([
				Animated.timing(rippleOpacity, {
					toValue: 1,
					duration: 90,
					useNativeDriver: true,
				}),
				Animated.timing(rippleProgress, {
					toValue: 1,
					duration: rippleDuration,
					easing: Easing.out(Easing.cubic),
					useNativeDriver: true,
				}),
			]).start(() => {
				setStage('brand');
				Animated.parallel([
					Animated.timing(brandOpacity, {
						toValue: 1,
						duration: brandFadeDuration,
						useNativeDriver: true,
					}),
					Animated.timing(brandTranslateY, {
						toValue: 0,
						duration: brandLiftDuration,
						easing: Easing.out(Easing.cubic),
						useNativeDriver: true,
					}),
				]).start();
			});
		}, brandRevealDelay);

		return () => {
			clearTimeout(timer);
		};
	}, [brandFadeDuration, brandLiftDuration, brandRevealDelay, rippleDuration, brandOpacity, brandTranslateY, rippleOpacity, rippleProgress, splashLogoOpacity]);

	const rippleStyle = {
		width: rippleSize,
		height: rippleSize,
		borderRadius: rippleSize / 2,
		top: (height - rippleSize) / 2,
		left: (width - rippleSize) / 2,
		opacity: rippleOpacity,
		backgroundColor: rippleColor,
		transform: [
			{
				scale: rippleProgress.interpolate({
					inputRange: [0, 1],
					outputRange: [startScale, 1],
				}),
			},
		],
	};

	return {
		stage,
		rippleStyle,
		splashLogoOpacity,
		brandOpacity,
		brandTranslateY,
	};
}
