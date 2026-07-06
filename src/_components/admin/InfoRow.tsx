import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

interface InfoRowProps {
  label: string;
  value: string;
  /** Optional element rendered on the right (e.g. copy icon button, chevron) */
  rightAccessory?: React.ReactNode;
  onPress?: () => void;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, rightAccessory, onPress }) => {
  const content = (
    <>
      <View style={styles.textWrapper}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value}</Text>
      </View>
      {rightAccessory ? <View>{rightAccessory}</View> : null}
    </>
  );

  if (onPress) {
    return (
      <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
        {content}
      </TouchableOpacity>
    );
  }

  return <View style={styles.row}>{content}</View>;
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  textWrapper: {
    flex: 1,
  },
  label: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 4,
  },
  value: {
    fontSize: 15.5,
    fontWeight: '700',
    color: colors.textPrimary,
  },
});

export default InfoRow;
