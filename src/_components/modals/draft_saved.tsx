import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

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

          <Pressable style={styles.primaryButton} onPress={onContinue}>
            <Text style={styles.primaryButtonText}>{primaryLabel}</Text>
          </Pressable>

          {secondaryLabel ? (
            <Pressable
              style={styles.secondaryButton}
              onPress={onSecondaryPress ?? handleClose}
            >
              <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}

          {tertiaryLabel ? (
            <Pressable
              style={styles.tertiaryButton}
              onPress={onTertiaryPress ?? handleClose}
            >
              <Text style={styles.tertiaryButtonText}>{tertiaryLabel}</Text>
            </Pressable>
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
    fontSize: 19,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
  },
  primaryButton: {
    width: '100%',
    borderRadius: 12,
    backgroundColor: '#1F5DA8',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 2,
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E3EF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  secondaryButtonText: {
    color: '#EF4444',
    fontSize: 15,
    fontWeight: '800',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  tertiaryButton: {
    width: '100%',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#D8E3EF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  tertiaryButtonText: {
    color: '#64748B',
    fontSize: 15,
    fontWeight: '800',
  },
});