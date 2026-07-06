import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';

interface DangerRowProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  showChevron?: boolean;
  onPress?: () => void;
}

const DangerRow: React.FC<DangerRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  showChevron = true,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.iconWrapper}>
        <Icon size={18} color={colors.danger} />
      </View>

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {showChevron && <ChevronRight size={18} color={colors.textTertiary} />}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconWrapper: {
    width: 32,
    marginRight: 4,
  },
  textWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.danger,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
});

export default DangerRow;
