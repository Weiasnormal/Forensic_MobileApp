import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface DraftSavedModalProps {
  visible: boolean;
  onSaveDraft?: () => void;
  onDiscard?: () => void;
  onGoBack?: () => void;
  onContinue?: () => void;
  onDismiss?: () => void;
  title?: string;
  message?: string;
  saveLabel?: string;
  discardLabel?: string;
  goBackLabel?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  isSaving?: boolean;
}

export default function DraftSavedModal({
  visible,
  onSaveDraft,
  onDiscard,
  onGoBack,
  onContinue,
  onDismiss,
  title = 'Save Draft',
  message = 'How would you like to proceed?',
  saveLabel = 'Save as Draft',
  discardLabel = 'Discard',
  goBackLabel = 'Go Back',
  primaryLabel,
  secondaryLabel,
  isSaving = false,
}: DraftSavedModalProps) {
  const primaryAction = onSaveDraft ?? onContinue ?? (() => {});
  const secondaryAction = onDiscard ?? onDismiss ?? (() => {});
  const primaryButtonLabel = primaryLabel ?? saveLabel;
  const secondaryButtonLabel = secondaryLabel ?? discardLabel;
  const showThirdButton = Boolean(onGoBack);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onGoBack ?? onDismiss ?? secondaryAction}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label={primaryButtonLabel}
            onPress={primaryAction}
            loading={isSaving}
            size="large"
            style={styles.button}
          />

          <SecondaryButton
            label={secondaryButtonLabel}
            onPress={secondaryAction}
            textColor={colors.danger}
            size="large"
            style={styles.button}
          />

          {showThirdButton ? (
            <SecondaryButton
              label={goBackLabel}
              onPress={onGoBack}
              size="large"
              style={styles.button}
            />
          ) : null}
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