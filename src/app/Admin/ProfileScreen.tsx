import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  User,
  Lock,
  Briefcase,
  Copy,
  Users,
  BarChart3,
  Bell,
  Upload,
  Info,
  FileText,
} from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';
import SectionLabel from '@/_components/common/SectionLabel';
import GroupedCard from '@/_components/common/GroupedCard';
import SettingsRow from '@/_components/common/SettingsRow';
import ToggleRow from '@/_components/common/ToggleRow';
import Divider from '@/_components/common/Divider';
import SignOutButton from '@/_components/common/SignOutButton';
import Avatar from '@/_components/common/Avatar';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NOTE: This screen intentionally does NOT render a bottom nav bar.
// AdminDashboard renders <AdminNavbar /> once, outside the per-tab content
// switch, shared across all 5 tabs -- rendering one here too would duplicate it.

interface ProfileScreenProps {
  initials: string;
  name: string;
  role: string;
  organization: string;
  appVersion: string;
  notificationsEnabled: boolean;
  autoExportEnabled: boolean;
  onEditProfilePress?: () => void;
  onChangePasswordPress?: () => void;
  onOrganizationPress?: () => void;
  onOrgInviteCodePress?: () => void;
  onManageTeamPress?: () => void;
  onOrganizationStatsPress?: () => void;
  onToggleNotifications?: (value: boolean) => void;
  onToggleAutoExport?: (value: boolean) => void;
  onHelpSupportPress?: () => void;
  onSignOutPress?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  initials,
  name,
  role,
  organization,
  appVersion,
  notificationsEnabled,
  autoExportEnabled,
  onEditProfilePress,
  onChangePasswordPress,
  onOrganizationPress,
  onOrgInviteCodePress,
  onManageTeamPress,
  onOrganizationStatsPress,
  onToggleNotifications,
  onToggleAutoExport,
  onHelpSupportPress,
  onSignOutPress,
}) => {
  const insets = useSafeAreaInsets();

  return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <View style={styles.headerGlow} />
          <Avatar initials={initials} size={64} variant="onDark" />
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle}>
              {role} • {organization}
            </Text>
          </View>
        </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
        <SectionLabel label="Account" />
        <GroupedCard>
          <SettingsRow 
            icon={User} 
            title="Edit Profile" 
            onPress={onEditProfilePress} />
          <Divider />
          <SettingsRow 
            icon={Lock} 
            title="Change Password" 
            onPress={onChangePasswordPress} />
          <Divider />
          <SettingsRow
            icon={Briefcase}
            title="Organization"
            rightText={organization}
            onPress={onOrganizationPress}
          />
        </GroupedCard>

        <SectionLabel label="Workspace" />
        <GroupedCard>
          <SettingsRow icon={Copy} title="Org Invite Code" onPress={onOrgInviteCodePress} />
          <Divider />
          <SettingsRow icon={Users} title="Manage Team & Approvals" onPress={onManageTeamPress} />
          <Divider />
          <SettingsRow
            icon={BarChart3}
            title="Organization Statistics"
            onPress={onOrganizationStatsPress}
          />
        </GroupedCard>

        <SectionLabel label="Preferences" />
        <GroupedCard>
          <ToggleRow
            icon={Bell}
            title="Notifications"
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
          <Divider />
          <ToggleRow
            icon={Upload}
            title="Auto-Export Reports"
            value={autoExportEnabled}
            onValueChange={onToggleAutoExport}
          />
        </GroupedCard>

        <SectionLabel label="About" />
        <GroupedCard>
          <SettingsRow icon={Info} title="Help & Support" onPress={onHelpSupportPress} />
          <Divider />
          <SettingsRow icon={FileText} title="App Version" rightText={appVersion} showChevron={false} />
        </GroupedCard>

        <SignOutButton onPress={onSignOutPress} style={styles.signOutSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingBottom: 35,
  },
  headerGlow: {
    position: 'absolute',
    right: -100,
    bottom: -170,
    width: 232,
    height: 232,
    borderRadius: 116,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerCopy: {
    marginLeft: 18,
    flex: 1,
  },
  name: {
    ...getTypographyStyle('t1Title', 'bold'),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption'),
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  signOutSpacing: {
    marginTop: 4,
  },
  scrollArea: {
		paddingHorizontal: 16,
		paddingTop: 25,
		paddingBottom: 18,
		backgroundColor: colors.background,
	},
});

export default ProfileScreen;
