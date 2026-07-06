import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
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
import ProfileHeader from '@/_components/admin/ProfileHeader';
import SectionLabel from '@/_components/common/SectionLabel';
import GroupedCard from '@/_components/common/GroupedCard';
import SettingsRow from '@/_components/common/SettingsRow';
import ToggleRow from '@/_components/common/ToggleRow';
import Divider from '@/_components/common/Divider';
import SignOutButton from '@/_components/common/SignOutButton';
import { colors } from '@/constants/colors';

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
  return (
    <SafeAreaView style={styles.safeArea} edges={['left', 'right']}>
      <StatusBar style="light" translucent backgroundColor="#2D72D1" />
      <ProfileHeader initials={initials} name={name} role={role} organization={organization} />

      <ScrollView contentContainerStyle={styles.content}>
        <SectionLabel label="Account" />
        <GroupedCard>
          <SettingsRow icon={User} title="Edit Profile" onPress={onEditProfilePress} />
          <Divider />
          <SettingsRow icon={Lock} title="Change Password" onPress={onChangePasswordPress} />
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
            title="Notifications"
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
          <Divider />
          <ToggleRow
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
    backgroundColor: 'transparent',
  },
  content: {
    padding: 16,
  },
  signOutSpacing: {
    marginTop: 4,
  },
});

export default ProfileScreen;
