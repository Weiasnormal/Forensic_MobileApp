import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '../../constants/typography';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  /** When true, renders a grayed-out, non-editable looking field (e.g. Role, Organization) */
  disabled?: boolean;
  placeholder?: string;
  style?: ViewStyle;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  disabled = false,
  placeholder,
  style,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={value}
        onChangeText={onChangeText}
        editable={!disabled}
        placeholder={placeholder}
        placeholderTextColor={colors.textTertiary}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginBottom: 16,
  },
  label: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
    marginBottom: 6,
  },
  input: {
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
  },
  inputDisabled: {
    color: colors.disabledText,
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBorder,
  },
});

export default FormField;
