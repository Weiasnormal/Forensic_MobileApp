import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanForensicDocument } from '@/_components/modals/media_source_picker';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import {
  ensureCaseFolders,
  writeImageToFolder,
  getLastCaseFolder,
  hasStoredRootDirectory,
} from '@/_components/devscan';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

const DEFAULT_FILENAME = 'FS_MLkitDataset_000';
const DEFAULT_CASE_FOLDER = 'P001';

type SlotStatus = 'empty' | 'captured' | 'saving' | 'saved' | 'flagged';

export default function WholePageScanScreen() {
  const router = useRouter();
  const nav = router as any;

  const [caseFolderInput, setCaseFolderInput] = useState(DEFAULT_CASE_FOLDER);
  const [, setActiveCaseFolder] = useState<string | null>(null);
  const [caseFolderUri, setCaseFolderUri] = useState<string | null>(null);
  const [flaggedFolderUri, setFlaggedFolderUri] = useState<string | null>(null);
  const [displayPath, setDisplayPath] = useState<string | null>(null);
  const [isResolvingFolder, setIsResolvingFolder] = useState(false);
  const [folderError, setFolderError] = useState<string | null>(null);

  const [scannedUri, setScannedUri] = useState<string | null>(null);
  const [filename, setFilename] = useState(DEFAULT_FILENAME);
  const [status, setStatus] = useState<SlotStatus>('empty');
  const [savedPath, setSavedPath] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const last = await getLastCaseFolder();
      const nameToUse = last ?? DEFAULT_CASE_FOLDER;
      if (last) setCaseFolderInput(last);

      const hasRoot = await hasStoredRootDirectory();
      if (!hasRoot) return;

      try {
        const folders = await ensureCaseFolders(nameToUse);
        setActiveCaseFolder(nameToUse);
        setCaseFolderUri(folders.caseFolderUri);
        setFlaggedFolderUri(folders.flaggedFolderUri);
        setDisplayPath(folders.displayPath);
      } catch (error) {
        console.warn('[WholePageScan] auto-resolve folder failed', error);
      }
    })();
  }, []);

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
      setActiveCaseFolder(name);
      setCaseFolderUri(folders.caseFolderUri);
      setFlaggedFolderUri(folders.flaggedFolderUri);
      setDisplayPath(folders.displayPath);
    } catch (error) {
      console.warn('[WholePageScan] set folder failed', error);
      setFolderError('Could not access or create that folder. Try again.');
    } finally {
      setIsResolvingFolder(false);
    }
  };

  const handleScan = async () => {
    setSavedPath(null);
    await scanForensicDocument((uri) => {
      setScannedUri(uri);
      setStatus('captured');
    });
  };

  const handleSave = async (flagged: boolean) => {
    if (!scannedUri) {
      Alert.alert('Nothing to save', 'Scan a page first.');
      return;
    }
    if (!caseFolderUri || !flaggedFolderUri) {
      Alert.alert('Set a folder first', 'Tap "Set Folder" above and choose your Download folder before saving.');
      return;
    }

    setStatus('saving');
    try {
      const targetFilename = `${filename.replace(/\.png$/i, '')}.png`;
      const targetUri = await writeImageToFolder(scannedUri, caseFolderUri, targetFilename);
      if (flagged) {
        await writeImageToFolder(scannedUri, flaggedFolderUri, targetFilename);
      }
      setSavedPath(targetUri);
      setStatus(flagged ? 'flagged' : 'saved');
    } catch (error) {
      console.warn('[WholePageScan] save failed', error);
      Alert.alert('Save failed', 'Unable to save the scanned image to storage.');
      setStatus('captured');
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Whole Page Scan" onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        <Pressable onPress={handleScan} style={[styles.scanSlot, scannedUri && styles.scanSlotFilled]}>
          {scannedUri ? (
            <Image source={{ uri: scannedUri }} style={styles.scannedImage} resizeMode="contain" />
          ) : (
            <View style={styles.scanSlotContent}>
              <View style={styles.scanIconCircle}>
                <Ionicons name="scan" size={26} color={colors.primary} />
              </View>
              <Text style={styles.scanSlotTitle}>Tap to scan a page</Text>
              <Text style={styles.scanSlotSubtitle}>Uses the same document scanner as case uploads</Text>
            </View>
          )}
        </Pressable>

        {scannedUri ? (
          <SecondaryButton label="Re-scan" onPress={handleScan} size="medium" style={styles.rescanButton} />
        ) : null}

        <View style={styles.field}>
          <Text style={styles.fieldLabel}>File name</Text>
          <View style={styles.inputWrap}>
            <TextInput
              value={filename}
              onChangeText={setFilename}
              placeholder={DEFAULT_FILENAME}
              placeholderTextColor={colors.textTertiary}
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
            />
            <Text style={styles.extensionTag}>.png</Text>
          </View>
        </View>

        {scannedUri ? (
          <View style={styles.saveActions}>
            <PrimaryButton
              label="Save"
              onPress={() => handleSave(false)}
              size="medium"
              loading={status === 'saving'}
              disabled={status === 'saving'}
            />
            <SecondaryButton
              label="Save Flagged"
              onPress={() => handleSave(true)}
              size="medium"
              disabled={status === 'saving'}
            />
          </View>
        ) : null}

        {savedPath ? (
          <View style={[styles.savedBanner, status === 'flagged' && styles.savedBannerFlagged]}>
            <Ionicons
              name={status === 'flagged' ? 'flag' : 'checkmark-circle'}
              size={16}
              color={status === 'flagged' ? colors.warningIcon : colors.statusGenuine}
            />
            <Text style={[styles.savedBannerText, status === 'flagged' && styles.savedBannerTextFlagged]} numberOfLines={2}>
              {status === 'flagged' ? 'Saved (flagged): ' : 'Saved: '}{savedPath}
            </Text>
          </View>
        ) : null}
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
  content: { padding: 16, paddingBottom: 32, gap: 16 },
  folderCard: {
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
  scanSlot: {
    minHeight: 260,
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.uploadSlotBorder,
    backgroundColor: colors.cardBackground,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  scanSlotFilled: { borderStyle: 'solid' },
  scanSlotContent: { alignItems: 'center', gap: 10, padding: 20 },
  scanIconCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.primaryLight, alignItems: 'center', justifyContent: 'center' },
  scanSlotTitle: { ...getTypographyStyle('body', 'semiBold'), color: colors.textPrimary },
  scanSlotSubtitle: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary, textAlign: 'center' },
  scannedImage: { width: '100%', height: 260 },
  rescanButton: { alignSelf: 'flex-start' },
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
  saveActions: { gap: 10 },
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.statusGenuineBg,
    borderRadius: 10,
    padding: 10,
  },
  savedBannerFlagged: { backgroundColor: colors.warningBackground },
  savedBannerText: { flex: 1, ...getTypographyStyle('c2Caption', 'regular'), color: colors.statusGenuine },
  savedBannerTextFlagged: { color: colors.warningText },
});