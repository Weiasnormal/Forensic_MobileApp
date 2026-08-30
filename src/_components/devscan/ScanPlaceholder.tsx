import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';

export type ScanSlotStatus = 'empty' | 'captured' | 'saving' | 'saved' | 'flagged';

interface ScanPlaceholderProps {
  label: string;
  filename: string;
  uri: string | null;
  accentColor?: string;
  onPress: () => void;
  /**
   * Optional. Omit for the original tap-anywhere-to-scan / checkmark-pill behavior.
   * Pass it to unlock the capture -> Save / Save Flagged -> saved/flagged flow.
   */
  status?: ScanSlotStatus;
  onSave?: () => void;
  onSaveFlagged?: () => void;
  onReplace?: () => void;
  onDelete?: () => void;
}

export default function ScanPlaceholder({
  label,
  filename,
  uri,
  accentColor = colors.primary,
  onPress,
  status,
  onSave,
  onSaveFlagged,
  onReplace,
  onDelete,
}: ScanPlaceholderProps) {
  const isExtended = status !== undefined;
  const isBusy = status === 'saving';
  // Tap-to-scan stays live for: legacy mode, an empty slot, or retaking a saved/flagged one.
  // It's disabled mid-capture so the Save / Save Flagged buttons are the only way forward.
  const tapToScanEnabled = !isExtended || status === 'empty' || status === 'saved' || status === 'flagged';
  const showReplaceButton = !!onReplace && !!uri && (status === 'saved' || status === 'flagged');

  return (
    <Pressable
      onPress={tapToScanEnabled ? onPress : undefined}
      disabled={!tapToScanEnabled}
      style={[
        styles.container,
        { borderColor: uri ? accentColor : colors.uploadSlotBorder },
        uri && styles.filled,
      ]}
    >
      {uri ? (
        <>
          <Image source={{ uri }} style={styles.image} />
          {!!onDelete && (
            <Pressable
              style={styles.clearImageButton}
              onPress={(event) => {
                event.stopPropagation();
                onDelete();
              }}
              hitSlop={8}
            >
              <Ionicons name="trash" size={14} color={colors.textPrimary} />
            </Pressable>
          )}
          {(!isExtended || status === 'saved') && (
            <View style={[styles.checkPill, { backgroundColor: accentColor }]}>
              <Ionicons name="checkmark" size={12} color="#FFFFFF" />
            </View>
          )}
          {isExtended && status === 'flagged' && (
            <View style={[styles.checkPill, { backgroundColor: colors.warningIcon }]}>
              <Ionicons name="flag" size={12} color="#FFFFFF" />
            </View>
          )}
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

      {showReplaceButton && (
        <View style={styles.replaceRow}>
          <SecondaryButton
            label="Replace"
            onPress={onReplace}
            size="small"
            style={styles.actionButton}
          />
        </View>
      )}

      {isExtended && (status === 'captured' || status === 'saving') && (
        <View style={styles.actionRow}>
          <PrimaryButton
            label="Save"
            onPress={onSave!}
            size="small"
            loading={isBusy}
            disabled={isBusy}
            style={styles.actionButton}
          />
          <SecondaryButton
            label="Save Flagged"
            onPress={onSaveFlagged!}
            size="small"
            disabled={isBusy}
            style={styles.actionButton}
          />
          {onReplace && (
            <SecondaryButton
              label="Replace"
              onPress={onReplace}
              size="small"
              style={styles.actionButton}
            />
          )}
        </View>
      )}
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
  clearImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    zIndex: 2,
  },
  filename: {
    ...getTypographyStyle('c3Caption'),
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
  },
  replaceRow: {
    marginTop: 6,
  },
  actionRow: {
    marginTop: 6,
    gap: 6,
  },
  actionButton: {
    width: '100%',
  },
});