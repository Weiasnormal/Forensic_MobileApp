import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type ToastVariant = 'neutral' | 'success' | 'successLight' | 'infoLight';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
  variant?: ToastVariant;
}

interface ToastVariantConfig {
  backgroundColor: string;
  textColor: string;
  icon: keyof typeof Ionicons.glyphMap | null;
  iconColor: string;
}

const VARIANT_CONFIG: Record<ToastVariant, ToastVariantConfig> = {
  neutral: {
    backgroundColor: '#0F172A',
    textColor: colors.primaryText,
    icon: null,
    iconColor: colors.primaryText,
  },
  success: {
    backgroundColor: '#0F172A',
    textColor: colors.primaryText,
    icon: 'checkmark-circle',
    iconColor: colors.statusGenuine,
  },
  successLight: {
    backgroundColor: colors.statusGenuineBg,
    textColor: colors.statusGenuine,
    icon: 'checkmark-circle',
    iconColor: colors.statusGenuine,
  },
  infoLight: {
    backgroundColor: colors.primaryLight,
    textColor: colors.primary,
    icon: 'information-circle',
    iconColor: colors.primary,
  },
};

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  duration = 2400,
  onDismiss,
  style,
  variant = 'neutral',
}) => {
  const [isMounted, setIsMounted] = useState(visible);
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(8)).current;

  useEffect(() => {
    if (visible) {
      setIsMounted(true);
      Animated.parallel([
        Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
      return;
    }

    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(() => {
      setIsMounted(false);
    });
  }, [visible, opacity, translateY]);

  useEffect(() => {
    if (!visible || !onDismiss) {
      return;
    }

    const timeout = setTimeout(() => onDismiss(), duration);
    return () => clearTimeout(timeout);
  }, [duration, onDismiss, visible]);

  if (!isMounted) {
    return null;
  }

  const config: ToastVariantConfig = VARIANT_CONFIG[variant];
  const isLight = variant === 'successLight' || variant === 'infoLight';

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Animated.View
        style={[
          styles.toast,
          { backgroundColor: config.backgroundColor, opacity, transform: [{ translateY }] },
          isLight ? styles.toastLight : null,
        ]}
      >
        {config.icon !== null ? (
          <Ionicons name={config.icon} size={16} color={config.iconColor} style={styles.icon} />
        ) : null}
        <Text style={[styles.text, { color: config.textColor }]}>{message}</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 18,
    alignItems: 'center',
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  toastLight: {
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...getTypographyStyle('c2Caption', 'bold'),
  },
});

export default Toast;