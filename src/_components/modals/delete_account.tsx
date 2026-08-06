import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface DeleteAccountModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function DeleteAccountModal({
  visible,
  onConfirm,
  onCancel,
  isDeleting = false,
}: DeleteAccountModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>Delete Account</Text>

          <Text style={styles.message}>
            This will permanently delete your login credentials and personal
            profile information. You will not be able to sign in again.
          </Text>

          <Text style={styles.retentionNote}>
            Forensic case records you submitted will be retained as required
            for chain-of-custody and legal evidentiary purposes, but will no
            longer be linked to your personal account.
          </Text>

          <PrimaryButton
            label={isDeleting ? 'Deleting...' : 'Delete My Account'}
            onPress={onConfirm}
            loading={isDeleting}
            backgroundColor={colors.danger}
            textColor="#FFFFFF"
            style={styles.button}
          />

          <SecondaryButton
            label="Cancel"
            onPress={onCancel}
            size="large"
            style={styles.button}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background2,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 28,
    alignItems: 'center',
  },
  title: {
    ...getTypographyStyle('t1Title'),
    color: colors.textPrimary,
    marginBottom: 10,
    textAlign: 'center',
  },
  message: {
    ...getTypographyStyle('body'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 12,
  },
  retentionNote: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textTertiary,
    textAlign: 'center',
    marginBottom: 22,
    lineHeight: 16,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});