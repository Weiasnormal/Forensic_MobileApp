import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, PanResponder } from 'react-native';

interface BottomSheetTransitionOptions {
	visible: boolean;
	onClose: () => void;
	hiddenY?: number;
	closeDragThreshold?: number;
	closeVelocityThreshold?: number;
	openDuration?: number;
	closeDuration?: number;
}

export function useBottomSheetTransition({
	visible,
	onClose,
	hiddenY = 420,
	closeDragThreshold = 140,
	closeVelocityThreshold = 1.1,
	openDuration = 280,
	closeDuration = 220,
}: BottomSheetTransitionOptions) {
	const [isMounted, setIsMounted] = useState(visible);
	const sheetY = useRef(new Animated.Value(visible ? 0 : hiddenY)).current;
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	const snapToOpen = () => {
		Animated.spring(sheetY, {
			toValue: 0,
			useNativeDriver: true,
			bounciness: 0,
			speed: 18,
		}).start();
	};

	const panResponder = useRef(
		PanResponder.create({
			onMoveShouldSetPanResponder: (_, gestureState) =>
				gestureState.dy > 2 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
			onPanResponderMove: (_, gestureState) => {
				sheetY.setValue(Math.max(0, gestureState.dy));
			},
			onPanResponderRelease: (_, gestureState) => {
				if (gestureState.dy > closeDragThreshold || gestureState.vy > closeVelocityThreshold) {
					onCloseRef.current();
					return;
				}

				snapToOpen();
			},
			onPanResponderTerminate: () => {
				snapToOpen();
			},
		})
	).current;

	useEffect(() => {
		if (visible) {
			setIsMounted(true);
			sheetY.setValue(hiddenY);
			Animated.timing(sheetY, {
				toValue: 0,
				duration: openDuration,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}).start();
			return;
		}

		Animated.timing(sheetY, {
			toValue: hiddenY,
			duration: closeDuration,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				setIsMounted(false);
			}
		});
	}, [visible, sheetY, hiddenY, openDuration, closeDuration]);

	const backdropOpacity = useMemo(
		() =>
			sheetY.interpolate({
				inputRange: [0, hiddenY],
				outputRange: [1, 0],
				extrapolate: 'clamp',
			}),
		[sheetY, hiddenY]
	);

	return {
		isMounted,
		sheetY,
		backdropOpacity,
		dragHandlePanHandlers: panResponder.panHandlers,
	};
}
