import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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
	Urgent: '#E24B4A',
	High: '#F59E0B',   
	Medium: '#2a728f', 
	Low: '#2E9F5C',    
};
const statusStyles: Record<CaseStatus, { borderColor: string; badgeColor: string; badgeText: string; badgeBgColor: string }> = {
	Suspected: {
		borderColor: '#E24B4A',
		badgeColor: '#E24B4A',
		badgeText: 'Suspected',
		badgeBgColor: 'rgba(226, 75, 74, 0.1)',
	},
	Genuine: {
		borderColor: '#2E9F5C',
		badgeColor: '#2E9F5C',
		badgeText: 'Genuine',
		badgeBgColor: 'rgba(46, 159, 92, 0.1)',
	},
	Processing: {
		borderColor: '#2D72D1',
		badgeColor: '#2D72D1',
		badgeText: 'Processing',
		badgeBgColor: 'rgba(45, 114, 209, 0.1)',
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
					<Text style={styles.id}>{caseCode}</Text>
					<Text style={styles.typeLabel}>
						{type}
						{priority && (
							<Text style={{ color: priorityColors[priority] || '#8A99AE' }}>
								{''} {priority}
							</Text>
						)}
					</Text>
				</View>
				<View style={[styles.badge, { backgroundColor: style.badgeBgColor }]}>
					<Text style={[styles.badgeText, { color: style.badgeColor }]}>{style.badgeText}</Text>
				</View>
			</View>
			<Text style={styles.nameLabel}>{name}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	card: {
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		paddingHorizontal: 14,
		paddingVertical: 12,
		paddingLeft: 24,
		minHeight: 72,
		marginHorizontal: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.06,
		shadowRadius: 4,
		elevation: 2,
	},
	accentLine: {
		position: 'absolute',
		left: 13,
		top: 12,
		bottom: 12,
		width: 4,
		borderRadius: 999,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 4,
	},
	id: {
		fontSize: 14,
		fontWeight: '800',
		color: '#1F2B3E',
		marginBottom: 2,
        left: 6,
	},
	typeLabel: {
		fontSize: 10,
		color: '#8A99AE',
		fontWeight: '600',
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
		fontSize: 10,
		fontWeight: '700',
	},
	nameLabel: {
		fontSize: 12,
		color: '#8A99AE',
		fontWeight: '500',
        left: 6,
	},
});

