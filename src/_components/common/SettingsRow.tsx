import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { ChevronRight, LucideIcon } from 'lucide-react-native';
import { colors } from '../../constants/colors';
import { getTypographyStyle } from '../../constants/typography';

interface SettingsRowProps {
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  /** Optional gray text shown on the right, before the chevron (e.g. "PNP Crime Laboratory", "v1.0.0") */
  rightText?: string;
  showChevron?: boolean;
  onPress?: () => void;
}

const SettingsRow: React.FC<SettingsRowProps> = ({
  icon: Icon,
  title,
  subtitle,
  rightText,
  showChevron = true,
  onPress,
}) => {
  return (
    <TouchableOpacity style={styles.row} onPress={onPress} activeOpacity={0.7}>
      {Icon ? (
        <View style={styles.iconWrapper}>
          <Icon size={18} color={colors.textPrimary} />
        </View>
      ) : null}

      <View style={styles.textWrapper}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightText ? (
        <Text style={styles.rightText} numberOfLines={1} ellipsizeMode="tail">
          {rightText}
        </Text>
      ) : null}
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
    ...getTypographyStyle('c1Caption'),
    color: colors.textPrimary,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
    marginTop: 2,
  },
  rightText: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textTertiary,
    marginRight: 6,
    flexShrink: 1,
    maxWidth: '45%',
  },
});

export default SettingsRow;
