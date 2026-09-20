import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export interface MemberRequestData {
	id: string;
	firstName: string;
	lastName: string;
	timeAgo: string;
}

function getInitials(first = '', last = '') {
	return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

interface MemberRequestCardProps {
	request: MemberRequestData;
	onApprove: (id: string) => void;
	onReject: (id: string) => void;
}

export default function MemberRequestCard({ request, onApprove, onReject }: MemberRequestCardProps) {
	return (
		<View style={styles.row}>
			<View style={styles.avatar}>
				<Text allowFontScaling={false} style={styles.avatarText}>
					{getInitials(request.firstName, request.lastName)}
				</Text>
			</View>

			<View style={styles.info}>
				<Text allowFontScaling={false} style={styles.name}>
					{request.firstName} {request.lastName}
				</Text>
				<Text allowFontScaling={false} style={styles.timeAgo}>
					{request.timeAgo}
				</Text>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity
					style={[styles.iconButton, styles.iconButtonAccept]}
					onPress={() => onApprove(request.id)}
					activeOpacity={0.8}
				>
					<Ionicons name="checkmark" size={18} color={colors.labelsuccess} />
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.iconButton, styles.iconButtonReject]}
					onPress={() => onReject(request.id)}
					activeOpacity={0.8}
				>
					<Ionicons name="close" size={18} color={colors.danger} />
				</TouchableOpacity>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 10,
		backgroundColor: colors.cardBackground,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.cardBorderMuted, // FLAG — was '#E3EAF3', unconfirmed exact match
		paddingHorizontal: 14,
		paddingVertical: 12,
	},
	avatar: {
		width: 38,
		height: 38,
		borderRadius: 19,
		backgroundColor: colors.badgeBackground, // FLAG — was '#EAF3FF', unconfirmed exact match
		alignItems: 'center',
		justifyContent: 'center',
	},
	avatarText: {
		...getTypographyStyle('l1List'), // FLAG — was fontSize:13, fontWeight:'800' (no '800' token exists; using bold)
		color: colors.primary,
	},
	info: {
		flex: 1,
	},
	name: {
		...getTypographyStyle('l1List'), // FLAG — same '800'→bold note as above
		color: colors.textPrimary,
	},
	timeAgo: {
		...getTypographyStyle('c2Caption'),
		color: colors.textTertiary, // FLAG — was '#94A3B8', unconfirmed exact match
		marginTop: 1,
	},
	actions: {
		flexDirection: 'row',
		gap: 8,
	},
	iconButton: {
		width: 34,
		height: 34,
		borderRadius: 17,
		alignItems: 'center',
		justifyContent: 'center',
	},
	iconButtonAccept: {
		backgroundColor: colors.successBg, // FLAG — was '#ECFDF3', unconfirmed exact match
	},
	iconButtonReject: {
		backgroundColor: colors.dangerBgAlt, // FLAG — was '#FEF1F1', unconfirmed exact match (dangerLight is the alt candidate)
	},
});