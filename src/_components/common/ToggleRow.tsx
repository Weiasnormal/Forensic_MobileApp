import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '../../constants/typography';
import ToggleSwitch from './ToggleSwitch';

interface ToggleRowProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  value: boolean;
  onValueChange?: (value: boolean) => void;
  disabled?: boolean;
}

const ToggleRow: React.FC<ToggleRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  value,
  onValueChange,
  disabled = false,
}) => {
  return (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        {Icon ? (
          <View style={styles.iconWrapper}>
            <Icon size={18} color={colors.textPrimary} />
          </View>
        ) : null}

        <View style={styles.textWrapper}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <ToggleSwitch value={value} onValueChange={onValueChange} disabled={disabled} />
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  rowLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    width: 32,
    marginRight: 4,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textPrimary,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default ToggleRow;
