import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ErrorModalProps {
  visible: boolean;
  title?: string;
  message: string;
  /** Primary action label — defaults to "OK" */
  primaryLabel?: string;
  onPrimaryPress: () => void;
  /** Optional secondary action (e.g. "Try Again" / "Go Back") */
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

/**
 * Branded replacement for Alert.alert(...) on error paths — network
 * failures, session expiry, submission failures, destructive-action
 * failures. Keeps the same overlay/card shape as logout.tsx and
 * delete_account.tsx so it reads as part of the same app.
 */
export default function ErrorModal({
  visible,
  title = 'Something went wrong',
  message,
  primaryLabel = 'OK',
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: ErrorModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onPrimaryPress}
    >
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.iconCircle}>
            <Ionicons name="alert-circle" size={28} color={colors.danger} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label={primaryLabel}
            onPress={onPrimaryPress}
            backgroundColor={colors.danger}
            textColor="#FFFFFF"
            style={styles.button}
          />

          {secondaryLabel && onSecondaryPress ? (
            <SecondaryButton
              label={secondaryLabel}
              onPress={onSecondaryPress}
              backgroundColor={colors.background2}
              borderColor={colors.border}
              textColor={colors.textSecondary}
              textVariant="b2Button"
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
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.dangerLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
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