import React, { useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, View } from 'react-native';
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

  const handleCancel = () => {
    setValue('');
    onCancel();
  };

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm();
    setValue('');
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

          <TextInput
            value={value}
            onChangeText={setValue}
            placeholder={confirmWord}
            placeholderTextColor={colors.textTertiary}
            autoCapitalize="characters"
            autoCorrect={false}
            style={styles.input}
          />

          <PrimaryButton
            label={confirmLabel}
            onPress={handleConfirm}
            loading={isLoading}
            disabled={!canConfirm || isLoading}
            backgroundColor={colors.danger}
            textColor="#FFFFFF"
            style={styles.button}
          />

          <SecondaryButton
            label={cancelLabel}
            onPress={handleCancel}
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
    marginBottom: 20,
    lineHeight: 21,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
    marginBottom: 18,
    textAlign: 'center',
  },
  button: {
    width: '100%',
    marginTop: 4,
  },
});