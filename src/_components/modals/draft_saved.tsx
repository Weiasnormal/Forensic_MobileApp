import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface DraftSavedModalProps {
  visible: boolean;
  onContinue: () => void;
  onDismiss?: () => void;
  title?: string;
  message?: string;
  primaryLabel?: string;
  secondaryLabel?: string;
}

export default function DraftSavedModal({
  visible,
  onContinue,
  onDismiss,
  title = 'Draft saved',
  message = 'Your case details were saved before you left, so you can continue from where you stopped.',
  primaryLabel = 'Continue later',
  secondaryLabel,
}: DraftSavedModalProps) {
  const handleClose = onDismiss ?? onContinue;

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={handleClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconWrap}>
            <Ionicons name="checkmark-circle" size={30} color="#1F5DA8" />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          {secondaryLabel ? (
            <Pressable style={styles.secondaryButton} onPress={handleClose}>
              <Text style={styles.secondaryButtonText}>{secondaryLabel}</Text>
            </Pressable>
          ) : null}

          <Pressable style={styles.button} onPress={onContinue}>
            <Text style={styles.buttonText}>{primaryLabel}</Text>
          </Pressable>
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
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 22,
    alignItems: 'center',
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#E8F1FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  message: {
    textAlign: 'center',
    color: '#64748B',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 18,
  },
  button: {
    width: '100%',
    borderRadius: 14,
    backgroundColor: '#1F5DA8',
    paddingVertical: 14,
    alignItems: 'center',
  },
  secondaryButton: {
    width: '100%',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D8E3EF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButtonText: {
    color: '#334155',
    fontSize: 15,
    fontWeight: '800',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
});