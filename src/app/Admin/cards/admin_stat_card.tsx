import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface AdminStatCardData {
	label: string;
	value: string;
	icon: keyof typeof Ionicons.glyphMap;
	tint?: string;
	subtext?: string;
	subtextColor?: string;
}

export default function AdminStatCard({
	label,
	value,
	icon,
	tint = '#1E6FD9',
	subtext,
	subtextColor = '#94A3B8',
}: AdminStatCardData) {
	return (
		<View style={styles.card}>
			<View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
				<Ionicons name={icon} size={18} color={tint} />
			</View>
			<Text style={styles.value}>{value}</Text>
			<Text style={styles.label}>{label}</Text>
			{subtext ? <Text style={[styles.subtext, { color: subtextColor }]}>{subtext}</Text> : null}
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#DDE6F2',
		padding: 14,
        width: 145,
        height: 155,
	},
	iconWrap: {
		width: 45,
		height: 45,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	value: {
		color: '#111827',
		fontSize: 22,
		fontWeight: '900',
		letterSpacing: -0.5,
	},
	label: {
		marginTop: 2,
		color: '#94A3B8',
		fontSize: 11,
		fontWeight: '700',
	},
	subtext: {
		marginTop: 4,
		fontSize: 10,
		fontWeight: '700',
	},
});