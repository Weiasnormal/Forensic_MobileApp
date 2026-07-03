import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PendingCardStatus = 'result-ready' | 'draft' | 'processing';

interface PendingCardProps {
	caseCode: string;
	name: string;
	
	status: PendingCardStatus;
	onPress?: () => void;
}

const statusStyles: Record<
	PendingCardStatus,
	{ iconName: keyof typeof Ionicons.glyphMap; statusText: string; statusColor: string; bgColor: string; iconBgColor: string }
> = {
	'result-ready': {
		iconName: 'checkmark-done-outline',
		statusText: 'RESULT READY',
		statusColor: '#2E9F5C',
		bgColor: '#ffffff',
		iconBgColor: '#F1FAF4',
	},
	draft: {
		iconName: 'document-outline',
		statusText: 'DRAFT',
		statusColor: '#94A3B8',
		bgColor: '#ffffff',
		iconBgColor: '#EFEFEF',
	},
	processing: {
		iconName: 'sync-outline',
		statusText: 'PROCESSING',
		statusColor: '#2D72D1',
		bgColor: '#ffffff',
		iconBgColor: '#EBF3FF',
	},
};

export default function PendingCard({ caseCode, name, status, onPress }: PendingCardProps) {
	const style = statusStyles[status];

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: style.bgColor }]}
			activeOpacity={0.75}
			onPress={onPress}
		>
			<View style={[styles.iconContainer, { backgroundColor: style.iconBgColor }]}>
				<Ionicons name={style.iconName} size={24} color={style.statusColor} />
			</View>

			<View style={styles.content}>
				<Text style={[styles.statusText, { color: style.statusColor }]}>{style.statusText}</Text>
				<Text style={styles.id}>{caseCode}</Text>
				<Text style={styles.name}>{name}</Text>
			</View>

			<View style={styles.chevron}>
				<Text style={styles.chevronIcon}>›</Text>
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
		fontSize: 10,
		fontWeight: '700',
		letterSpacing: 0.5,
		marginBottom: 2,
	},
	id: {
		fontSize: 14,
		fontWeight: '800',
		color: '#1F2B3E',
		marginBottom: 2,
	},
	name: {
		fontSize: 12,
		color: '#8A99AE',
		fontWeight: '500',
	},
	chevron: {
		padding: 8,
	},
	chevronIcon: {
		fontSize: 24,
		color: '#64748B',
		fontWeight: '300',
	},
});
