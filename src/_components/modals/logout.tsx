import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { getTypographyStyle } from '@/constants/typography';

interface LogoutModalProps {
  visible: boolean;
  onLogout: () => void;
  onCancel: () => void;
}

export default function LogoutModal({
  visible,
  onLogout,
  onCancel,
}: LogoutModalProps) {
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
          <Text style={styles.title}>Logout Confirmation</Text>

          <Text style={styles.message}>
            Are you sure you want to logout your account?
          </Text>

          <PrimaryButton
            label="Log out"
            onPress={onLogout}
            backgroundColor="#E54848"
            textColor="#FFFFFF"
            style={styles.primaryButton}
          />

          <SecondaryButton
            label="Cancel"
            onPress={onCancel}
            backgroundColor="#FFFFFF"
            borderColor="#D8E0EA"
            textColor="#64748B"
            textVariant="b2Button"
            style={styles.secondaryButton}
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
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 28,
    paddingVertical: 30,
    alignItems: 'center',
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: '#0F172A',
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    ...getTypographyStyle('headline', 'regular'),
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    width: '100%',
  },
  secondaryButton: {
    width: '100%',
    marginTop: 12,
  },
});