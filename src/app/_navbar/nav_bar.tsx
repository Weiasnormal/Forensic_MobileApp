import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export type TabKey = 'home' | 'cases' | 'stats' | 'profile';

interface NavbarProps {
	activeTab: TabKey;
	onTabChange: (tab: TabKey) => void;
	onNewPress: () => void;
}

const tabs: Array<{
	key: TabKey;
	label: string;
	activeIcon: keyof typeof Ionicons.glyphMap;
	inactiveIcon: keyof typeof Ionicons.glyphMap;
}> = [
	{ key: 'home', label: 'Home', activeIcon: 'home', inactiveIcon: 'home-outline' },
	{ key: 'cases', label: 'Cases', activeIcon: 'folder-open', inactiveIcon: 'folder-open-outline' },
	{ key: 'stats', label: 'Stats', activeIcon: 'bar-chart', inactiveIcon: 'bar-chart-outline' },
	{ key: 'profile', label: 'Profile', activeIcon: 'person', inactiveIcon: 'person-outline' },
];

export default function Navbar({ activeTab, onTabChange, onNewPress }: NavbarProps) {
	const leftTabs = tabs.slice(0, 2);
	const rightTabs = tabs.slice(2);
	const insets = useSafeAreaInsets();

	return (
		<View style={[styles.bottomNavShell, { paddingBottom: insets.bottom }]}>
			<View style={styles.bottomNav}>
				{leftTabs.map((tab) => {
				const active = activeTab === tab.key;

				return (
					<TouchableOpacity
						key={tab.key}
						style={[styles.navItem, active && styles.navItemActive]}
						onPress={() => onTabChange(tab.key)}
						activeOpacity={0.82}
					>
						<Ionicons name={active ? tab.activeIcon : tab.inactiveIcon} size={22} color={active ? '#185FA5' : '#94A3B8'} />
						<Text style={[styles.navLabel, active && styles.navLabelActive]}>{tab.label}</Text>
					</TouchableOpacity>
				);
			})}

				<View style={styles.centerSlot}>
					<TouchableOpacity style={styles.newButton} activeOpacity={0.84} onPress={onNewPress}>
						<Ionicons name="add" size={26} color="#FFFFFF" />
					</TouchableOpacity>
					<Text style={styles.newLabel}>New</Text>
				</View>

				{rightTabs.map((tab) => {
				const active = activeTab === tab.key;

				return (
					<TouchableOpacity
						key={tab.key}
						style={[styles.navItem, active && styles.navItemActive]}
						onPress={() => onTabChange(tab.key)}
						activeOpacity={0.82}
					>
						<Ionicons name={active ? tab.activeIcon : tab.inactiveIcon} size={22} color={active ? '#185FA5' : '#94A3B8'} />
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
		alignItems: 'flex-end',
		backgroundColor: '#FFFFFF',
		borderTopWidth: 1,
		borderTopColor: '#E2E8F0',
		paddingTop: 8,
		paddingBottom: 12,
		paddingHorizontal: 8,
	},
	navItem: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 6,
		borderRadius: 14,
	},
	centerSlot: {
		flex: 1,
		alignItems: 'center',
	},
	newButton: {
		width: 50,
		height: 50,
		borderRadius: 25,
		backgroundColor: '#2D72D1',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -24,
		borderWidth: 2,
		borderColor: '#EAF3FF',
	},
	newLabel: {
		marginTop: 3,
		fontSize: 10,
		color: '#2D72D1',
		fontWeight: '700',
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
		color: '#2D72D1',
	},
});
