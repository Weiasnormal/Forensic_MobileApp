import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type ConfirmActionVariant = 'danger' | 'success' | 'primary';

interface ConfirmActionModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmLabel: string;
  cancelLabel?: string;
  variant?: ConfirmActionVariant;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const VARIANT_COLOR: Record<ConfirmActionVariant, string> = {
  danger: colors.danger,
  success: colors.statusGenuine,
  primary: colors.primary,
};

export default function ConfirmActionModal({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmActionModalProps) {
  const accentColor = VARIANT_COLOR[variant];

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
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <PrimaryButton
            label={confirmLabel}
            onPress={onConfirm}
            loading={isLoading}
            backgroundColor={accentColor}
            textColor="#FFFFFF"
            style={styles.button}
          />

          <SecondaryButton
            label={cancelLabel}
            onPress={onCancel}
            backgroundColor={colors.background2}
            borderColor={colors.border}
            textColor={colors.textSecondary}
            textVariant="b1Button"
            style={styles.button}
            disabled={isLoading}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
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
    marginBottom: 10,
  },
  message: {
    ...getTypographyStyle('headline', 'regular'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 21,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});