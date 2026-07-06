import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronLeft } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ScreenHeaderProps {
  title: string;
  onBackPress?: () => void;
}

const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, onBackPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={onBackPress} activeOpacity={0.7}>
        <ChevronLeft size={18} color="#A7B2C3" strokeWidth={2.1} />
      </TouchableOpacity>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {/* Spacer keeps the title visually centered against the back button */}
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E7EDF5',
    backgroundColor: colors.background2,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E1E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background2,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    marginHorizontal: 8,
  },
  spacer: {
    width: 36,
  },
});

export default ScreenHeader;
