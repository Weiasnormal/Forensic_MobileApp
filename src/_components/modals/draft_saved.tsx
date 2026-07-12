import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface DraftSavedModalProps {
  visible: boolean;
  onSaveDraft: () => void;
  onDiscard: () => void;
  onGoBack: () => void;
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
  goBackLabel?: string;
  isSaving?: boolean;
}

export default function DraftSavedModal({
  visible,
  onSaveDraft,
  onDiscard,
  onGoBack,
  title = 'Save Draft',
  message = 'How would you like to proceed?',
  saveLabel = 'Save as Draft',
  discardLabel = 'Discard',
  goBackLabel = 'Go Back',
  isSaving = false,
}: DraftSavedModalProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onGoBack}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label={saveLabel}
            onPress={onSaveDraft}
            loading={isSaving}
            size="large"
            style={styles.button}
          />

          <SecondaryButton
            label={discardLabel}
            onPress={onDiscard}
            textColor={colors.danger}
            size="large"
            style={styles.button}
          />

          <SecondaryButton
            label={goBackLabel}
            onPress={onGoBack}
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
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 24,
    backgroundColor: colors.cardBackground,
    paddingHorizontal: 22,
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
    marginBottom: 22,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});