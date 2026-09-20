import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import React from 'react';
import { Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';

interface EmptyStateCardProps {
  /** Illustration to show on the left. Pass a require(...) or {uri} source.
   *  Leave undefined to render a placeholder box — swap in the real asset later. */
  icon?: ImageSourcePropType;
  title: string;
  /** Optional second line under the title, e.g. a longer explanation. */
  subtitle?: string;
}

export default function EmptyStateCard({ icon, title, subtitle }: EmptyStateCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        {icon ? (
          <Image source={icon} style={styles.icon} resizeMode="contain" />
        ) : (
          <View style={styles.iconPlaceholder} />
        )}
      </View>

      <View style={styles.textWrap}>
        <Text allowFontScaling={false} style={styles.title}>
          {title}
        </Text>
        {subtitle ? (
          <Text allowFontScaling={false} style={styles.subtitle}>
            {subtitle}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.cardBackground,
    borderRadius: 18,
    padding: 5,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    width: 50,
    height: 50,
  },
  iconPlaceholder: {
    width: 34,
    height: 34,
    borderRadius: 8,
    borderWidth: 1.5,
    borderStyle: 'dashed',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...getTypographyStyle('c1Caption', 'bold'), 
    color: colors.textSecondary,
  },
  subtitle: {
    ...getTypographyStyle('c2Caption', 'regular'),
    color: colors.textTertiary,
    marginTop: 2,
  },
});