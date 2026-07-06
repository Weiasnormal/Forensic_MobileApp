import React from 'react';
import { View, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Copy, ChevronRight } from 'lucide-react-native';
import ScreenHeader from '@/_components/common/ScreenHeader';
import InfoRow from '@/_components/admin/InfoRow';
import { colors } from '@/constants/colors';

interface OrganizationScreenProps {
  organizationName: string;
  organizationCode: string;
  memberCount: number;
  createdDate: string;
  onBackPress?: () => void;
  onCopyCodePress?: () => void;
  onMembersPress?: () => void;
}

const OrganizationScreen: React.FC<OrganizationScreenProps> = ({
  organizationName,
  organizationCode,
  memberCount,
  createdDate,
  onBackPress,
  onCopyCodePress,
  onMembersPress,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Organization" onBackPress={onBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        <InfoRow label="Organization Name" value={organizationName} />

        <InfoRow
          label="Organization Code"
          value={organizationCode}
          rightAccessory={
            <TouchableOpacity onPress={onCopyCodePress} activeOpacity={0.7}>
              <Copy size={18} color={colors.textPrimary} />
            </TouchableOpacity>
          }
        />

        <InfoRow
          label="Members"
          value={String(memberCount)}
          onPress={onMembersPress}
          rightAccessory={<ChevronRight size={18} color={colors.textTertiary} />}
        />

        <InfoRow label="Created" value={createdDate} />
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
});

export default OrganizationScreen;
