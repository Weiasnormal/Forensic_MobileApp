import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';

interface SectionLabelProps {
  label: string;
  style?: ViewStyle;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => {
  return <Text style={[styles.label, style]}>{label}</Text>;
};

const styles = StyleSheet.create({
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 10,
  },
});

export default SectionLabel;
