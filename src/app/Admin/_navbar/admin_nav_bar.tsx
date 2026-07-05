import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type AdminTabKey = 'home' | 'cases' | 'team' | 'stats' | 'profile';

interface AdminNavbarProps {
	activeTab: AdminTabKey;
	onTabChange: (tab: AdminTabKey) => void;
}

const tabs: Array<{
	key: AdminTabKey;
	label: string;
	activeIcon: keyof typeof Ionicons.glyphMap;
	inactiveIcon: keyof typeof Ionicons.glyphMap;
}> = [
	{ key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
	{ key: 'cases', label: 'Cases', activeIcon: 'folder-open', inactiveIcon: 'folder-open-outline' },
	{ key: 'team', label: 'Team', activeIcon: 'people', inactiveIcon: 'people-outline' },
	{ key: 'stats', label: 'Stats', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
	{ key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

export default function AdminNavbar({ activeTab, onTabChange }: AdminNavbarProps) {
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.bottomNavShell, { paddingBottom: insets.bottom }]}>
			<View style={styles.bottomNav}>
				{tabs.map((tab) => {
					const active = activeTab === tab.key;

					return (
						<TouchableOpacity
							key={tab.key}
							style={[styles.navItem, active && styles.navItemActive]}
							onPress={() => onTabChange(tab.key)}
							activeOpacity={0.82}
						>
							<Ionicons name={active ? tab.activeIcon : tab.inactiveIcon} size={21} color={active ? '#185FA5' : '#94A3B8'} />
							<Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	bottomNavShell: {
		backgroundColor: '#FFFFFF',
	},
	bottomNav: {
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#E2E8F0',
		paddingTop: 8,
		paddingBottom: 10,
		paddingHorizontal: 6,
	},
	navItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 6,
		borderRadius: 14,
	},
	navItemActive: {
		backgroundColor: '#EAF3FF',
	},
	navLabel: {
		marginTop: 3,
		fontSize: 10,
		color: '#94A3B8',
		fontWeight: '700',
	},
	navLabelActive: {
		color: '#1E6FD9',
	},
});
