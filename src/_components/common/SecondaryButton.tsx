import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textVariant?: 'b1Button' | 'b2Button' | 'b3Button';
  textStyle?: TextStyle;
  disabled?: boolean;
}

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  style,
  textVariant = 'b1Button',
  textStyle,
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabledButton, style]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text style={[styles.label, getTypographyStyle(textVariant), textStyle, disabled && styles.disabledLabel]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  label: {
    color: colors.textSecondary,
  },
  disabledLabel: {
    color: colors.textTertiary,
  },
});

export default SecondaryButton;
