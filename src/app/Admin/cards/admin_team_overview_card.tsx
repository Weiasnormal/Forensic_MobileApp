import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Kept deliberately minimal so this can be reused anywhere a "person + case
// count" row is needed (Team Management's roster, Stats' leaderboard, etc.)
// — pass any object that has these four fields.
export interface TeamOverviewData {
	id: string;
	firstName: string;
	lastName: string;
	casesHandled: number;
}

interface TeamOverviewCardProps {
	member: TeamOverviewData;
	onPress?: () => void;
	/** Set false on the last row of a list to omit the divider line. */
	showDivider?: boolean;
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

export default function TeamOverviewCard({ member, onPress, showDivider = true }: TeamOverviewCardProps) {
	return (
		<TouchableOpacity
			style={[styles.row, showDivider && styles.rowDivider]}
			activeOpacity={onPress ? 0.75 : 1}
			onPress={onPress}
			disabled={!onPress}
		>
			<View style={styles.avatar}>
				<Text style={styles.avatarText}>{getInitials(member.firstName, member.lastName)}</Text>
			</View>

			<Text style={styles.name} numberOfLines={1}>
				{member.firstName} {member.lastName}
			</Text>

			<Text style={styles.countLine}>
				<Text style={styles.countValue}>{member.casesHandled}</Text> cases
			</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 12,
		paddingVertical: 12,
		paddingHorizontal: 14,
	},
	rowDivider: {
		borderBottomWidth: 1,
		borderBottomColor: '#EEF2F7',
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: '#EAF3FF',
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		color: '#1E6FD9',
		fontWeight: '800',
		fontSize: 13,
	},
	name: {
		flex: 1,
		color: '#0F172A',
		fontSize: 14,
		fontWeight: '700',
	},
	countLine: {
		color: '#64748B',
		fontSize: 13,
		fontWeight: '600',
	},
	countValue: {
		color: '#1E6FD9',
		fontWeight: '900',
		fontSize: 14,
	},
});