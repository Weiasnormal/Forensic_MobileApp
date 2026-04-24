import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
	Animated,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
import { useBottomSheetTransition } from '../transition';

interface NewAnalysisModalProps {
	visible: boolean;
	onClose: () => void;
}

const options: Array<{
	key: string;
	title: string;
	subtitle: string;
	icon: keyof typeof Ionicons.glyphMap;
	iconBackground: string;
	borderColor: string;
}> = [
	{
		key: 'signature',
		title: 'Signature Analysis',
		subtitle: 'Compare 4 references - detect forgeries',
		icon: 'brush-outline',
		iconBackground: '#1F5DA8',
		borderColor: '#DDEBFF',
	},
	{
		key: 'handwriting',
		title: 'Handwriting Analysis',
		subtitle: 'Compare 4 samples · CRAFT bounding boxes',
		icon: 'remove',
		iconBackground: '#16A34A',
		borderColor: '#D8F5E2',
	},
	{
		key: 'document',
		title: 'Document Analysis',
		subtitle: 'Full document · word-level heatmaps',
		icon: 'document-text-outline',
		iconBackground: '#EA8B2D',
		borderColor: '#FDE7D2',
	},
];

export default function NewAnalysisModal({ visible, onClose }: NewAnalysisModalProps) {
	const router = useRouter();
	const nav = router as any;
	const initializeFlow = useAnalysisFlowStore((state) => state.initializeFlow);

	const handleOptionPress = (key: string) => {
		if (key === 'signature') {
			initializeFlow('signature');
			onClose();
			setTimeout(() => {
				nav.push('/analysis/signature/step1');
			}, 220);
			return;
		}

		if (key === 'handwriting') {
			initializeFlow('handwriting');
			onClose();
			setTimeout(() => {
				nav.push('/analysis/handwriting/step1');
			}, 220);
			return;
		}

		onClose();
	};

	const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
		visible,
		onClose,
	});

	if (!isMounted) {
		return null;
	}

	return (
		<Modal visible={isMounted} transparent onRequestClose={onClose} statusBarTranslucent>
			<View style={styles.root}>
				<Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
					<Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
				</Pressable>

				<Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
					<View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
						<View style={styles.dragHandle} />
					</View>

					<Text style={styles.title}>New analysis</Text>
					<Text style={styles.subtitle}>Choose what type of analysis to run</Text>

					<View style={styles.actionList}>
						{options.map((option) => (
							<ActionButton
								key={option.key}
								option={option}
								onPress={() => handleOptionPress(option.key)}
							/>
						))}
					</View>

					<TouchableOpacity style={styles.cancelButton} activeOpacity={0.86} onPress={onClose}>
						<Text style={styles.cancelText}>Cancel</Text>
					</TouchableOpacity>
				</Animated.View>
			</View>
		</Modal>
	);
}

function ActionButton({
	option,
	onPress,
}: {
	option: (typeof options)[number];
	onPress: () => void;
}) {
	return (
		<TouchableOpacity
			style={[styles.actionButton, { borderColor: option.borderColor }]}
			activeOpacity={0.84}
			onPress={onPress}
		>
			<View style={[styles.actionIconWrap, { backgroundColor: option.iconBackground }]}> 
				<Ionicons name={option.icon} size={18} color="#FFFFFF" />
			</View>

			<View style={styles.textGroup}>
				<Text style={styles.actionTitle}>{option.title}</Text>
				<Text style={styles.actionSubtitle}>{option.subtitle}</Text>
			</View>

			<Ionicons name="chevron-forward" size={16} color="#94A3B8" />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	root: {
		flex: 1,
		justifyContent: 'flex-end',
	},
	backdrop: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: 'rgba(15,23,42,0.56)',
	},
	sheet: {
		backgroundColor: '#FFFFFF',
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		paddingHorizontal: 16,
		paddingTop: 10,
		paddingBottom: 18,
		borderWidth: 1,
		borderColor: '#E7EFFC',
	},
	dragHandleWrap: {
		alignItems: 'center',
		paddingBottom: 8,
	},
	dragHandle: {
		alignSelf: 'center',
		width: 44,
		height: 5,
		borderRadius: 999,
		backgroundColor: '#D9E2EE',
		marginBottom: 6,
	},
	title: {
		fontSize: 26,
		fontWeight: '900',
		color: '#0F172A',
		letterSpacing: -0.6,
	},
	subtitle: {
		marginTop: 4,
		fontSize: 13,
		color: '#94A3B8',
		fontWeight: '500',
	},
	actionList: {
		marginTop: 14,
		gap: 10,
	},
	actionButton: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: '#FFFFFF',
		borderWidth: 1,
		borderColor: '#DDEBFF',
		borderRadius: 14,
		paddingHorizontal: 12,
		paddingVertical: 10,
	},
	actionIconWrap: {
		width: 34,
		height: 34,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textGroup: {
		flex: 1,
		minWidth: 0,
	},
	actionTitle: {
		fontSize: 14,
		fontWeight: '800',
		color: '#0F172A',
	},
	actionSubtitle: {
		marginTop: 2,
		fontSize: 11,
		fontWeight: '500',
		color: '#94A3B8',
	},
	cancelButton: {
		marginTop: 14,
		width: '100%',
		backgroundColor: '#F1F5F9',
		borderRadius: 12,
		paddingVertical: 13,
		alignItems: 'center',
	},
	cancelText: {
		fontSize: 13,
		fontWeight: '700',
		color: '#94A3B8',
	},
});
