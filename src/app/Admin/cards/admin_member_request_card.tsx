import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

// Deliberately its own minimal shape rather than importing MockMemberRequest
// or TeamMember directly — any caller (mock data today, real /admin/team
// data tomorrow) just needs to map into this before rendering.
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
				<Text style={styles.avatarText}>{getInitials(request.firstName, request.lastName)}</Text>
			</View>

			<View style={styles.info}>
				<Text style={styles.name}>{request.firstName} {request.lastName}</Text>
				<Text style={styles.timeAgo}>{request.timeAgo}</Text>
			</View>

			<View style={styles.actions}>
				<TouchableOpacity
					style={[styles.iconButton, styles.iconButtonAccept]}
					onPress={() => onApprove(request.id)}
					activeOpacity={0.8}
				>
					<Ionicons name="checkmark" size={18} color="#16A34A" />
				</TouchableOpacity>
				<TouchableOpacity
					style={[styles.iconButton, styles.iconButtonReject]}
					onPress={() => onReject(request.id)}
					activeOpacity={0.8}
				>
					<Ionicons name="close" size={18} color="#EF4444" />
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
		backgroundColor: '#FFFFFF',
		borderRadius: 14,
		borderWidth: 1,
		borderColor: '#E3EAF3',
		padding: 12,
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
	info: {
		flex: 1,
	},
	name: {
		color: '#0F172A',
		fontSize: 13,
		fontWeight: '800',
	},
	timeAgo: {
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '600',
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
		backgroundColor: '#ECFDF3',
	},
	iconButtonReject: {
		backgroundColor: '#FEF1F1',
	},
});