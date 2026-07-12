import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { LucideIcon } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  /** Optional action rendered below the subtitle, e.g. a "Clear search" button */
  action?: React.ReactNode;
  style?: ViewStyle;
}

const EmptyState: React.FC<EmptyStateProps> = ({ icon: Icon, title, subtitle, action, style }) => {
  return (
    <View style={[styles.container, style]}>
      <View style={styles.badge}>
        <Icon size={34} color={colors.label} />
      </View>
      <Text allowFontScaling={false} style={styles.title}>{title}</Text>
      {subtitle ? (
        <Text allowFontScaling={false} style={styles.subtitle}>{subtitle}</Text>
      ) : null}
      {action ? <View style={styles.actionWrap}>{action}</View> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 10,
  },
  badge: {
    width: 68,
    height: 68,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
  },
  title: {
    ...getTypographyStyle('t3Title'),
    fontSize: 16,
    color: colors.textPrimary,
  },
  subtitle: {
    ...getTypographyStyle('c2Caption', 'regular'),
    fontSize: 12,
    lineHeight: 17,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actionWrap: {
    marginTop: 4,
  },
});

export default EmptyState;