import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Home, ClipboardList, BarChart3, User, Plus, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type TabKey = 'home' | 'cases' | 'stats' | 'profile';

interface NavbarProps {
	activeTab: TabKey;
	onTabChange: (tab: TabKey) => void;
	onNewPress: () => void;
}

interface TabDefinition {
	key: TabKey;
	label: string;
	icon: LucideIcon;
}

const TABS: TabDefinition[] = [
	{ key: 'home', label: 'Home', icon: Home },
	{ key: 'cases', label: 'Cases', icon: ClipboardList },
	{ key: 'stats', label: 'Stats', icon: BarChart3 },
	{ key: 'profile', label: 'Profile', icon: User },
];

export default function Navbar({ activeTab, onTabChange, onNewPress }: NavbarProps) {
	const leftTabs = TABS.slice(0, 2);
	const rightTabs = TABS.slice(2);
	const insets = useSafeAreaInsets();

	const renderTab = ({ key, label, icon: Icon }: TabDefinition) => {
		const active = activeTab === key;
		const tint = active ? colors.primary : colors.textTertiary;

		return (
			<TouchableOpacity
				key={key}
				style={[styles.navItem, active && styles.navItemActive]}
				onPress={() => onTabChange(key)}
				activeOpacity={0.82}
			>
				<Icon size={22} color={tint} />
				<Text allowFontScaling={false} style={[styles.navLabel, { color: tint }]}>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={[styles.bottomNavShell, { paddingBottom: insets.bottom }]}>
			<View style={styles.bottomNav}>
				{leftTabs.map(renderTab)}

				<View style={styles.centerSlot}>
					<TouchableOpacity style={styles.newButton} activeOpacity={0.84} onPress={onNewPress}>
						<Plus size={26} color={colors.primaryText} />
					</TouchableOpacity>
					<Text allowFontScaling={false} style={styles.newLabel}>New</Text>
				</View>

				{rightTabs.map(renderTab)}
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	bottomNavShell: {
		backgroundColor: colors.background2,
	},
	bottomNav: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		backgroundColor: colors.background2,
		borderTopWidth: 1,
		borderTopColor: colors.disabledBorder,
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
		width: 60,
		height: 60,
		borderRadius: 999,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -24,
		borderWidth: 2,
		borderColor: colors.primaryLight,
	},
	newLabel: {
		...getTypographyStyle('c3Caption', 'bold'),
		marginTop: 3,
		color: colors.primary,
	},
	navItemActive: {
		backgroundColor: colors.primaryLight,
	},
	navLabel: {
		...getTypographyStyle('c3Caption', 'bold'),
		marginTop: 3,
	},
});