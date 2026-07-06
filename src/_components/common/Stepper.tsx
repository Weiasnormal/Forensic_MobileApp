import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface StepperProps {
  value: number;
  onDecrease?: () => void;
  onIncrease?: () => void;
}

const Stepper: React.FC<StepperProps> = ({ value, onDecrease, onIncrease }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.circleButton} onPress={onDecrease} activeOpacity={0.7}>
        <Minus size={16} color={colors.textPrimary} />
      </TouchableOpacity>

      <Text style={styles.value}>{value}</Text>

      <TouchableOpacity style={styles.circleButton} onPress={onIncrease} activeOpacity={0.7}>
        <Plus size={16} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  circleButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginHorizontal: 14,
    minWidth: 18,
    textAlign: 'center',
  },
});

export default Stepper;
