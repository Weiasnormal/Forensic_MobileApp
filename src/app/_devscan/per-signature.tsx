import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanForensicDocument } from '@/_components/modals/media_source_picker';
import {
  CapsuleTabs,
  ScanPlaceholder,
  buildSequenceFilename,
  generateFilenameSequence,
  saveScanLocally,
} from '@/_components/devscan';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

type ScanCategoryKey = 'genuine' | 'forged';

interface SlotState {
  uri: string | null;
  filename: string;
}

const GENUINE_COUNT = 5;
const FORGED_COUNT = 4;
const DEFAULT_PREFIX = 'ML001';

function buildInitialSlots(category: 'G' | 'F', count: number): SlotState[] {
  const filenames = generateFilenameSequence(
    buildSequenceFilename(DEFAULT_PREFIX, category, 1, 2),
    count,
    DEFAULT_PREFIX,
    category,
  );
  return filenames.map((filename) => ({ uri: null, filename }));
}

export default function PerSignatureScanScreen() {
  const router = useRouter();
  const nav = router as any;

  const [activeTab, setActiveTab] = useState<ScanCategoryKey>('genuine');
  const [genuineSlots, setGenuineSlots] = useState<SlotState[]>(() => buildInitialSlots('G', GENUINE_COUNT));
  const [forgedSlots, setForgedSlots] = useState<SlotState[]>(() => buildInitialSlots('F', FORGED_COUNT));
  const [genuineStartInput, setGenuineStartInput] = useState(() => genuineSlots[0].filename.replace(/\.png$/i, ''));
  const [forgedStartInput, setForgedStartInput] = useState(() => forgedSlots[0].filename.replace(/\.png$/i, ''));

  const isGenuine = activeTab === 'genuine';
  const slots = isGenuine ? genuineSlots : forgedSlots;
  const setSlots = isGenuine ? setGenuineSlots : setForgedSlots;
  const startInput = isGenuine ? genuineStartInput : forgedStartInput;
  const setStartInput = isGenuine ? setGenuineStartInput : setForgedStartInput;
  const categoryLetter: 'G' | 'F' = isGenuine ? 'G' : 'F';
  const count = isGenuine ? GENUINE_COUNT : FORGED_COUNT;
  const accentColor = isGenuine ? colors.statusGenuine : colors.danger;

  const applyStartingFilename = (value: string) => {
    setStartInput(value);
    const filenames = generateFilenameSequence(value, count, DEFAULT_PREFIX, categoryLetter);

    setSlots((prev) =>
      filenames.map((filename, index) => ({
        uri: prev[index]?.uri ?? null,
        filename,
      })),
    );
  };

  const handleScanSlot = async (index: number) => {
    await scanForensicDocument((uri) => {
      setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, uri } : slot)));
    });
  };

  const handleExport = async () => {
    const filledSlots = slots.filter((slot) => slot.uri);

    if (filledSlots.length === 0) {
      Alert.alert('Nothing to export', `Scan at least one ${isGenuine ? 'genuine' : 'forged'} signature first.`);
      return;
    }

    try {
      let savedCount = 0;
      for (const slot of filledSlots) {
        if (!slot.uri) continue;
        await saveScanLocally(slot.uri, slot.filename);
        savedCount += 1;
      }

      Alert.alert('Exported locally', `Saved ${savedCount} ${isGenuine ? 'genuine' : 'forged'} signature(s) to local storage.`);
    } catch (error) {
      console.warn('[PerSignatureScan] export failed', error);
      Alert.alert('Export failed', 'Unable to export one or more signature images.');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Per Signature Scan" onBackPress={() => nav.back()} />

      <View style={styles.tabsWrap}>
        <CapsuleTabs
          tabs={[
            { key: 'genuine', label: 'Genuine' },
            { key: 'forged', label: 'Forged' },
          ]}
          activeKey={activeTab}
          onChange={setActiveTab}
        />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.field}>
          <Text style={styles.fieldLabel}>Starting file name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={startInput}
              onChangeText={applyStartingFilename}
              placeholder={`${DEFAULT_PREFIX}_${categoryLetter}_01`}
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
            />
            <Text style={styles.extensionTag}>.png</Text>
          </View>
          <Text style={styles.helperText}>
            The remaining {count - 1} slot{count - 1 === 1 ? '' : 's'} increment automatically from this filename.
          </Text>
        </View>

        <View style={styles.grid}>
          {slots.map((slot, index) => (
            <View key={`${activeTab}-${index}`} style={styles.slotWrapper}>
              <ScanPlaceholder
                label={`Signature ${index + 1}`}
                filename={slot.filename}
                uri={slot.uri}
                accentColor={accentColor}
                onPress={() => handleScanSlot(index)}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <PrimaryButton label={`Export ${isGenuine ? 'Genuine' : 'Forged'} PNGs`} onPress={handleExport} size="medium" />
      </View>
    </SafeAreaView>
  );
}

function TopBar({ title, onBackPress }: { title: string; onBackPress: () => void }) {
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backButtonBox}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        <View style={{ width: 36 }} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background2 },
  topBarWrapper: { backgroundColor: colors.background2, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backButton: { padding: 4 },
  backButtonBox: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, ...getTypographyStyle('t3Title'), color: colors.textPrimary, textAlign: 'center' },
  tabsWrap: { paddingHorizontal: 16, paddingTop: 14 },
  content: { padding: 16, paddingBottom: 120, gap: 16 },
  field: { gap: 8 },
  fieldLabel: { ...getTypographyStyle('c1Caption'), color: colors.textSecondary },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  input: { flex: 1, ...getTypographyStyle('body'), color: colors.textPrimary, paddingVertical: 13 },
  extensionTag: { ...getTypographyStyle('c2Caption'), color: colors.textTertiary },
  helperText: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textTertiary },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotWrapper: { width: '47%' },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});