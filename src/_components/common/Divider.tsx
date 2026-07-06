import React from 'react';
import { View, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';

const Divider: React.FC = () => {
  return <View style={styles.line} />;
};

const styles = StyleSheet.create({
  line: {
    height: 1,
    backgroundColor: colors.border,
    marginHorizontal: -16,
  },
});

export default Divider;
