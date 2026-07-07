import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '../../constants/colors';
import { getTypographyStyle } from '../../constants/typography';

interface SignOutButtonProps {
  onPress?: () => void;
  style?: ViewStyle;
}

const SignOutButton: React.FC<SignOutButtonProps> = ({ onPress, style }) => {
  return (
    <TouchableOpacity style={[styles.button, style]} onPress={onPress} activeOpacity={0.7}>
      <Text style={styles.label}>Sign out</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    ...getTypographyStyle('b1Button', 'bold'),
    color: colors.danger,
  },
});

export default SignOutButton;
