import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import TertiaryButton from '@/_components/common/TertiaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface DraftSavedModalProps {
  visible: boolean;
  onContinue: () => void;
  onDismiss?: () => void;
  onSecondaryPress?: () => void;
  onTertiaryPress?: () => void;
  title?: string;
  message?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
  tertiaryLabel?: string;
}

export default function DraftSavedModal({
  visible,
  onContinue,
  onDismiss,
  onSecondaryPress,
  onTertiaryPress,
  title = 'Draft saved',
  message = 'Your case details were saved before you left, so you can continue from where you stopped.',
  primaryLabel = 'Continue later',
  secondaryLabel,
  tertiaryLabel,
}: DraftSavedModalProps) {
  const handleClose = onDismiss ?? onContinue;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label={primaryLabel}
            onPress={onContinue}
            backgroundColor="#1E6FD9"
            style={styles.primaryButton}
          />

          {secondaryLabel ? (
            <SecondaryButton
              label={secondaryLabel}
              onPress={onSecondaryPress ?? handleClose}
              backgroundColor="#FFFFFF"
              textVariant="b3Button"
              style={styles.secondaryButton}
            />
          ) : null}

          {tertiaryLabel ? (
            <TertiaryButton
              label={tertiaryLabel}
              onPress={onTertiaryPress ?? handleClose}
              backgroundColor="#FFFFFF"
              textVariant="b3Button"
              style={styles.tertiaryButton}
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
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 18,
    paddingVertical: 18,
    alignItems: 'center',
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#64748B',
    ...getTypographyStyle('headline', 'regular'),
    marginBottom: 14,
  },
  primaryButton: {
    width: '100%',
    marginTop: 2,
  },
  secondaryButton: {
    width: '100%',
    marginTop: 10,
  },
  tertiaryButton: {
    width: '100%',
    marginTop: 10,
  },
});