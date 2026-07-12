import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type CaseStatus = 'Suspected' | 'Genuine' | 'Processing';

interface CaseCardProps {
	caseCode: string;
	type: string;
	name: string;
	status: CaseStatus;
	priority: string;
	createdAt: string;
	onPress?: () => void;
}

const priorityColors: Record<string, string> = {
	Urgent: colors.priorityUrgent,
	High: colors.priorityHigh,
	Medium: colors.priorityMedium,
	Low: colors.priorityLow,
};

const statusStyles: Record<CaseStatus, { borderColor: string; badgeColor: string; badgeText: string; badgeBgColor: string }> = {
	Suspected: {
		borderColor: colors.statusSuspected,
		badgeColor: colors.statusSuspected,
		badgeText: 'Suspected',
		badgeBgColor: colors.statusSuspectedBg,
	},
	Genuine: {
		borderColor: colors.statusGenuine,
		badgeColor: colors.statusGenuine,
		badgeText: 'Genuine',
		badgeBgColor: colors.statusGenuineBg,
	},
	Processing: {
		borderColor: colors.statusProcessing,
		badgeColor: colors.statusProcessing,
		badgeText: 'Processing',
		badgeBgColor: colors.statusProcessingBg,
	},
};

export default function CaseCard({ caseCode, type, name, status, priority, createdAt, onPress }: CaseCardProps) {
	const style = statusStyles[status] ?? statusStyles.Processing;

	return (
		<TouchableOpacity
			style={styles.card}
			activeOpacity={0.75}
			onPress={onPress}
		>
			<View style={[styles.accentLine, { backgroundColor: style.borderColor }]} />
			<View style={styles.header}>
				<View style={{ flex: 1 }}>
					<Text allowFontScaling={false} style={styles.id}>{caseCode}</Text>
					<Text allowFontScaling={false} style={styles.typeLabel}>
						{type}
						{priority && (
							<Text style={{ color: priorityColors[priority] || colors.textSecondary }}>
								{''} {priority}
							</Text>
						)}
					</Text>
				</View>
				<View style={[styles.badge, { backgroundColor: style.badgeBgColor }]}>
					<Text allowFontScaling={false} style={[styles.badgeText, { color: style.badgeColor }]}>{style.badgeText}</Text>
				</View>
			</View>
			<Text allowFontScaling={false} style={styles.nameLabel}>{name}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: colors.cardBackground,
		borderColor: colors.border,
		borderWidth: 1,
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		paddingLeft: 24,
		minHeight: 72,
		marginHorizontal: 16,
		marginBottom: 12,
		elevation: 1,
	},
	accentLine: {
		position: 'absolute',
		left: 13,
		top: 12,
		bottom: 12,
		width: 3,
		borderRadius: 999,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 4,
	},
	id: {
		...getTypographyStyle('headline'),
		color: colors.textPrimary,
		marginBottom: 2,
		left: 6,
	},
	typeLabel: {
		...getTypographyStyle('c3Caption'),
		color: colors.textSecondary,
		left: 6,
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 999,
		alignSelf: 'center',
		right: 4,
		top: 8,
	},
	badgeText: {
		...getTypographyStyle('l2List'),
	},
	nameLabel: {
		...getTypographyStyle('c1Caption'),
		color: colors.textSecondary,
		left: 6,
	},
});