import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import type { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface AdminStatCardData {
	label: string;
	value: string;
	icon: LucideIcon;
	tint?: string;
	subtext?: string;
	subtextColor?: string;
}

export default function AdminStatCard({
	label,
	value,
	icon: Icon,
	tint = colors.primary,
	subtext,
	subtextColor = colors.label,
}: AdminStatCardData) {
	return (
		<View style={styles.card}>
			<View style={[styles.iconWrap, { backgroundColor: `${tint}1A` }]}>
				<Icon size={18} color={tint} />
			</View>

			<View style={styles.textGroup}>
				<Text allowFontScaling={false} style={styles.value}>
					{value}
				</Text>

				<Text allowFontScaling={false} style={styles.label}>
					{label}
				</Text>

				{subtext ? (
					<Text allowFontScaling={false} style={[styles.subtext, { color: subtextColor }]}>
						{subtext}
					</Text>
				) : null}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	card: {
		flex: 1,
		aspectRatio: 1,
		gap: 12,
		paddingVertical: 12,
		paddingHorizontal: 14,
		backgroundColor: colors.cardBackground,
		borderRadius: 16,
		borderWidth: 1,
		borderColor: colors.cardBorderMuted,
	},
	iconWrap: {
		width: 45,
		height: 45,
		borderRadius: 11,
		alignItems: 'center',
		justifyContent: 'center',
	},
	textGroup: {
		gap: 4,
	},
	value: {
		...getTypographyStyle('t2Title'),
		color: colors.statsTextDeep,
		letterSpacing: -0.5,
	},
	label: {
		...getTypographyStyle('l2List'),
		color: colors.label,
	},
	subtext: {
		...getTypographyStyle('c3Caption', 'bold'),
	},
});