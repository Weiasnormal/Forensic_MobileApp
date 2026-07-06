import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle } from 'lucide-react-native';
import ScreenHeader from '@/_components/common/ScreenHeader';
import QRCodePlaceholder from '@/_components/admin/QRCodePlaceholder';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface OrgInviteCodeScreenProps {
  inviteCode: string;
  onBackPress?: () => void;
  onCopyCodePress?: () => void;
  onSharePress?: () => void;
}

const OrgInviteCodeScreen: React.FC<OrgInviteCodeScreenProps> = ({
  inviteCode,
  onBackPress,
  onCopyCodePress,
  onSharePress,
}) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Org Invite Code" onBackPress={onBackPress} />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          <QRCodePlaceholder size={180} />
        </View>

        <Text style={styles.code}>{inviteCode}</Text>
        <Text style={styles.caption}>
          Share this code with analysts to let them join your organization.
        </Text>

        <PrimaryButton label="Copy Code" onPress={onCopyCodePress} style={styles.button} />
        <SecondaryButton label="Share" onPress={onSharePress} style={styles.button} />

        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color={colors.warningIcon} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Keep this code private. Anyone with it can request to join your organization.
          </Text>
        </View>
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
    alignItems: 'stretch',
  },
  qrCard: {
    alignSelf: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
  },
  code: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    letterSpacing: 1,
  },
  caption: {
    textAlign: 'center',
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 8,
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  button: {
    marginBottom: 12,
  },
  warningBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.warningBackground,
    borderWidth: 1,
    borderColor: colors.warningBorder,
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  },
  warningIcon: {
    marginRight: 10,
    marginTop: 1,
  },
  warningText: {
    flex: 1,
    ...getTypographyStyle('c1Caption', 'regular'),
    lineHeight: 18,
    color: colors.warningText,
  },
});

export default OrgInviteCodeScreen;
