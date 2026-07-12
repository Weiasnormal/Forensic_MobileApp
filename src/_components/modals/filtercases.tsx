import React, { useState } from 'react';
import {
	Animated,
	Modal,
	Pressable,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
} from 'react-native';

import { type SavedCase } from '../../store/caseStore';
import { useBottomSheetTransition } from '../transition';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import SecondaryButton from '@/_components/common/SecondaryButton';
import PrimaryButton from '@/_components/common/PrimaryButton';

interface FilterCasesModalProps {
	visible: boolean;
	onClose: () => void;
	cases: SavedCase[];
	onApply?: (filters: {
		sortBy: string;
		verdict: string | null;
		priority: string | null;
		analysisType: string | null;
		filteredCases: SavedCase[];
	}) => void;
}

const sortOptions = ['Newest first', 'Oldest first', 'Suspected first', 'Genuine first'];
const verdictOptions = ['All', 'Genuine', 'Suspected', 'Processing'];
const priorityOptions = ['All', 'Low', 'Medium', 'High', 'Urgent'];

const DEFAULT_SORT = sortOptions[0];
const DEFAULT_VERDICT = 'All';
const DEFAULT_PRIORITY = 'All';

export default function FilterCasesModal({ visible, onClose, cases, onApply }: FilterCasesModalProps) {
	const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
		visible,
		onClose,
	});

	const [sortBy, setSortBy] = useState<string>(DEFAULT_SORT);
	const [verdict, setVerdict] = useState<string | null>(DEFAULT_VERDICT);
	const [priority, setPriority] = useState<string | null>(DEFAULT_PRIORITY);

	if (!isMounted) return null;

	const computeFilteredCases = (sortValue: string, verdictValue: string | null, priorityValue: string | null) => {
		let filteredCases = [...cases];

		if (verdictValue && verdictValue !== 'All') {
			filteredCases = filteredCases.filter((item) => item.status === verdictValue);
		}

		if (priorityValue && priorityValue !== 'All') {
			filteredCases = filteredCases.filter((item) => item.priority === priorityValue);
		}

		if (sortValue === 'Newest first') {
			filteredCases.sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime());
		} else if (sortValue === 'Oldest first') {
			filteredCases.sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());
		} else if (sortValue === 'Suspected first') {
			filteredCases.sort((left, right) => {
				if (left.status === 'Suspected' && right.status !== 'Suspected') return -1;
				if (left.status !== 'Suspected' && right.status === 'Suspected') return 1;
				return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
			});
		} else if (sortValue === 'Genuine first') {
			filteredCases.sort((left, right) => {
				if (left.status === 'Genuine' && right.status !== 'Genuine') return -1;
				if (left.status !== 'Genuine' && right.status === 'Genuine') return 1;
				return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
			});
		}

		return filteredCases;
	};

	const handleApply = () => {
		const filteredCases = computeFilteredCases(sortBy, verdict, priority);
		onApply?.({ sortBy, verdict, priority, analysisType: null, filteredCases });
		onClose();
	};

	const handleReset = () => {
		setSortBy(DEFAULT_SORT);
		setVerdict(DEFAULT_VERDICT);
		setPriority(DEFAULT_PRIORITY);

		const filteredCases = computeFilteredCases(DEFAULT_SORT, DEFAULT_VERDICT, DEFAULT_PRIORITY);
		onApply?.({
			sortBy: DEFAULT_SORT,
			verdict: DEFAULT_VERDICT,
			priority: DEFAULT_PRIORITY,
			analysisType: null,
			filteredCases,
		});
		onClose();
	};

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

					<Text allowFontScaling={false} style={styles.title}>Sort & Filter</Text>

					<Text allowFontScaling={false} style={styles.sectionLabel}>SORT BY</Text>
					<View style={styles.rowWrap}>
						{sortOptions.map((opt) => (
							<Chip key={opt} label={opt} selected={sortBy === opt} onPress={() => setSortBy(opt)} />
						))}
					</View>

					<View style={styles.sep} />

					<Text allowFontScaling={false} style={styles.sectionLabel}>VERDICT</Text>
					<View style={styles.rowWrap}>
						{verdictOptions.map((opt) => (
							<Pill key={opt} label={opt} selected={verdict === opt} onPress={() => setVerdict(opt)} />
						))}
					</View>

					<View style={styles.sep} />

					<Text allowFontScaling={false} style={styles.sectionLabel}>PRIORITY</Text>
					<View style={styles.rowWrap}>
						{priorityOptions.map((opt) => (
							<Pill key={opt} label={opt} selected={priority === opt} onPress={() => setPriority(opt)} />
						))}
					</View>

					<View style={styles.buttonRow}>
						<SecondaryButton label="Reset" onPress={handleReset} size="medium" style={styles.resetButton} />
						<PrimaryButton label="Apply" onPress={handleApply} size="medium" style={styles.applyButton} />
					</View>
				</Animated.View>
			</View>
		</Modal>
	);
}

function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.86}
			style={[styles.chip, selected ? styles.chipSelected : styles.chipOutline]}
		>
			<Text allowFontScaling={false} style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextOutline]} numberOfLines={1}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

function Pill({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
	return (
		<TouchableOpacity
			onPress={onPress}
			activeOpacity={0.86}
			style={[styles.pill, selected ? styles.pillSelected : styles.pillOutline]}
		>
			<Text allowFontScaling={false} style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextOutline]}>
				{label}
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	root: { flex: 1, justifyContent: 'flex-end' },
	backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
	sheet: {
		backgroundColor: colors.background2,
		borderTopLeftRadius: 22,
		borderTopRightRadius: 22,
		paddingHorizontal: 18,
		paddingTop: 10,
		paddingBottom: 22,
		borderWidth: 1,
		borderColor: colors.sheetBorder,
	},
	dragHandleWrap: { alignItems: 'center', paddingBottom: 8 },
	dragHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: colors.sheetHandle, marginBottom: 6 },
	title: {
		...getTypographyStyle('t2Title'),
		color: colors.textPrimary,
		marginBottom: 12,
	},
	sectionLabel: {
		...getTypographyStyle('c2Caption', 'bold'),
		fontSize: 12,
		color: colors.label,
		marginBottom: 8,
	},
	rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
	sep: { height: 1, backgroundColor: colors.dividerLight, marginVertical: 12 },

	chip: {
		borderRadius: 999,
		paddingHorizontal: 14,
		paddingVertical: 8,
		marginRight: 8,
		marginBottom: 8,
		minWidth: 86,
		alignItems: 'center',
	},
	chipOutline: {
		backgroundColor: colors.background2,
		borderWidth: 1,
		borderColor: colors.searchBorder,
	},
	chipSelected: {
		backgroundColor: colors.primary,
	},
	chipText: {
		...getTypographyStyle('l1List'),
	},
	chipTextOutline: { color: colors.textSecondary },
	chipTextSelected: { color: colors.primaryText },

	pill: {
		borderRadius: 999,
		paddingHorizontal: 12,
		paddingVertical: 8,
		marginRight: 8,
		marginBottom: 8,
		borderWidth: 1,
	},
	pillOutline: { backgroundColor: colors.background2, borderColor: colors.searchBorder },
	pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
	pillText: {
		...getTypographyStyle('l1List'),
	},
	pillTextOutline: { color: colors.textSecondary },
	pillTextSelected: { color: colors.primaryText },

	buttonRow: {
		flexDirection: 'row',
		gap: 10,
		marginTop: 16,
	},
	resetButton: {
		flex: 1,
	},
	applyButton: {
		flex: 1,
	},
});