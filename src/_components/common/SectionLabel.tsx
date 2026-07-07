import React from 'react';
import { Text, StyleSheet, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '../../constants/typography';

interface SectionLabelProps {
  label: string;
  style?: ViewStyle;
}

const SectionLabel: React.FC<SectionLabelProps> = ({ label, style }) => {
  return <Text style={[styles.label, style]}>{label}</Text>;
};

const styles = StyleSheet.create({
  label: {
    ...getTypographyStyle('headline'),
    color: colors.textSecondary,
    marginBottom: 10,
  },
});

export default SectionLabel;
