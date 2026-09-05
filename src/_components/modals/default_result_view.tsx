import React, { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import type { SignatureAnalysisViewMode } from '@/services/signatureAnalysis';

interface DefaultResultViewModalProps {
  visible: boolean;
  currentValue: SignatureAnalysisViewMode;
  onSave: (value: SignatureAnalysisViewMode) => void;
  onClose: () => void;
}

const OPTIONS: SignatureAnalysisViewMode[] = ['Heatmap', 'Bounding Box', 'Stroke Diff'];
const OPTION_LABELS: Record<SignatureAnalysisViewMode, string> = {
  'Heatmap': 'Heatmap',
  'Bounding Box': 'Bounding Box',
  'Stroke Diff': 'Stroke Difference',
};

export default function DefaultResultViewModal({
  visible,
  currentValue,
  onSave,
  onClose,
}: DefaultResultViewModalProps) {
  const [selected, setSelected] = useState<SignatureAnalysisViewMode>(currentValue);

  useEffect(() => {
    if (visible) setSelected(currentValue);
  }, [visible, currentValue]);

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={styles.card}>
          <Text style={styles.title}>Default Result View</Text>

          <View style={styles.optionsList}>
            {OPTIONS.map((option, index) => (
              <View key={option}>
                <Pressable style={styles.optionRow} onPress={() => setSelected(option)}>
                  <Text style={styles.optionLabel}>{OPTION_LABELS[option]}</Text>
                  <View style={[styles.radioOuter, selected === option && styles.radioOuterActive]}>
                    {selected === option ? <View style={styles.radioInner} /> : null}
                  </View>
                </Pressable>
                {index < OPTIONS.length - 1 ? <View style={styles.divider} /> : null}
              </View>
            ))}
          </View>

          <PrimaryButton
            label="Save"
            onPress={() => {
              onSave(selected);
              onClose();
            }}
            style={styles.saveButton}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.48)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: colors.background2,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 26,
  },
  title: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 18,
  },
  optionsList: {
    marginBottom: 22,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  optionLabel: {
    ...getTypographyStyle('body', 'semiBold'),
    color: colors.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioOuterActive: {
    borderColor: colors.primary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  saveButton: {
    width: '100%',
  },
});