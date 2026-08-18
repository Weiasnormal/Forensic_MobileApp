import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { scanForensicDocument } from '@/_components/modals/media_source_picker';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { saveScanLocally } from '@/_components/devscan';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';


const DEFAULT_FILENAME = 'FS_MLkitDataset_000';

export default function WholePageScanScreen() {
  const router = useRouter();
  const nav = router as any;

  const [scannedUri, setScannedUri] = useState<string | null>(null);
  const [filename, setFilename] = useState(DEFAULT_FILENAME);
  const [isSaving, setIsSaving] = useState(false);
  const [savedPath, setSavedPath] = useState<string | null>(null);

  const handleScan = async () => {
    setSavedPath(null);
    await scanForensicDocument((uri) => setScannedUri(uri));
  };

  const handleSave = async () => {
    if (!scannedUri) {
      Alert.alert('Nothing to save', 'Scan a page first.');
      return;
    }

    setIsSaving(true);
    try {
      const targetUri = await saveScanLocally(scannedUri, filename);
      setSavedPath(targetUri);
      Alert.alert('Saved locally', `Saved to:\n${targetUri}`);
    } catch (error) {
      console.warn('[WholePageScan] save failed', error);
      Alert.alert('Save failed', 'Unable to save the scanned image locally.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Whole Page Scan" onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
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

        {savedPath ? (
          <View style={styles.savedBanner}>
            <Ionicons name="checkmark-circle" size={16} color={colors.statusGenuine} />
            <Text style={styles.savedBannerText} numberOfLines={2}>
              Saved locally: {savedPath}
            </Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <PrimaryButton
          label={isSaving ? 'Saving...' : 'Save PNG Locally'}
          onPress={handleSave}
          loading={isSaving}
          disabled={!scannedUri}
          size="medium"
        />
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
  content: { padding: 16, paddingBottom: 120, gap: 16 },
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
  savedBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: colors.statusGenuineBg,
    borderRadius: 10,
    padding: 10,
  },
  savedBannerText: { flex: 1, ...getTypographyStyle('c2Caption', 'regular'), color: colors.statusGenuine },
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