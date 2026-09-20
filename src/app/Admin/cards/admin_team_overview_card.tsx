import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface TeamOverviewData {
	id: string;
	firstName: string;
	lastName: string;
	casesHandled: number;
}

interface TeamOverviewCardProps {
	member: TeamOverviewData;
	onPress?: () => void;
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
				<Text allowFontScaling={false} style={styles.avatarText}>
					{getInitials(member.firstName, member.lastName)}
				</Text>
			</View>

			<Text allowFontScaling={false} style={styles.name} numberOfLines={1}>
				{member.firstName} {member.lastName}
			</Text>

			<Text allowFontScaling={false} style={styles.countLine}>
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
		borderBottomColor: colors.dividerLight, // FLAG — was '#EEF2F7', unconfirmed exact match
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colors.badgeBackground, // FLAG — same as other two files, unconfirmed exact match
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		...getTypographyStyle('l1List'), // FLAG — was fontSize:13/fontWeight:'800'
		color: colors.primary,
	},
	name: {
		...getTypographyStyle('headline'), // exact match: 14/bold ≈ original 14/700 — no flag
		color: colors.textPrimary,
		flex: 1,
	},
	countLine: {
		...getTypographyStyle('c1Caption'), // exact match: 13/semiBold ≈ original 13/600 — no flag
		color: colors.textSecondary, // FLAG — was '#64748B', differs from your confirmed textSecondary hex '#667085'
	},
	countValue: {
		...getTypographyStyle('headline'), // FLAG — was fontWeight:'900'; headline is bold(700), no '900' token exists
		color: colors.primary,
	},
});