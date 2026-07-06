import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Home, ClipboardList, Users, BarChart3, User, LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../../constants/colors';
import { getTypographyStyle } from '../../constants/typography';

export type AdminTabKey = 'home' | 'cases' | 'team' | 'stats' | 'profile';

interface TabDefinition {
  key: AdminTabKey;
  label: string;
  icon: LucideIcon;
}

const TABS: TabDefinition[] = [
  { key: 'home', label: 'Home', icon: Home },
  { key: 'cases', label: 'Cases', icon: ClipboardList },
  { key: 'team', label: 'Team', icon: Users },
  { key: 'stats', label: 'Stats', icon: BarChart3 },
  { key: 'profile', label: 'Profile', icon: User },
];

interface AdminNavbarProps {
  activeTab: AdminTabKey;
  onTabChange: (tab: AdminTabKey) => void;
}

/**
 * Shared bottom navigation bar for the admin section.
 * Rendered ONCE by AdminDashboard, outside the per-tab content switch --
 * individual tab screens (home, cases, team, stats, profile) should NOT
 * render their own copy of this component.
 */
const AdminNavbar: React.FC<AdminNavbarProps> = ({ activeTab, onTabChange }) => {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + 25 }]}>
      {TABS.map(({ key, label, icon: Icon }) => {
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
              <Icon size={24} color={tint}/>
            </View>
            <Text style={[styles.label, { color: tint }]}>{label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

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
});

export default AdminNavbar;
