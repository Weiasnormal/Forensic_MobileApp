import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface SuccessModalProps {
  visible: boolean;
  title?: string;
  message: string;
  primaryLabel?: string;
  onPrimaryPress: () => void;
  secondaryLabel?: string;
  onSecondaryPress?: () => void;
}

export default function SuccessModal({
  visible,
  title = 'Success',
  message,
  primaryLabel = 'Continue',
  onPrimaryPress,
  secondaryLabel,
  onSecondaryPress,
}: SuccessModalProps) {
  const scale = useRef(new Animated.Value(0.9)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scale.setValue(0.9);
      opacity.setValue(0);
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 7,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scale, opacity]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onPrimaryPress}
    >
      <View style={styles.overlay}>
        <Animated.View style={[styles.card, { opacity, transform: [{ scale }] }]}>
          <View style={styles.iconCircle}>
            <Ionicons name="checkmark-circle" size={30} color={colors.statusGenuine} />
          </View>

          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>

          <PrimaryButton
            label={primaryLabel}
            onPress={onPrimaryPress}
            backgroundColor={colors.statusGenuine}
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
        </Animated.View>
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
    backgroundColor: colors.statusGenuineBg,
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