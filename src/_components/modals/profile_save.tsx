import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ProfileSaveModalProps {
  visible: boolean;
  title?: string;
  message?: string;
  saveLabel?: string;
  cancelLabel?: string;
  isSaving?: boolean;
  onSave: () => void;
  onCancel: () => void;
}

export default function ProfileSaveModal({
  visible,
  title = 'Save Changes?',
  message = 'Do you want to save these profile changes?',
  saveLabel = 'Save',
  cancelLabel = 'Cancel',
  isSaving = false,
  onSave,
  onCancel,
}: ProfileSaveModalProps) {
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
            label={isSaving ? 'Saving...' : saveLabel}
            onPress={onSave}
            loading={isSaving}
            disabled={isSaving}
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
            disabled={isSaving}
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
    marginBottom: 22,
    lineHeight: 21,
  },
  button: {
    width: '100%',
    marginTop: 10,
  },
});