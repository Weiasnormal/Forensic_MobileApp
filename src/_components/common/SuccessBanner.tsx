import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface SuccessBannerProps {
  message?: string | null;
  title?: string;
  style?: ViewStyle;
}

export default function SuccessBanner({ message, title, style }: SuccessBannerProps) {
  if (!message) return null;

  return (
    <View style={[styles.box, style]}>
      <Ionicons name="checkmark-circle-outline" size={18} color={colors.statusGenuine} style={styles.icon} />
      <View style={styles.textWrap}>
        {title ? <Text style={styles.title}>{title}</Text> : null}
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.statusGenuineBg,
    borderWidth: 1,
    borderColor: colors.statusGenuine,
    borderRadius: 10,
    padding: 12,
    marginBottom: 14,
  },
  icon: {
    marginTop: 1,
  },
  textWrap: {
    flex: 1,
  },
  title: {
    ...getTypographyStyle('c1Caption', 'bold'),
    color: colors.statusGenuine,
    marginBottom: 2,
  },
  message: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.statusGenuine,
    lineHeight: 18,
  },
});