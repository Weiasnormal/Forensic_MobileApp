import React, { useEffect } from 'react';
import { ActivityIndicator, View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Folder, MinusCircle, UserX } from 'lucide-react-native';
import ScreenHeader from '@/_components/common/ScreenHeader';
import Avatar from '@/_components/common/Avatar';
import SectionLabel from '@/_components/common/SectionLabel';
import SettingsRow from '@/_components/common/SettingsRow';
import DangerRow from '@/_components/admin/DangerRow';
import Divider from '@/_components/common/Divider';
import ToggleRow from '@/_components/common/ToggleRow';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAdminStore } from '@/store/adminStore';

const MemberDetailsScreen: React.FC = () => {
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const router = useRouter();
  const fetchMemberById = useAdminStore((state) => state.fetchMemberById);
  const suspendTeamMember = useAdminStore((state) => state.suspendTeamMember);
  const removeTeamMember = useAdminStore((state) => state.removeTeamMember);
  const memberDetail = useAdminStore((state) => state.memberDetail);
  const isLoadingMemberDetail = useAdminStore((state) => state.isLoadingMemberDetail);
  const memberDetailError = useAdminStore((state) => state.memberDetailError);

  useEffect(() => {
    if (memberId) {
      void fetchMemberById(memberId);
    }
  }, [fetchMemberById, memberId]);

  if (!memberId || isLoadingMemberDetail || !memberDetail || memberDetail.id !== memberId) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader title="Member Details" onBackPress={() => router.back()} />
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary} />
          <Text allowFontScaling={false} style={styles.stateText}>
            {memberDetailError ?? 'Loading member details...'}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const memberName = `${memberDetail.firstName} ${memberDetail.lastName}`.trim();
  const memberInitials = `${memberDetail.firstName[0] ?? ''}${memberDetail.lastName[0] ?? ''}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Member Details" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Avatar initials={memberInitials} size={80} variant="light" />
        <Text allowFontScaling={false} style={styles.name}>{memberName}</Text>
        <Text allowFontScaling={false} style={styles.role}>{memberDetail.role}</Text>

        <SectionLabel label="Case Management" style={styles.sectionSpacing} />
        <SettingsRow
          icon={Folder}
          title="View Case History"
          subtitle="Case history unavailable"
        />
        <Divider />

        <View style={styles.limitRow}>
          <View style={styles.limitTextWrapper}>
            <Text allowFontScaling={false} style={styles.limitTitle}>Daily Case Limit</Text>
            <Text allowFontScaling={false} style={styles.limitSubtitle}>Not provided by backend</Text>
          </View>
          <Text allowFontScaling={false} style={styles.unavailableText}>Unavailable</Text>
        </View>
        <Divider />

        <ToggleRow
          title="Case Submission"
          subtitle="Not provided by backend"
          value={false}
          disabled
        />

        <SectionLabel label="Access Controls" style={styles.sectionSpacing} />
        <DangerRow
          icon={MinusCircle}
          title="Suspend Analyst"
          subtitle="Temporarily disable access"
          onPress={() => void suspendTeamMember(memberId)}
        />
        <DangerRow
          icon={UserX}
          title="Remove from Organization"
          subtitle="Permanently remove access"
          onPress={async () => {
            await removeTeamMember(memberId);
            router.back();
          }}
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
  centeredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  stateText: {
    ...getTypographyStyle('body', 'regular'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 12,
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
  unavailableText: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textTertiary,
  },
});

export default MemberDetailsScreen;