import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import PermissionDisclosure from '@/_components/common/PermissionDisclosure';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface CameraDisclosureModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
}

export default function CameraDisclosureModal({
  visible,
  onConfirm,
  onCancel,
  title = 'Camera Access',
}: CameraDisclosureModalProps) {
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

          <PermissionDisclosure />

          <PrimaryButton
            label="Open Camera"
            onPress={onConfirm}
            style={styles.button}
          />

          <SecondaryButton
            label="Cancel"
            onPress={onCancel}
            backgroundColor={colors.background2}
            borderColor={colors.border}
            textColor={colors.textSecondary}
            textVariant="b2Button"
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
    marginBottom: 16,
  },
  button: {
    width: '100%',
    marginTop: 12,
  },
});