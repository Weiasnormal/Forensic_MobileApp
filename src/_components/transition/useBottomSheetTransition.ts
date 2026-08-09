import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, LayoutChangeEvent, PanResponder } from 'react-native';

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
	hiddenY: hiddenYProp = 560,
	closeDragThreshold = 140,
	closeVelocityThreshold = 1.1,
	openDuration = 280,
	closeDuration = 220,
}: BottomSheetTransitionOptions) {
	const [isMounted, setIsMounted] = useState(visible);
	// hiddenYRef holds the real off-screen distance once measured, so the sheet
	// always starts fully hidden regardless of how tall its content actually is.
	const hiddenYRef = useRef(hiddenYProp);
	const [hiddenY, setHiddenY] = useState(hiddenYProp);
	const sheetY = useRef(new Animated.Value(visible ? 0 : hiddenYProp)).current;
	const onCloseRef = useRef(onClose);

	useEffect(() => {
		onCloseRef.current = onClose;
	}, [onClose]);

	const onSheetLayout = (event: LayoutChangeEvent) => {
		// Add a small buffer so the sheet clears the bottom edge with room to spare.
		const measured = Math.ceil(event.nativeEvent.layout.height) + 24;

		if (Math.abs(measured - hiddenYRef.current) > 1) {
			hiddenYRef.current = measured;
			setHiddenY(measured);

			// Only snap the imperative value if we're still hidden — never yank a
			// sheet that's already animating open or fully visible.
			if (!visible) {
				sheetY.setValue(measured);
			}
		}
	};

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
			sheetY.setValue(hiddenYRef.current);
			Animated.timing(sheetY, {
				toValue: 0,
				duration: openDuration,
				easing: Easing.out(Easing.cubic),
				useNativeDriver: true,
			}).start();
			return;
		}

		Animated.timing(sheetY, {
			toValue: hiddenYRef.current,
			duration: closeDuration,
			easing: Easing.in(Easing.cubic),
			useNativeDriver: true,
		}).start(() => {
			setIsMounted(false);
		});
	}, [visible, sheetY, openDuration, closeDuration]);

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
		onSheetLayout,
	};
}