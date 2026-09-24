import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface InfoRowProps {
  label: string;
  value: string;
  /** Optional element rendered on the right (e.g. copy icon button, chevron) */
  rightAccessory?: React.ReactNode;
  /** Optional content rendered below the label and value (e.g. a usage meter) */
  footer?: React.ReactNode;
  onPress?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, rightAccessory, footer, onPress }) => {
  const header = (
    <View style={styles.header}>
      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {rightAccessory ? <View>{rightAccessory}</View> : null}
    </View>
  );

  return (
    <View style={styles.row}>
      {onPress ? (
        <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
          {header}
        </TouchableOpacity>
      ) : (
        header
      )}
      {footer ? <View>{footer}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  row: {
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    ...getTypographyStyle('c2Caption'),
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    ...getTypographyStyle('body', 'semiBold'),
    color: colors.textPrimary,
  },
});

export default InfoRow;