import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function UserProfileScreen() {
	return (
		<SafeAreaView style={styles.screen}>
			<ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
				<Text style={styles.pageTitle}>Profile</Text>
				<Text style={styles.pageSubtitle}>Manage account and app settings</Text>

				<View style={styles.profileHero}>
					<View style={styles.avatarLarge}>
						<Text style={styles.avatarLargeText}>JD</Text>
					</View>
					<Text style={styles.profileName}>Juan Dela Cruz</Text>
					<Text style={styles.profileEmail}>juan.delacruz@pnp.gov.ph</Text>
					<View style={styles.roleChip}>
						<Ionicons name="shield-checkmark" size={12} color="#EAF3FF" />
						<Text style={styles.roleChipText}>Forensic Analyst</Text>
					</View>
				</View>

				<View style={styles.statsRow}>
					<MiniStat value="42" label="Open scans" />
					<MiniStat value="91%" label="Accuracy" />
				</View>

				<View style={styles.settingsCard}>
					<SettingRow icon="person-outline" iconColor="#185FA5" iconBg={styles.settingIconBlue} label="Edit profile" />
					<SettingRow icon="document-text-outline" iconColor="#16A34A" iconBg={styles.settingIconGreen} label="Scan history" />
					<SettingRow icon="notifications-outline" iconColor="#D97706" iconBg={styles.settingIconAmber} label="Notifications" />
					<SettingRow icon="log-out-outline" iconColor="#E24B4A" iconBg={styles.settingIconRed} label="Sign out" last />
				</View>
			</ScrollView>
		</SafeAreaView>
	);
}

function MiniStat({ value, label }: { value: string; label: string }) {
	return (
		<View style={styles.miniStatCard}>
			<Text style={styles.miniStatValue}>{value}</Text>
			<Text style={styles.miniStatLabel}>{label}</Text>
		</View>
	);
}

function SettingRow({
	icon,
	iconColor,
	iconBg,
	label,
	last,
}: {
	icon: keyof typeof Ionicons.glyphMap;
	iconColor: string;
	iconBg: object;
	label: string;
	last?: boolean;
}) {
	return (
		<TouchableOpacity style={[styles.settingRow, last && styles.settingRowLast]} activeOpacity={0.76}>
			<View style={[styles.settingIcon, iconBg]}>
				<Ionicons name={icon} size={18} color={iconColor} />
			</View>
			<Text style={styles.settingLabel}>{label}</Text>
			<Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: '#F8FAFC',
	},
	content: {
		padding: 16,
		paddingBottom: 18,
	},
	pageTitle: {
		color: '#0F172A',
		fontSize: 25,
		fontWeight: '900',
		letterSpacing: -0.6,
		marginTop: 15,
		marginBottom: 2,
		paddingHorizontal: 2,
	},
	pageSubtitle: {
		color: '#64748B',
		fontSize: 12,
		fontWeight: '600',
		marginBottom: 12,
		paddingHorizontal: 2,
	},
	profileHero: {
		backgroundColor: '#0C447C',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 18,
		alignItems: 'center',
		marginBottom: 14,
		borderWidth: 1,
		borderColor: '#2B68A4',
	},
	avatarLarge: {
		width: 72,
		height: 72,
		borderRadius: 36,
		backgroundColor: 'rgba(255,255,255,0.14)',
		borderWidth: 2,
		borderColor: 'rgba(255,255,255,0.22)',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10,
	},
	avatarLargeText: {
		color: '#FFFFFF',
		fontSize: 20,
		fontWeight: '900',
	},
	profileName: {
		color: '#FFFFFF',
		fontSize: 18,
		fontWeight: '900',
		marginBottom: 3,
	},
	profileEmail: {
		color: 'rgba(255,255,255,0.62)',
		fontSize: 12,
		marginBottom: 10,
	},
	roleChip: {
		flexDirection: 'row',
		alignItems: 'center',
		gap: 6,
		backgroundColor: 'rgba(255,255,255,0.12)',
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 999,
	},
	roleChipText: {
		color: '#EAF3FF',
		fontSize: 11,
		fontWeight: '800',
	},
	statsRow: {
		flexDirection: 'row',
		gap: 10,
		marginBottom: 12,
	},
	miniStatCard: {
		flex: 1,
		backgroundColor: '#FFFFFF',
		borderRadius: 16,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		padding: 14,
	},
	miniStatValue: {
		color: '#0F172A',
		fontSize: 17,
		fontWeight: '900',
	},
	miniStatLabel: {
		marginTop: 4,
		color: '#64748B',
		fontSize: 11,
		fontWeight: '600',
	},
	settingsCard: {
		backgroundColor: '#FFFFFF',
		borderRadius: 18,
		borderWidth: 1,
		borderColor: '#D9E3EF',
		overflow: 'hidden',
	},
	settingRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 14,
		paddingVertical: 13,
		borderBottomWidth: 1,
		borderBottomColor: '#E2E8F0',
		gap: 12,
	},
	settingRowLast: {
		borderBottomWidth: 0,
	},
	settingIcon: {
		width: 34,
		height: 34,
		borderRadius: 10,
		alignItems: 'center',
		justifyContent: 'center',
	},
	settingIconBlue: {
		backgroundColor: '#EAF3FF',
	},
	settingIconGreen: {
		backgroundColor: '#F0FDF4',
	},
	settingIconAmber: {
		backgroundColor: '#FFFBEB',
	},
	settingIconRed: {
		backgroundColor: '#FEF2F2',
	},
	settingLabel: {
		flex: 1,
		color: '#0F172A',
		fontSize: 12,
		fontWeight: '700',
	},
});
