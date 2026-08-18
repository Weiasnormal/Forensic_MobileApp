import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

interface ScanPlaceholderProps {
  label: string;
  filename: string;
  uri: string | null;
  accentColor?: string;
  onPress: () => void;
}

export default function ScanPlaceholder({
  label,
  filename,
  uri,
  accentColor = colors.primary,
  onPress,
}: ScanPlaceholderProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { borderColor: uri ? accentColor : colors.uploadSlotBorder },
        uri && styles.filled,
      ]}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} />
          <View style={[styles.checkPill, { backgroundColor: accentColor }]}>
            <Ionicons name="checkmark" size={12} color="#FFFFFF" />
          </View>
        </>
      ) : (
        <View style={styles.placeholderContent}>
          <View style={[styles.plusCircle, { borderColor: accentColor }]}>
            <Ionicons name="scan" size={20} color={accentColor} />
          </View>
          <Text style={styles.label}>{label}</Text>
        </View>
      )}

      <Text style={styles.filename} numberOfLines={1}>
        {filename}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1.3,
    borderStyle: 'dashed',
    borderRadius: 14,
    backgroundColor: colors.cardBackground,
    minHeight: 140,
    justifyContent: 'center',
    overflow: 'hidden',
    padding: 8,
  },
  filled: { borderStyle: 'solid' },
  image: { ...StyleSheet.absoluteFillObject },
  placeholderContent: { alignItems: 'center', justifyContent: 'center', gap: 8, flex: 1 },
  plusCircle: { width: 40, height: 40, borderRadius: 20, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  label: { ...getTypographyStyle('c2Caption'), color: colors.textPrimary, textAlign: 'center' },
  checkPill: { position: 'absolute', top: 8, left: 8, borderRadius: 999, width: 20, height: 20, alignItems: 'center', justifyContent: 'center' },
  filename: {
    ...getTypographyStyle('c3Caption'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
});