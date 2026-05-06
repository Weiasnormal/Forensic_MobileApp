import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type CaseStatus = 'suspect' | 'genuine' | 'processing';

interface CaseCardProps {
	id: string;
	type: string;
	name: string;
	status: CaseStatus;
	onPress?: () => void;
}

const statusStyles: Record<CaseStatus, { borderColor: string; badgeColor: string; badgeText: string; badgeBgColor: string }> = {
	suspect: {
		borderColor: '#E24B4A',
		badgeColor: '#E24B4A',
		badgeText: 'Suspect',
		badgeBgColor: 'rgba(226, 75, 74, 0.1)',
	},
	genuine: {
		borderColor: '#2E9F5C',
		badgeColor: '#2E9F5C',
		badgeText: 'Genuine',
		badgeBgColor: 'rgba(46, 159, 92, 0.1)',
	},
	processing: {
		borderColor: '#2D72D1',
		badgeColor: '#2D72D1',
		badgeText: 'Processing',
		badgeBgColor: 'rgba(45, 114, 209, 0.1)',
	},
};

export default function CaseCard({ id, type, name, status, onPress }: CaseCardProps) {
	const style = statusStyles[status];

	return (
		<TouchableOpacity
			style={[styles.card, { borderLeftColor: style.borderColor }]}
			activeOpacity={0.75}
			onPress={onPress}
		>
			<View style={styles.header}>
				<View style={{ flex: 1 }}>
					<Text style={styles.id}>{id}</Text>
					<Text style={styles.typeLabel}>{type}</Text>
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
		borderLeftWidth: 6,
		paddingHorizontal: 16,
		paddingVertical: 14,
		marginHorizontal: 16,
		marginBottom: 12,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.08,
		shadowRadius: 8,
		elevation: 3,
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'flex-start',
		marginBottom: 8,
	},
	id: {
		fontSize: 16,
		fontWeight: '800',
		color: '#1F2B3E',
		marginBottom: 4,
	},
	typeLabel: {
		fontSize: 12,
		color: '#8A99AE',
		fontWeight: '600',
	},
	badge: {
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 8,
	},
	badgeText: {
		fontSize: 12,
		fontWeight: '700',
	},
	nameLabel: {
		fontSize: 13,
		color: '#8A99AE',
		fontWeight: '500',
	},
});
