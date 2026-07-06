import { ArrowRight } from 'lucide-react-native';
import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { ButtonSize } from './PrimaryButton';

interface TertiaryButtonProps {
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
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    textVariant: 'b1Button',
    iconSize: 20,
  },
  medium: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    textVariant: 'b2Button',
    iconSize: 18,
  },
  small: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    textVariant: 'b3Button',
    iconSize: 16,
  },
};

const TertiaryButton: React.FC<TertiaryButtonProps> = ({
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

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          paddingVertical: sizeConfig.paddingVertical,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: sizeConfig.borderRadius,
        },
        backgroundColor ? { backgroundColor } : null,
        borderColor ? { borderWidth: 1, borderColor } : null,
        disabled && styles.disabledButton,
        style,
      ]}
      onPress={onPress}
      activeOpacity={0.75}
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
    backgroundColor: 'transparent',
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

export default TertiaryButton;