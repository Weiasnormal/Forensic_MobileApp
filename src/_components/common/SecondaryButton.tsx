import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { ButtonSize } from './PrimaryButton';

interface SecondaryButtonProps {
  label: string;
  onPress?: () => void;
  style?: ViewStyle;
  backgroundColor?: string;
  borderColor?: string;
  textColor?: string;
  size?: ButtonSize;
  textVariant?: 'b1Button' | 'b2Button' | 'b3Button';
  textStyle?: TextStyle;
  showArrow?: boolean;
  iconColor?: string;
  iconSize?: number;
  disabled?: boolean;
}

const SIZE_CONFIG: Record<
  ButtonSize,
  {
    paddingVertical: number;
    paddingHorizontal: number;
    borderRadius: number;
    textVariant: 'b1Button' | 'b2Button' | 'b3Button';
    iconSize: number;
  }
> = {
  large: {
    paddingVertical: 18,
    paddingHorizontal: 30,
    borderRadius: 14,
    textVariant: 'b1Button',
    iconSize: 20,
  },
  medium: {
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    textVariant: 'b2Button',
    iconSize: 18,
  },
  small: {
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 10,
    textVariant: 'b3Button',
    iconSize: 16,
  },
};

const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  label,
  onPress,
  style,
  backgroundColor,
  borderColor,
  textColor,
  size = 'large',
  textVariant,
  textStyle,
  showArrow = false,
  iconColor,
  iconSize,
  disabled = false,
}) => {
  const sizeConfig = SIZE_CONFIG[size];
  const resolvedTextVariant = textVariant ?? sizeConfig.textVariant;
  const resolvedTextColor = textColor ?? colors.textSecondary;
  const resolvedBorderColor = borderColor ?? colors.border;

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
          borderColor: resolvedBorderColor,
        },
        backgroundColor ? { backgroundColor } : null,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <Text
        style={[
          styles.label,
          getTypographyStyle(resolvedTextVariant),
          { color: resolvedTextColor },
          textStyle,
          disabled && styles.disabledLabel,
        ]}
      >
        {label}
      </Text>
      {showArrow ? (
        <ArrowRight
          size={iconSize ?? sizeConfig.iconSize}
          color={iconColor ?? resolvedTextColor}
          style={styles.icon}
        />
      ) : null}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.background,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    color: colors.textSecondary,
  },
  icon: {
    marginLeft: 6,
  },
  disabledButton: {
    opacity: 0.45,
  },
  disabledLabel: {
    color: colors.textTertiary,
  },
});

export default SecondaryButton;