import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  User,
  Lock,
  Briefcase,
  Copy,
  Users,
  BarChart3,
  Bell,
  Info,
  FileText,
} from 'lucide-react-native';
import SectionLabel from '@/_components/common/SectionLabel';
import GroupedCard from '@/_components/common/GroupedCard';
import SettingsRow from '@/_components/common/SettingsRow';
import ToggleRow from '@/_components/common/ToggleRow';
import Divider from '@/_components/common/Divider';
import SignOutButton from '@/_components/common/SignOutButton';
import TertiaryButton from '@/_components/common/TertiaryButton';
import Avatar from '@/_components/common/Avatar';
import { ScreenStatusBar } from '@/_components/common/ScreenStatusBar';
import LogoutModal from '@/_components/modals/logout';
import DeleteAccountModal from '@/_components/modals/delete_account';
import TypeToConfirmModal from '@/_components/modals/type_to_confirm';
import ErrorModal from '@/_components/modals/error_modal';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAuthStore } from '@/store/authStore';
import { getCaseSummary, useCaseStore } from '@/store/caseStore';
import { getTeamSummary, useAdminStore } from '@/store/adminStore';
import { useFeedbackStore } from '@/store/feedbackStore';

type DeleteStep = 'closed' | 'confirm' | 'type';

interface ProfileScreenProps {
  initials: string;
  avatarUri?: string | null;
  name: string;
  role: string;
  organization: string;
  appVersion: string;
  notificationsEnabled: boolean;
  onEditProfilePress?: () => void;
  onChangePasswordPress?: () => void;
  onOrganizationPress?: () => void;
  onOrgInviteCodePress?: () => void;
  onManageTeamPress?: () => void;
  onOrganizationStatsPress?: () => void;
  onToggleNotifications?: (value: boolean) => void;
  onHelpSupportPress?: () => void;
  onSignOutPress?: () => void;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({
  initials,
  avatarUri,
  name,
  role,
  organization,
  appVersion,
  notificationsEnabled,
  onEditProfilePress,
  onChangePasswordPress,
  onOrganizationPress,
  onOrgInviteCodePress,
  onManageTeamPress,
  onOrganizationStatsPress,
  onToggleNotifications,
  onHelpSupportPress,
  onSignOutPress,
}) => {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const cases = useCaseStore((state) => state.cases);
  const teamMembers = useAdminStore((state) => state.teamMembers);
  const { totalCases, suspectCount } = getCaseSummary(cases);
  const { activeCount } = getTeamSummary(teamMembers);

  const [logoutModalVisible, setLogoutModalVisible] = useState(false);
  const [deleteStep, setDeleteStep] = useState<DeleteStep>('closed');
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteError, setDeleteError] = useState(false);

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await useAuthStore.getState().deleteAccount();
      setDeleteStep('closed');
      useFeedbackStore.getState().showToast('Account deleted successfully', 'success');
      router.replace('/_login/SignInPage');
    } catch {
      setDeleteStep('closed');
      setDeleteError(true);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView edges={['left', 'right']} style={styles.safeArea}>
      <ScreenStatusBar variant="onBrand" />

      <View style={[styles.header, { paddingTop: insets.top + 40 }]}>
        <View style={styles.headerGlow} />

        <View style={styles.headerTopRow}>
          <Avatar initials={initials} imageUri={avatarUri} size={64} variant="onDark" />
          <View style={styles.headerCopy}>
            <Text allowFontScaling={false} style={styles.name}>
              {name}
            </Text>
            <Text
              allowFontScaling={false}
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {role} • {organization}
            </Text>
          </View>
        </View>

        <View style={styles.heroStats}>
          <HeroStat value={String(totalCases)} label="CASES" />
          <HeroStat value={String(activeCount)} label="ANALYSTS" />
          <HeroStat value={String(suspectCount)} label="SUSPECTED" last />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollArea}>
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
            icon={Bell}
            title="Notifications"
            value={notificationsEnabled}
            onValueChange={onToggleNotifications}
          />
        </GroupedCard>

        <SectionLabel label="About" />
        <GroupedCard>
          <SettingsRow icon={Info} title="Help & Support" onPress={onHelpSupportPress} />
          <Divider />
          <SettingsRow
            icon={FileText}
            title="App Version"
            rightText={appVersion}
            showChevron={false}
          />
        </GroupedCard>

        <SignOutButton
          style={styles.signOutSpacing}
          onPress={() => setLogoutModalVisible(true)}
        />
        <TertiaryButton
          label="Delete Account"
          onPress={() => setDeleteStep('confirm')}
          textColor={colors.danger}
          size="medium"
          style={styles.deleteSpacing}
        />

        <LogoutModal
          visible={logoutModalVisible}
          onCancel={() => setLogoutModalVisible(false)}
          onLogout={() => {
            setLogoutModalVisible(false);
            onSignOutPress?.();
          }}
        />
        <DeleteAccountModal
          visible={deleteStep === 'confirm'}
          variant="admin"
          onCancel={() => setDeleteStep('closed')}
          onConfirm={() => setDeleteStep('type')}
        />
        <TypeToConfirmModal
          visible={deleteStep === 'type'}
          title="Type DELETE to continue"
          message="This confirms you want to permanently delete your account and all associated data."
          confirmWord="DELETE"
          confirmLabel={isDeletingAccount ? 'Deleting...' : 'Delete Account'}
          isLoading={isDeletingAccount}
          onCancel={() => setDeleteStep('closed')}
          onConfirm={handleDeleteAccount}
        />
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

function HeroStat({
  value,
  label,
  last,
}: {
  value: string;
  label: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.heroStat, last && styles.heroStatLast]}>
      <Text allowFontScaling={false} style={styles.heroStatValue}>
        {value}
      </Text>
      <Text allowFontScaling={false} style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: 'relative',
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingBottom: 20,
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
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -10,
  },
  headerCopy: {
    marginLeft: 18,
    flex: 1,
  },
  name: {
    ...getTypographyStyle('t2Title', 'bold'),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption'),
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 2,
  },
  heroStats: {
    flexDirection: 'row',
    marginTop: 18,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.16)',
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  heroStat: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.16)',
  },
  heroStatLast: {
    borderRightWidth: 0,
  },
  heroStatValue: {
    ...getTypographyStyle('t3Title', 'bold'),
    fontSize: 19,
    color: colors.primaryText,
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    ...getTypographyStyle('c3Caption', 'bold'),
    marginTop: 3,
    color: 'rgba(255,255,255,0.64)',
    letterSpacing: 0.5,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 18,
    backgroundColor: colors.background,
  },
  signOutSpacing: {
    marginTop: 12,
  },
  deleteSpacing: {
    marginTop: 8,
  },
});

export default ProfileScreen;