import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ErrorBannerProps {
  /** The error message to display. Pass null/undefined to render nothing. */
  message?: string | null;
  /** Optional short title shown above the message (e.g. "Upload failed") */
  title?: string;
  style?: ViewStyle;
}


export default function ErrorBanner({ message, title, style }: ErrorBannerProps) {
  if (!message) return null;

  return (
    <View style={[styles.box, style]}>
      <Ionicons name="alert-circle-outline" size={18} color={colors.danger} style={styles.icon} />
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
    backgroundColor: colors.dangerLight,
    borderWidth: 1,
    borderColor: colors.dangerBorder,
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
    color: colors.danger,
    marginBottom: 2,
  },
  message: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.danger,
    lineHeight: 18,
  },
});