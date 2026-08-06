import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface PermissionDisclosureProps {
  message?: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

const DEFAULT_MESSAGE =
  'Avera needs camera access to scan and digitize handwritten signatures for forensic analysis. Photos are used only for this case and are not shared outside your organization.';

export default function PermissionDisclosure({
  message = DEFAULT_MESSAGE,
  icon = 'shield-checkmark-outline',
}: PermissionDisclosureProps) {
  return (
    <View style={styles.box}>
      <Ionicons name={icon} size={16} color={colors.primary} />
      <Text style={styles.text}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.primaryLight,
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  text: {
    flex: 1,
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textPrimary,
    lineHeight: 16,
  },
});