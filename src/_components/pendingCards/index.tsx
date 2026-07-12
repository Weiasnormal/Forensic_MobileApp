import { CheckCircle2, ChevronRight, FileText, LucideIcon, RefreshCw } from 'lucide-react-native';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type PendingCardStatus = 'result-ready' | 'draft' | 'processing';

interface PendingCardProps {
	caseCode: string;
	name: string;
	type: string;
	status: PendingCardStatus;
	onPress?: () => void;
}

const statusStyles: Record<
	PendingCardStatus,
	{ icon: LucideIcon; statusText: string; statusColor: string; bgColor: string; iconBgColor: string }
> = {
	'result-ready': {
		icon: CheckCircle2,
		statusText: 'RESULT READY',
		statusColor: colors.statusGenuine,
		bgColor: colors.background2,
		iconBgColor: colors.statusGenuineBg,
	},
	draft: {
		icon: FileText,
		statusText: 'DRAFT',
		statusColor: colors.statusDraft,
		bgColor: colors.background2,
		iconBgColor: colors.statusDraftBg,
	},
	processing: {
		icon: RefreshCw,
		statusText: 'PROCESSING',
		statusColor: colors.statusProcessing,
		bgColor: colors.background2,
		iconBgColor: colors.statusProcessingBg,
	},
};

export default function PendingCard({ caseCode, name, type, status, onPress }: PendingCardProps) {
	const style = statusStyles[status];
	const Icon = style.icon;

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: style.bgColor }]}
			activeOpacity={0.75}
			onPress={onPress}
		>
			<View style={[styles.iconContainer, { backgroundColor: style.iconBgColor }]}>
				<Icon size={22} color={style.statusColor} />
			</View>

			<View style={styles.content}>
				<Text allowFontScaling={false} style={[styles.statusText, { color: style.statusColor }]}>
					{style.statusText}
				</Text>
				<Text allowFontScaling={false} style={styles.id}>{caseCode}</Text>
				<Text allowFontScaling={false} style={styles.nameType}>
					{name} {type ? `• ${type}` : ''}
				</Text>
			</View>

			<View style={styles.chevron}>
				<ChevronRight size={22} color={colors.textMuted} />
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		marginHorizontal: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	iconContainer: {
		width: 48,
		height: 48,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		marginRight: 12,
	},
	content: {
		flex: 1,
	},
	statusText: {
		...getTypographyStyle('c2Caption'),
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	id: {
		...getTypographyStyle('c1Caption', 'bold'),
		color: colors.textPrimary,
		marginBottom: 2,
	},
	nameType: {
		...getTypographyStyle('c1Caption', 'regular'),
		color: colors.textSecondary,
	},
	chevron: {
		padding: 8,
	},
});