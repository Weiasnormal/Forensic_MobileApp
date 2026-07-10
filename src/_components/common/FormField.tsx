import React from 'react';
import { View, Text, TextInput, StyleSheet, ViewStyle, TouchableOpacity } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '../../constants/typography';

interface FormFieldProps {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  placeholder?: string;
  style?: ViewStyle;
  secureTextEntry?: boolean;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
  error?: string;
  focused?: boolean;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  textContentType?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  value,
  onChangeText,
  onBlur,
  onFocus,
  disabled = false,
  placeholder,
  style,
  secureTextEntry = false,
  rightIcon,
  onRightIconPress,
  error,
  focused = false,
  keyboardType = 'default',
  autoCapitalize = 'sentences',
  autoComplete,
  textContentType,
}) => {
  return (
    <View style={[styles.wrapper, style]}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.inputWrap,
          disabled && styles.inputDisabled,
          focused && styles.inputFocused,
          !!error && styles.inputErrorBorder,
        ]}
      >
        <TextInput
          style={[styles.input, rightIcon ? { paddingRight: 8 } : null]}
          value={value}
          onChangeText={onChangeText}
          onBlur={onBlur}
          onFocus={onFocus}
          editable={!disabled}
          placeholder={placeholder}
          placeholderTextColor={colors.textTertiary}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          autoComplete={autoComplete as any}
          textContentType={textContentType as any}
        />
        {rightIcon ? (
          <TouchableOpacity
            activeOpacity={0.7}
            style={styles.iconButton}
            onPress={onRightIconPress}
          >
            {rightIcon}
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
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
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: 12,
  },
  input: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13,
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
  },
  inputDisabled: {
    backgroundColor: colors.disabledBackground,
    borderColor: colors.disabledBorder,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  inputErrorBorder: {
    borderColor: colors.danger,
  },
  iconButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  errorText: {
    ...getTypographyStyle('c2Caption'),
    color: colors.danger,
    marginTop: 6,
  },
});

export default FormField;