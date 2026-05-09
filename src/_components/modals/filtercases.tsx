import React, { useState } from 'react';
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

import { useBottomSheetTransition } from '../transition';

interface FilterCasesModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (filters: {
    sortBy: string;
    verdict: string | null;
    analysisType: string | null;
  }) => void;
}

const sortOptions = ['Newest first', 'Oldest first', 'Suspected First', 'Genuine First'];
const verdictOptions = ['All', 'Genuine', 'Suspected', 'Processing'];
const analysisOptions = ['All', 'Signature', 'Handwriting'];

export default function FilterCasesModal({ visible, onClose, onApply }: FilterCasesModalProps) {
  const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers } = useBottomSheetTransition({
    visible,
    onClose,
  });

  const [sortBy, setSortBy] = useState<string>(sortOptions[0]);
  const [verdict, setVerdict] = useState<string | null>('All');
  const [analysisType, setAnalysisType] = useState<string | null>('All');

  if (!isMounted) return null;

  const handleApply = () => {
    onApply?.({ sortBy, verdict, analysisType });
    onClose();
  };

  return (
    <Modal visible={isMounted} transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]}>
          <View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <Text style={styles.title}>Sort & Filter</Text>

          <Text style={styles.sectionLabel}>SORT BY</Text>
          <View style={styles.rowWrap}>
            {sortOptions.map((opt) => (
              <Chip key={opt} label={opt} selected={sortBy === opt} onPress={() => setSortBy(opt)} />
            ))}
          </View>

          <View style={styles.sep} />

          <Text style={styles.sectionLabel}>VERDICT</Text>
          <View style={styles.rowWrap}>
            {verdictOptions.map((opt) => (
              <Pill key={opt} label={opt} selected={verdict === opt} onPress={() => setVerdict(opt)} />
            ))}
          </View>

          <View style={styles.sep} />

          <Text style={styles.sectionLabel}>ANALYSIS TYPE</Text>
          <View style={styles.rowWrap}>
            {analysisOptions.map((opt) => (
              <Pill key={opt} label={opt} selected={analysisType === opt} onPress={() => setAnalysisType(opt)} />
            ))}
          </View>

          <TouchableOpacity style={styles.applyButton} activeOpacity={0.9} onPress={handleApply}>
            <Text style={styles.applyText}>Apply</Text>
          </TouchableOpacity>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[styles.chip, selected ? styles.chipSelected : styles.chipOutline]}
    >
      <Text style={[styles.chipText, selected ? styles.chipTextSelected : styles.chipTextOutline]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function Pill({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.86}
      style={[styles.pill, selected ? styles.pillSelected : styles.pillOutline]}
    >
      <Text style={[styles.pillText, selected ? styles.pillTextSelected : styles.pillTextOutline]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(15,23,42,0.56)' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: '#E7EFFC',
  },
  dragHandleWrap: { alignItems: 'center', paddingBottom: 8 },
  dragHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: '#D9E2EE', marginBottom: 6 },
  title: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginBottom: 12 },
  sectionLabel: { fontSize: 12, color: '#94A3B8', fontWeight: '700', marginBottom: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  sep: { height: 1, backgroundColor: '#EEF2FF', marginVertical: 12 },

  chip: {
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    minWidth: 86,
    alignItems: 'center',
  },
  chipOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E6EEF9',
  },
  chipSelected: {
    backgroundColor: '#1F5DA8',
  },
  chipText: { fontSize: 13, fontWeight: '800' },
  chipTextOutline: { color: '#0F172A' },
  chipTextSelected: { color: '#FFFFFF' },

  pill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 1,
  },
  pillOutline: { backgroundColor: '#FFFFFF', borderColor: '#E6EEF9' },
  pillSelected: { backgroundColor: '#1F5DA8', borderColor: '#1F5DA8' },
  pillText: { fontSize: 13, fontWeight: '700' },
  pillTextOutline: { color: '#0F172A' },
  pillTextSelected: { color: '#FFFFFF' },

  applyButton: {
    marginTop: 14,
    width: '100%',
    backgroundColor: '#1F5DA8',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  applyText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
});
