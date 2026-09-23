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
	caseLimitReached: boolean;
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

export default function Navbar({ activeTab, onTabChange, onNewPress, caseLimitReached }: NavbarProps) {
	const leftTabs = TABS.slice(0, 2);
	const rightTabs = TABS.slice(2);
	const insets = useSafeAreaInsets();

	const renderTab = ({ key, label, icon: Icon }: TabDefinition) => {
		const isActive = key === activeTab;
		const tint = isActive ? colors.primary : colors.textTertiary;

		return (
			<TouchableOpacity
				key={key}
				style={styles.tab}
				onPress={() => onTabChange(key)}
				activeOpacity={0.7}
			>
				<View style={isActive ? styles.activeIconPill : styles.inactiveIconWrap}>
					<Icon size={24} color={tint} />
				</View>
				<Text allowFontScaling={false} style={[styles.label, { color: tint }]}>
					{label}
				</Text>
			</TouchableOpacity>
		);
	};

	return (
		<View style={[styles.container, { paddingBottom: insets.bottom + 15 }]}>
			{leftTabs.map(renderTab)}

			<View style={styles.centerSlot}>
				<TouchableOpacity
					style={[
						styles.newButton,
						caseLimitReached && styles.disabledNewButton,
					]}
					activeOpacity={0.84}
					onPress={onNewPress}
				>
					<Plus size={26} color={colors.primaryText} />
				</TouchableOpacity>

				<Text
					allowFontScaling={false}
					style={[styles.label, { color: colors.primary }]}
				>
					New
				</Text>
			</View>

			{rightTabs.map(renderTab)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: colors.border,
		paddingTop: 20,
		backgroundColor: colors.background2,
	},
	tab: {
		flex: 1,
		alignItems: 'center',
	},
	activeIconPill: {
		minWidth: 52,
		height: 30,
		paddingHorizontal: 18,
		borderRadius: 99,
		backgroundColor: colors.background,
		alignItems: 'center',
		justifyContent: 'center',
	},
	inactiveIconWrap: {
		height: 30,
		alignItems: 'center',
		justifyContent: 'center',
	},
	label: {
		...getTypographyStyle('c2Caption'),
		marginTop: 4,
	},
	centerSlot: {
		flex: 1,
		alignItems: 'center',
	},
	newButton: {
		width: 56,
		height: 56,
		borderRadius: 999,
		backgroundColor: colors.primary,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: -26,
		borderWidth: 2,
		borderColor: colors.primaryLight,
	},
	disabledNewButton: {
		opacity: 0.55,
	},
});