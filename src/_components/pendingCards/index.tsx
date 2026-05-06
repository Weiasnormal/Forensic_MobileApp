import { Image } from 'expo-image';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type PendingCardStatus = 'result-ready' | 'draft' | 'processing';

interface PendingCardProps {
	id: string;
	name: string;
	status: PendingCardStatus;
	onPress?: () => void;
}

const statusStyles: Record<PendingCardStatus, { icon: number; statusText: string; statusColor: string; bgColor: string; iconBgColor: string }> = {
	'result-ready': {
		icon: require('../../../../assets/expo.icon/Assets/pendingCards/resultready.webp') as number,
		statusText: 'RESULT READY',
		statusColor: '#2E9F5C',
		bgColor: '#F0F9F6',
		iconBgColor: 'rgba(46, 159, 92, 0.1)',
	},
	draft: {
		icon: require('../../../../assets/expo.icon/Assets/pendingCards/draft.webp') as number,
		statusText: 'DRAFT',
		statusColor: '#94A3B8',
		bgColor: '#F8F9FA',
		iconBgColor: 'rgba(148, 163, 184, 0.1)',
	},
	processing: {
		icon: require('../../../../assets/expo.icon/Assets/pendingCards/processing.webp') as number,
		statusText: 'PROCESSING',
		statusColor: '#2D72D1',
		bgColor: '#F0F6FF',
		iconBgColor: 'rgba(45, 114, 209, 0.1)',
	},
};

export default function PendingCard({ id, name, status, onPress }: PendingCardProps) {
	const style = statusStyles[status];

	return (
		<TouchableOpacity
			style={[styles.card, { backgroundColor: style.bgColor }]}
			activeOpacity={0.75}
			onPress={onPress}
		>
			<View style={[styles.iconContainer, { backgroundColor: style.iconBgColor }]}>
				<Image
					source={style.icon}
					style={styles.icon}
					contentFit="contain"
				/>
			</View>

			<View style={styles.content}>
				<Text style={[styles.statusText, { color: style.statusColor }]}>{style.statusText}</Text>
				<Text style={styles.id}>{id}</Text>
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
	icon: {
		width: 24,
		height: 24,
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
		color: '#2D72D1',
		fontWeight: '300',
	},
});
