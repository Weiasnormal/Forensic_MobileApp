import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useBottomSheetTransition } from '@/_components/transition';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';

interface ChangeEmailSuccessModalProps {
	visible: boolean;
	newEmail: string;
	onDone: () => void;
}

export default function ChangeEmailSuccessModal({ visible, newEmail, onDone }: ChangeEmailSuccessModalProps) {
	const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
		visible,
		onClose: onDone,
	});

	if (!isMounted) return null;

	return (
		<Modal visible={isMounted} transparent onRequestClose={onDone} statusBarTranslucent>
			<View style={styles.root}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onDone}>
					<Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
				</Pressable>

				<Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
					<View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
						<View style={styles.dragHandle} />
					</View>

					<View style={styles.iconCircle}>
						<Ionicons name="checkmark" size={28} color={colors.statusGenuine} />
					</View>

					<Text allowFontScaling={false} style={styles.title}>Check Your Inbox</Text>
					<Text allowFontScaling={false} style={styles.subtitle}>
						Link sent to {newEmail}. Expires in 30 min.
					</Text>

					<PrimaryButton label="Done" onPress={onDone} size="large" style={styles.button} />
				</Animated.View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, justifyContent: 'flex-end' },
	backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
	sheet: {
		backgroundColor: colors.background2,
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		paddingHorizontal: 24,
		paddingTop: 10,
		paddingBottom: 28,
		alignItems: 'center',
		borderWidth: 1,
		borderColor: colors.sheetBorder,
	},
	dragHandleWrap: { 
		alignItems: 'center', 
		paddingBottom: 12, 
		alignSelf: 'stretch' 
	},
	dragHandle: { 
		width: 44, 
		height: 5, 
		borderRadius: 999, 
		backgroundColor: colors.sheetHandle, 
		alignSelf: 'center' 
	},
	iconCircle: {
		width: 56, 
		height: 56, 
		borderRadius: 28, 
		borderWidth: 2, 
		borderColor: colors.statusGenuine,
		alignItems: 'center', 
		justifyContent: 'center', 
		marginBottom: 14,
	},
	title: { 
		...getTypographyStyle('t3Title'), 
		color: colors.textPrimary, 
		textAlign: 'center' 
	},
	subtitle: { 
		...getTypographyStyle('c1Caption', 'regular'), 
		color: colors.textSecondary, 
		textAlign: 'center', 
		marginTop: 6, 
		marginBottom: 22 
	},
	button: { 
		width: '100%' 
	},
});