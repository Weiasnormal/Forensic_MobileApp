import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface PermissionDisclosureProps {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DEFAULT_MESSAGE =
  'Camera access is needed to scan signatures. Photos are used only for this case.'
export default function PermissionDisclosure({
  message = DEFAULT_MESSAGE,
  icon = 'shield-checkmark-outline',
}: PermissionDisclosureProps) {
  return (
    <View style={styles.box}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    padding: 12,
    marginBottom: 14,
  },
  iconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryLight,
  },
  text: {
    flex: 1,
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    lineHeight: 18,
  },
});