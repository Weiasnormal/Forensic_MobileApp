import React, { useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { Folder, MinusCircle, UserX } from 'lucide-react-native';
import ScreenHeader from '@/_components/common/ScreenHeader';
import Avatar from '@/_components/common/Avatar';
import SectionLabel from '@/_components/common/SectionLabel';
import SettingsRow from '@/_components/common/SettingsRow';
import DangerRow from '@/_components/admin/DangerRow';
import Divider from '@/_components/common/Divider';
import Stepper from '@/_components/common/Stepper';
import ToggleRow from '@/_components/common/ToggleRow';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAdminStore } from '@/store/adminStore';

interface MemberDetailsScreenProps {
  memberInitials: string;
  memberName: string;
  memberRole: string;
  casesThisMonth: number;
  dailyCaseLimit: number;
  caseSubmissionEnabled: boolean;
  onBackPress?: () => void;
  onViewCaseHistoryPress?: () => void;
  onDecreaseLimit?: () => void;
  onIncreaseLimit?: () => void;
  onToggleCaseSubmission?: (value: boolean) => void;
  onSuspendAnalystPress?: () => void;
  onRemoveFromOrgPress?: () => void;
}

const MemberDetailsScreen: React.FC<MemberDetailsScreenProps> = ({
  memberInitials,
  memberName,
  memberRole,
  casesThisMonth,
  dailyCaseLimit,
  caseSubmissionEnabled,
  onBackPress,
  onViewCaseHistoryPress,
  onDecreaseLimit,
  onIncreaseLimit,
  onToggleCaseSubmission,
  onSuspendAnalystPress,
  onRemoveFromOrgPress,
}) => {
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const fetchMemberById = useAdminStore((state) => state.fetchMemberById);

  useEffect(() => {
    if (memberId) {
      void fetchMemberById(memberId);
    }
  }, [fetchMemberById, memberId]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Member Details" onBackPress={onBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        <Avatar initials={memberInitials} size={80} variant="light" />
        <Text allowFontScaling={false} style={styles.name}>{memberName}</Text>
        <Text allowFontScaling={false} style={styles.role}>{memberRole}</Text>

        <SectionLabel label="Case Management" style={styles.sectionSpacing} />
        <SettingsRow
          icon={Folder}
          title="View Case History"
          subtitle={`${casesThisMonth} cases this month`}
          onPress={onViewCaseHistoryPress}
        />
        <Divider />

        <View style={styles.limitRow}>
          <View style={styles.limitTextWrapper}>
            <Text allowFontScaling={false} style={styles.limitTitle}>Daily Case Limit</Text>
            <Text allowFontScaling={false} style={styles.limitSubtitle}>Maximum cases per day</Text>
          </View>
          <Stepper value={dailyCaseLimit} onDecrease={onDecreaseLimit} onIncrease={onIncreaseLimit} />
        </View>
        <Divider />

        <ToggleRow
          title="Case Submission"
          subtitle="Allow this analyst to submit new cases"
          value={caseSubmissionEnabled}
          onValueChange={onToggleCaseSubmission}
        />

        <SectionLabel label="Access Controls" style={styles.sectionSpacing} />
        <DangerRow
          icon={MinusCircle}
          title="Suspend Analyst"
          subtitle="Temporarily disable access"
          onPress={onSuspendAnalystPress}
        />
        <DangerRow
          icon={UserX}
          title="Remove from Organization"
          subtitle="Permanently remove access"
          onPress={onRemoveFromOrgPress}
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
  content: {
    padding: 16,
  },
  name: {
    ...getTypographyStyle('t3Title'),
    textAlign: 'center',
    color: colors.textPrimary,
    marginTop: 14,
  },
  role: {
    ...getTypographyStyle('headline', 'regular'),
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  limitRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  limitTextWrapper: {
    flex: 1,
  },
  limitTitle: {
    ...getTypographyStyle('body', 'semiBold'),
    color: colors.textPrimary,
  },
  limitSubtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default MemberDetailsScreen;