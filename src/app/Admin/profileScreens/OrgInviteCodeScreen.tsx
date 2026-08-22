import * as Clipboard from 'expo-clipboard';
import React, { useEffect, useState } from 'react';
import { ScrollView, ActivityIndicator, Share, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle } from 'lucide-react-native';
import ScreenHeader from '@/_components/common/ScreenHeader';
import InviteQRCode from '@/_components/admin/InviteQRCode';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import Toast from '@/_components/toast';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useAdminStore } from '@/store/adminStore';

const OrgInviteCodeScreen: React.FC = () => {
  const inviteCode = useAdminStore((state) => state.inviteCode);
  const isUsingMockInvite = useAdminStore((state) => state.isUsingMockInvite);
  const isGeneratingInvite = useAdminStore((state) => state.isGeneratingInvite);
  const fetchOrGenerateInviteCode = useAdminStore((state) => state.fetchOrGenerateInviteCode);

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    fetchOrGenerateInviteCode();
  }, [fetchOrGenerateInviteCode]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  };

  const handleCopyCode = async () => {
    if (!inviteCode) return;
    try {
      await Clipboard.setStringAsync(inviteCode);
      showToast('Code copied');
    } catch {
      showToast('Unable to copy code');
    }
  };

  const handleShare = async () => {
    if (!inviteCode) return;
    try {
      await Share.share({ message: `Join our organization on Avera using invite code: ${inviteCode}` });
    } catch {
      showToast('Unable to share code');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Org Invite Code" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.qrCard}>
          {isGeneratingInvite || !inviteCode ? (
            <View style={styles.qrLoading}>
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <InviteQRCode value={inviteCode} size={180} />
          )}
        </View>

        <Text style={styles.code}>{inviteCode ?? '— — — — — — —'}</Text>
        <Text style={styles.caption}>
          Share this code with analysts to let them join your organization.
        </Text>

        {__DEV__ && isUsingMockInvite ? (
          <Text style={styles.devNote}>
            Preview code — backend invite generation (POST /admin/team/invite) isn`&apos;`t live yet.
          </Text>
        ) : null}

        <PrimaryButton label="Copy Code" onPress={handleCopyCode} style={styles.button} disabled={!inviteCode} />
        <SecondaryButton label="Share" onPress={handleShare} style={styles.button} disabled={!inviteCode} />

        <View style={styles.warningBanner}>
          <AlertTriangle size={18} color={colors.warningIcon} style={styles.warningIcon} />
          <Text style={styles.warningText}>
            Keep this code private. Anyone with it can request to join your organization.
          </Text>
        </View>
      </ScrollView>

      <Toast visible={toastVisible} message={toastMessage} onDismiss={() => setToastVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.background },
  content: { padding: 16, alignItems: 'stretch' },
  qrCard: {
    alignSelf: 'center',
    backgroundColor: colors.cardBackground,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    marginTop: 12,
    marginBottom: 20,
    minWidth: 220,
    minHeight: 220,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrLoading: { width: 180, height: 180, alignItems: 'center', justifyContent: 'center' },
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
    marginBottom: 8,
    paddingHorizontal: 20,
  },
  devNote: {
    textAlign: 'center',
    ...getTypographyStyle('c2Caption', 'regular'),
    color: colors.suspectAccent,
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  button: { marginBottom: 12 },
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
  warningIcon: { marginRight: 10, marginTop: 1 },
  warningText: {
    flex: 1,
    ...getTypographyStyle('c1Caption', 'regular'),
    lineHeight: 18,
    color: colors.warningText,
  },
});

export default OrgInviteCodeScreen;