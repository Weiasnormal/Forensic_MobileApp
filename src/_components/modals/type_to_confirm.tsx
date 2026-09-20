import React, { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface TypeToConfirmModalProps {
  visible: boolean;
  title: string;
  message?: string;
  confirmWord: string;
  confirmLabel: string;
  cancelLabel?: string;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function TypeToConfirmModal({
  visible,
  title,
  message,
  confirmWord,
  confirmLabel,
  cancelLabel = 'Cancel',
  isLoading = false,
  onConfirm,
  onCancel,
}: TypeToConfirmModalProps) {
  const [value, setValue] = useState('');
  const canConfirm = value.trim().toUpperCase() === confirmWord.toUpperCase();

  useEffect(() => {
    if (!visible) setValue('');
  }, [visible]);

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          {message ? <Text style={styles.message}>{message}</Text> : null}

          <FormField
            value={value}
            onChangeText={setValue}
            autoCapitalize="characters"
            disabled={isLoading}
            style={styles.field}
          />

          <PrimaryButton
            label={confirmLabel}
            onPress={handleConfirm}
            size="large"
            loading={isLoading}
            disabled={!canConfirm || isLoading}
            backgroundColor={colors.dangerButton}
            style={styles.button}
          />

          <SecondaryButton
            label={cancelLabel}
            onPress={handleCancel}
            size="large"
            backgroundColor={colors.background2}
            borderColor={colors.inputBorder}
            textColor={colors.textSecondary}
            disabled={isLoading}
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
  field: {
    width: '100%',
    marginBottom: 12,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});