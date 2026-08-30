import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export type ToastVariant = 'neutral' | 'success';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
  variant?: ToastVariant;
}

const Toast: React.FC<ToastProps> = ({
  visible,
  message,
  duration = 2000,
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

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <Animated.View style={[styles.toast, { opacity, transform: [{ translateY }] }]}>
        {variant === 'success' ? (
          <Ionicons name="checkmark-circle" size={16} color={colors.statusGenuine} style={styles.icon} />
        ) : null}
        <Text style={styles.text}>{message}</Text>
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
    backgroundColor: '#0F172A',
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  icon: {
    marginRight: 6,
  },
  text: {
    ...getTypographyStyle('c2Caption'),
    color: colors.primaryText,
  },
});


export default Toast;

