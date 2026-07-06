import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface ToggleRowProps {
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
}

const ToggleRow: React.FC<ToggleRowProps> = ({ title, subtitle, value, onValueChange }) => {
  return (
    <View style={styles.row}>
      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: colors.border, true: colors.primary }}
        thumbColor={colors.background}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
  },
  textWrapper: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default ToggleRow;
