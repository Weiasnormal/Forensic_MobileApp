import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { User, Lock, Briefcase, Copy, Users, BarChart3, Bell, Upload, Info, FileText, UserX } from 'lucide-react-native';
import SectionLabel from '@/_components/common/SectionLabel';
import GroupedCard from '@/_components/common/GroupedCard';
import SettingsRow from '@/_components/common/SettingsRow';
import ToggleRow from '@/_components/common/ToggleRow';
import Divider from '@/_components/common/Divider';
import SignOutButton from '@/_components/common/SignOutButton';
import Avatar from '@/_components/common/Avatar';
import LogoutModal from '@/_components/modals/logout';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import DangerRow from '@/_components/admin/DangerRow';
import DeleteAccountModal from '@/_components/modals/delete_account';
import { router } from 'expo-router';
import ErrorModal from '@/_components/modals/error_modal';

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
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  
  const [showDeleteAccountModal, setShowDeleteAccountModal] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  return (
      <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
        <ScreenStatusBar variant="onBrand" />
        <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
          <View style={styles.headerGlow} />
          <Avatar initials={initials} size={64} variant="onDark" />
          <View style={styles.headerCopy}>
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.subtitle} numberOfLines={1} ellipsizeMode="tail">
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

        <SignOutButton
          style={styles.signOutSpacing}
          onPress={() => setLogoutModalVisible(true)}
        />

        <LogoutModal
          visible={logoutModalVisible}
          onCancel={() => setLogoutModalVisible(false)}
          onLogout={() => {
            setLogoutModalVisible(false);
            onSignOutPress?.();
          }}
        />
        <Divider />
          <DangerRow
            icon={UserX}
            title="Delete Account"
            subtitle="Permanently remove your login access"
            onPress={() => setShowDeleteAccountModal(true)}
          />
          <DeleteAccountModal
            visible={showDeleteAccountModal}
            isDeleting={isDeletingAccount}
            onCancel={() => setShowDeleteAccountModal(false)}
            onConfirm={async () => {
            setIsDeletingAccount(true);
            try {
              setShowDeleteAccountModal(false);
              router.replace('/_login/SignInPage');
            } catch (e) {
              setDeleteError(true);
            } finally {
              setIsDeletingAccount(false);
            }
            }}/>
          <ErrorModal
            visible={deleteError}
            title="Error"
            message="Unable to delete account. Please try again."
            onPrimaryPress={() => setDeleteError(false)}
          />
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
