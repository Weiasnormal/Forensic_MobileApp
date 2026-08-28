import * as Clipboard from 'expo-clipboard';
import { Copy, ChevronRight, X } from 'lucide-react-native';
import React, { useCallback, useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ScreenHeader from '@/_components/common/ScreenHeader';
import InfoRow from '@/_components/admin/InfoRow';
import Toast from '@/_components/toast';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useUser } from '@/store/userStore';
import {useAdminStore} from '@/store/adminStore';

interface OrganizationScreenProps {
  organizationName?: string;
  organizationCode?: string;
  memberCount?: number;
  createdDate?: string;
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
  const { user, setUser } = useUser();
  const resolvedOrganizationName = user?.organization ?? organizationName ?? 'PNP Crime Laboratory';
  const resolvedOrganizationCode = organizationCode ?? 'UST-A7F3';
  const resolvedMemberCount = memberCount ?? 0;
  const resolvedCreatedDate = createdDate ?? 'Jan 12, 2025';

  const [draftOrganizationName, setDraftOrganizationName] = useState(resolvedOrganizationName);
  const [isEditingOrganizationName, setIsEditingOrganizationName] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (!isEditingOrganizationName) {
      setDraftOrganizationName(resolvedOrganizationName);
    }
  }, [resolvedOrganizationName, isEditingOrganizationName]);

  const trimmedOrganizationName = draftOrganizationName.trim();
  const canSaveOrganizationName =
    trimmedOrganizationName.length > 0 && trimmedOrganizationName !== resolvedOrganizationName.trim();

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleEditOrganizationName = useCallback(() => {
    setDraftOrganizationName(resolvedOrganizationName);
    setIsEditingOrganizationName(true);
  }, [resolvedOrganizationName]);

  const handleCancelOrganizationName = useCallback(() => {
    setDraftOrganizationName(resolvedOrganizationName);
    setIsEditingOrganizationName(false);
  }, [resolvedOrganizationName]);

  const createTenant = useAdminStore((state) => state.createTenant);

  const handleSaveOrganizationName = useCallback(async () => {
    if (!canSaveOrganizationName) {
      setIsEditingOrganizationName(false);
      return;
    }

    const tenantId = await createTenant(trimmedOrganizationName);

    if (!tenantId) {
      showToast('Unable to create organization on the server');
      return;
    }

      await setUser({ organization: trimmedOrganizationName });
      setIsEditingOrganizationName(false);
      showToast('Organization created');
    }, [canSaveOrganizationName, createTenant, setUser, showToast, trimmedOrganizationName]);

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(resolvedOrganizationCode);
      onCopyCodePress?.();
      showToast('Code copied');
    } catch {
      showToast('Unable to copy code');
    }
  }, [onCopyCodePress, resolvedOrganizationCode, showToast]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Organization" onBackPress={onBackPress} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.nameSection}>
          <TouchableOpacity activeOpacity={0.75} onPress={handleEditOrganizationName}>
            <View style={styles.nameRow}>
              <Text style={styles.sectionLabel}>Organization Name</Text>
              <Text style={styles.nameValue}>{resolvedOrganizationName}</Text>
            </View>
          </TouchableOpacity>

          {isEditingOrganizationName ? (
            <View style={styles.editorCard}>
              <View style={styles.inputShell}>
                <TextInput
                  value={draftOrganizationName}
                  onChangeText={setDraftOrganizationName}
                  placeholder="Organization name"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void handleSaveOrganizationName();
                  }}
                />

                {draftOrganizationName.length > 0 ? (
                  <Pressable onPress={() => setDraftOrganizationName('')} hitSlop={10} style={styles.clearButton}>
                    <View style={styles.clearIconCircle}>
                      <X size={14} color={colors.textSecondary} strokeWidth={2.2} />
                    </View>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={handleCancelOrganizationName} activeOpacity={0.8}>
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.primaryButton, !canSaveOrganizationName && styles.primaryButtonDisabled]}
                  onPress={() => {
                    void handleSaveOrganizationName();
                  }}
                  activeOpacity={0.85}
                  disabled={!canSaveOrganizationName}
                >
                  <Text style={styles.primaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        <InfoRow
          label="Organization Code"
          value={resolvedOrganizationCode}
          rightAccessory={
            <TouchableOpacity onPress={() => { void handleCopyCode(); }} activeOpacity={0.7}>
              <Copy size={20} color={colors.textPrimary} strokeWidth={2.1} />
            </TouchableOpacity>
          }
        />

        <InfoRow
          label="Members"
          value={String(resolvedMemberCount)}
          onPress={onMembersPress}
          rightAccessory={<ChevronRight size={20} color={colors.textTertiary} strokeWidth={2.1} />}
        />

        <InfoRow label="Created" value={resolvedCreatedDate} />
      </ScrollView>

      <Toast visible={toastVisible} message={toastMessage} onDismiss={() => setToastVisible(false)} />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 24,
  },
  nameSection: {
    marginBottom: 6,
  },
  nameRow: {
    marginBottom: 10,
  },
  sectionLabel: {
    ...getTypographyStyle('c2Caption'),
    color: colors.textSecondary,
    marginBottom: 6,
  },
  nameValue: {
    ...getTypographyStyle('body', 'semiBold'),
    color: colors.textPrimary,
  },
  editorCard: {
    paddingBottom: 8,
  },
  inputShell: {
    position: 'relative',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: 'center',
    paddingLeft: 14,
    paddingRight: 42,
  },
  input: {
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
    paddingVertical: 11,
  },
  clearButton: {
    position: 'absolute',
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  clearIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EDF3FA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 12,
    marginBottom: 2,
  },
  secondaryButton: {
    minWidth: 92,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background2,
  },
  secondaryButtonText: {
    ...getTypographyStyle('b3Button'),
    color: '#64748B',
  },
  primaryButton: {
    minWidth: 92,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  primaryButtonText: {
    ...getTypographyStyle('b3Button'),
    color: colors.primaryText,
  },
});

export default OrganizationScreen;
