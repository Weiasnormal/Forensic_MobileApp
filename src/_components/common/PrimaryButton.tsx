import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface PrimaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  textVariant?: 'b1Button' | 'b2Button' | 'b3Button';
  textStyle?: TextStyle;
}

const PrimaryButton: React.FC<PrimaryButtonProps> = ({
  label,
  onPress,
  style,
  textVariant = 'b1Button',
  textStyle,
}) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.85}>
      <Text style={[styles.label, getTypographyStyle(textVariant), textStyle]}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.primaryText,
  },
});

export default PrimaryButton;
