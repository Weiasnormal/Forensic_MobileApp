import React, { useEffect } from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ToastProps {
  visible: boolean;
  message: string;
  duration?: number;
  onDismiss?: () => void;
  style?: ViewStyle;
}

const Toast: React.FC<ToastProps> = ({ visible, message, duration = 2000, onDismiss, style }) => {
  useEffect(() => {
    if (!visible || !onDismiss) {
      return;
    }

    const timeout = setTimeout(() => onDismiss(), duration);
    return () => clearTimeout(timeout);
  }, [duration, onDismiss, visible]);

  if (!visible) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.wrap, style]}>
      <View style={styles.toast}>
        <Text style={styles.text}>{message}</Text>
      </View>
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
  text: {
    ...getTypographyStyle('c2Caption'),
    color: colors.primaryText,
  },
});

export default Toast;