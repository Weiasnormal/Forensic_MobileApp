import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, View, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanForensicDocument } from '@/_components/modals/media_source_picker';
import {
  CapsuleTabs,
  ScanPlaceholder,
  buildSequenceFilename,
  generateFilenameSequence,
  ensureCaseFolders,
  writeImageToFolder,
  getLastCaseFolder,
  hasStoredRootDirectory,
  type CaseFolders,
  type ScanSlotStatus,
} from '@/_components/devscan';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

type ScanCategoryKey = 'genuine' | 'forged';

interface SlotState {
  uri: string | null;
  filename: string;
  status: ScanSlotStatus;
}

const GENUINE_COUNT = 5;
const FORGED_COUNT = 4;
const DEFAULT_CASE_FOLDER = 'P001';

function buildInitialSlots(prefix: string, category: 'G' | 'F', count: number): SlotState[] {
  const filenames = generateFilenameSequence(
    buildSequenceFilename(prefix, category, 1, 2),
    count,
    prefix,
    category,
  );
  return filenames.map((filename) => ({ uri: null, filename, status: 'empty' as const }));
}

export default function PerSignatureScanScreen() {
  const router = useRouter();
  const nav = router as any;

  const [caseFolderInput, setCaseFolderInput] = useState(DEFAULT_CASE_FOLDER);
  const [activeCaseFolder, setActiveCaseFolder] = useState<string | null>(null);
  const [caseFolderUri, setCaseFolderUri] = useState<string | null>(null);
  const [flaggedFolderUri, setFlaggedFolderUri] = useState<string | null>(null);
  const [displayPath, setDisplayPath] = useState<string | null>(null);
  const [isResolvingFolder, setIsResolvingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ScanCategoryKey>('genuine');
  const [genuineSlots, setGenuineSlots] = useState<SlotState[]>(() => buildInitialSlots(DEFAULT_CASE_FOLDER, 'G', GENUINE_COUNT));
  const [forgedSlots, setForgedSlots] = useState<SlotState[]>(() => buildInitialSlots(DEFAULT_CASE_FOLDER, 'F', FORGED_COUNT));
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

  // Auto-resolve on mount only if the user already granted folder access previously.
  // Never auto-prompt — the system folder picker only opens via the explicit "Set Folder" button.
  useEffect(() => {
    (async () => {
      const last = await getLastCaseFolder();
      const nameToUse = last ?? DEFAULT_CASE_FOLDER;
      if (last) setCaseFolderInput(last);

      const hasRoot = await hasStoredRootDirectory();
      if (!hasRoot) return;

      try {
        const folders = await ensureCaseFolders(nameToUse);
        applyResolvedFolder(nameToUse, folders, false);
      } catch (error) {
        console.warn('[PerSignatureScan] auto-resolve folder failed', error);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyResolvedFolder = (name: string, folders: CaseFolders, resetSlots: boolean) => {
    setActiveCaseFolder(name);
    setCaseFolderUri(folders.caseFolderUri);
    setFlaggedFolderUri(folders.flaggedFolderUri);
    setDisplayPath(folders.displayPath);

    if (resetSlots) {
      const nextGenuine = buildInitialSlots(name, 'G', GENUINE_COUNT);
      const nextForged = buildInitialSlots(name, 'F', FORGED_COUNT);
      setGenuineSlots(nextGenuine);
      setForgedSlots(nextForged);
      setGenuineStartInput(nextGenuine[0].filename.replace(/\.png$/i, ''));
      setForgedStartInput(nextForged[0].filename.replace(/\.png$/i, ''));
    }
  };

  const handleSetFolder = async () => {
    const name = caseFolderInput.trim();
    if (!name) {
      Alert.alert('Folder name required', 'Enter a case folder name, e.g. P001.');
      return;
    }

    setIsResolvingFolder(true);
    setFolderError(null);
    try {
      const folders = await ensureCaseFolders(name);
      // Only reset in-progress captures if the folder actually changed —
      // re-confirming the same folder shouldn't wipe unsaved scans.
      applyResolvedFolder(name, folders, name !== activeCaseFolder);
    } catch (error) {
      console.warn('[PerSignatureScan] set folder failed', error);
      setFolderError('Could not access or create that folder. Try again.');
    } finally {
      setIsResolvingFolder(false);
    }
  };

  const applyStartingFilename = (value: string) => {
    setStartInput(value);
    const prefix = activeCaseFolder ?? caseFolderInput.trim() ?? DEFAULT_CASE_FOLDER;
    const filenames = generateFilenameSequence(value, count, prefix, categoryLetter);

    setSlots((prev) =>
      filenames.map((filename, index) => ({
        uri: prev[index]?.uri ?? null,
        filename,
        status: prev[index]?.status ?? 'empty',
      })),
    );
  };

  const handleScanSlot = async (index: number) => {
    await scanForensicDocument((uri) => {
      setSlots((prev) => prev.map((slot, i) => (i === index ? { ...slot, uri, status: 'captured' } : slot)));
    });
  };

  const handleSaveSlot = async (index: number, flagged: boolean) => {
    const slot = slots[index];
    if (!slot.uri) return;

    if (!caseFolderUri || !flaggedFolderUri) {
      Alert.alert('Set a folder first', 'Tap "Set Folder" above and choose your Download folder before saving.');
      return;
    }

    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, status: 'saving' } : s)));

    try {
      await writeImageToFolder(slot.uri, caseFolderUri, slot.filename);
      if (flagged) {
        await writeImageToFolder(slot.uri, flaggedFolderUri, slot.filename);
      }
      setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, status: flagged ? 'flagged' : 'saved' } : s)));
    } catch (error) {
      console.warn('[PerSignatureScan] save failed', error);
      Alert.alert('Save failed', 'Unable to write this image to storage. Try again.');
      setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, status: 'captured' } : s)));
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Per Signature Scan" onBackPress={() => nav.back()} />

      <View style={styles.folderCard}>
        <Text style={styles.fieldLabel}>Case folder</Text>
        <View style={styles.folderRow}>
          <View style={[styles.inputWrap, styles.folderInputWrap]}>
            <TextInput
              value={caseFolderInput}
              onChangeText={setCaseFolderInput}
              placeholder="P001"
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              autoCapitalize="characters"
              autoCorrect={false}
            />
          </View>
          <PrimaryButton
            label={isResolvingFolder ? 'Setting...' : 'Set Folder'}
            onPress={handleSetFolder}
            size="small"
            loading={isResolvingFolder}
            style={styles.setFolderButton}
          />
        </View>
        {displayPath ? (
          <Text style={styles.helperText} numberOfLines={2}>Saving to: {displayPath}</Text>
        ) : (
          <Text style={styles.helperText}>Tap &quot;Set Folder&quot; to choose your Download folder and create this case.</Text>
        )}
        {folderError ? <Text style={styles.errorText}>{folderError}</Text> : null}
      </View>

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
              placeholder={`${activeCaseFolder ?? DEFAULT_CASE_FOLDER}_${categoryLetter}_01`}
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
                status={slot.status}
                onSave={() => handleSaveSlot(index, false)}
                onSaveFlagged={() => handleSaveSlot(index, true)}
              />
            </View>
          ))}
        </View>
      </ScrollView>
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
  folderCard: {
    marginHorizontal: 16,
    marginTop: 14,
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.cardBackground,
    gap: 8,
  },
  folderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  folderInputWrap: { flex: 1 },
  setFolderButton: { minWidth: 110 },
  tabsWrap: { paddingHorizontal: 16, paddingTop: 14 },
  content: { padding: 16, paddingBottom: 32, gap: 16 },
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
  errorText: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.danger },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  slotWrapper: { width: '47%' },
});