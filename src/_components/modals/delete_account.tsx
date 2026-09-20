import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type DeleteAccountVariant = 'user' | 'admin';

const COPY: Record<DeleteAccountVariant, { title: string; message: string }> = {
  user: {
    title: 'Delete your account?',
    message:
      'This action cannot be undone. All your personal data and account history will be permanently deleted from Avera.',
  },
  admin: {
    title: 'Delete your Avera Admin account?',
    message:
      'This action cannot be undone. You will permanently lose admin access to Avera and all associated account data.',
  },
};

interface DeleteAccountModalProps {
  visible: boolean;
  variant?: DeleteAccountVariant;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteAccountModal({
  visible,
  variant = 'user',
  onConfirm,
  onCancel,
}: DeleteAccountModalProps) {
  const { title, message } = COPY[variant];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label="Delete Account"
            onPress={onConfirm}
            size="large"
            backgroundColor={colors.dangerButton}
            style={styles.button}
          />

          <SecondaryButton
            label="Cancel"
            onPress={onCancel}
            size="large"
            backgroundColor={colors.background2}
            borderColor={colors.inputBorder}
            textColor={colors.textSecondary}
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
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...getTypographyStyle('headline', 'regular'),
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 21,
    marginBottom: 24,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});