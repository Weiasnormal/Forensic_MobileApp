import MediaSourcePicker, { scanForensicDocument } from '@/_components/modals/media_source_picker';
import { hasCompleteUploads, useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import { Plus } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { Alert, BackHandler, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import PrimaryButton from '@/_components/common/PrimaryButton';

export default function SignatureUploadsRoute() {
  const router = useRouter();
  const nav = router as any;
  const insets = useSafeAreaInsets();
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'reference' | 'suspect' | null>(null);
  const [currentReferenceIndex, setCurrentReferenceIndex] = useState<number | null>(null);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const uploads = useCaseStore((state) => state.draftSignatureCase.uploads);
  const setDraftUpload = useCaseStore((state) => state.setDraftUpload);
  const submitNewCase = useCaseStore((state) => state.submitNewCase);
  const isSubmitting = useCaseStore((state) => state.isSubmitting);
  const canRun = hasCompleteUploads(uploads);
  const resetSubmissionState = useCaseStore((state) => state.resetSubmissionState);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        nav.back();
        return true;
      });

      return () => subscription.remove();
    }, [nav])
  );

  const handleCameraPress = (target: 'reference' | 'suspect', refIndex?: number) => {
    if (target === 'suspect') {
      const allRefsFilled = uploads.references.every(Boolean);
      if (!allRefsFilled) {
        Alert.alert(
          'Complete references first',
          'Please upload all 4 reference signatures (SIG 01–04) before adding the suspected signature.'
        );
        return;
      }
    }

    setCurrentUploadTarget(target);
    if (refIndex !== undefined) {
      setCurrentReferenceIndex(refIndex);
    }

    scanForensicDocument((scannedUri) => {
      if (target === 'reference' && refIndex !== undefined) {
        setDraftUpload('reference', refIndex, scannedUri);
      } else if (target === 'suspect') {
        setDraftUpload('suspect', 0, scannedUri);
      }
    });
  };

  const handleSubmit = () => {
    if (!canRun || isSubmitting) return;

    resetSubmissionState();
    submitNewCase().catch((error) => {
      console.warn('Unable to submit new case:', error);
    });

    nav.replace('/analysis/signature/processing');
  };

  const openPreview = (uri: string, label: string) => {
    setPreviewUri(uri);
    setPreviewLabel(label);
  };

  const closePreview = () => {
    setPreviewUri(null);
    setPreviewLabel('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload Signatures" step="2 / 2" onBackPress={() => nav.back()} />
      <View style={[styles.progressBar, styles.progressBarFull]} />
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(120, insets.bottom + 96) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionHeading}>Reference Signatures</Text>
          <Text style={styles.sectionSubheading}>Upload 4 reference signatures</Text>
        </View>
        <View style={styles.referenceGrid}>
          {uploads.references.map((uri, index) => {
            const refLabel = `SIG ${String(index + 1).padStart(2, '0')}`;
            return (
              <View key={`sig-ref-${index}`} style={styles.uploadSlotWrapper}>
                <Text style={styles.slotLabel}>{refLabel}</Text>
                <Pressable
                  onPress={() => {
                    if (uri) {
                      openPreview(uri, refLabel);
                      return;
                    }

                    handleCameraPress('reference', index);
                  }}
                  style={[styles.uploadSlot, uri && styles.uploadSlotFilled]}
                >
                  {!uri ? (
                    <View style={styles.uploadSlotContent}>
                      <View style={styles.uploadButton}>
                        <Plus size={18} color={colors.label} strokeWidth={3} />
                      </View>
                      <Text style={styles.uploadSlotText}>Add photo</Text>
                    </View>
                  ) : (
                    <>
                      <Image source={{ uri }} style={styles.uploadedImage} resizeMode="cover" />
                      <View style={styles.uploadCheckBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                      </View>
                      <Pressable
                        style={styles.clearImageButton}
                        onPress={(event) => {
                          event.stopPropagation();
                          Alert.alert('Remove image', 'Remove this reference signature?', [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Remove', style: 'destructive', onPress: () => setDraftUpload('reference', index, null) },
                          ]);
                        }}
                      >
                        <Ionicons name="trash" size={14} color={colors.textPrimary} />
                      </Pressable>
                    </>
                  )}
                </Pressable>
              </View>
            );
          })}
        </View>
        <View style={styles.suspectHeader}>
          <Text style={styles.sectionHeading}>Suspected Signature</Text>
          <Text style={styles.sectionSubheading}>Upload the signature to be verified</Text>
        </View>
        <Pressable
          onPress={() => {
            if (uploads.suspect) {
              openPreview(uploads.suspect, 'Suspected Signature');
              return;
            }

            handleCameraPress('suspect');
          }}
          style={[styles.suspectSlot, uploads.suspect && styles.suspectSlotFilled]}
        >
          {!uploads.suspect ? (
            <View style={styles.suspectSlotContent}>
              <View style={styles.suspectUploadButton}>
                <Ionicons name="add" size={28} color={colors.suspectAccent} />
              </View>
              <Text style={styles.suspectSlotTitle}>Add suspected signature</Text>
              <Text style={styles.suspectSlotSubtitle}>Tap to upload or take a photo</Text>
            </View>
          ) : (
            <>
              <Image source={{ uri: uploads.suspect }} style={styles.uploadedSuspectImage} resizeMode="cover" />
              <View style={styles.uploadCheckBadgeLarge}>
                <Ionicons name="checkmark-circle" size={28} color={colors.suspectAccent} />
              </View>
              <Pressable
                style={styles.clearImageButtonLarge}
                onPress={(event) => {
                  event.stopPropagation();
                  Alert.alert('Remove image', 'Remove the suspected signature?', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Remove', style: 'destructive', onPress: () => setDraftUpload('suspect', 0, null) },
                  ]);
                }}
              >
                <Ionicons name="trash" size={16} color={colors.textPrimary} />
              </Pressable>
            </>
          )}
        </Pressable>
      </ScrollView>
      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}>
        <PrimaryButton
          label={isSubmitting ? 'Saving...' : 'Run Analysis'}
          onPress={handleSubmit}
          disabled={!canRun}
          loading={isSubmitting}
          size="medium"
        />
      </View>
      <MediaSourcePicker
        visible={showSourcePicker}
        onCancel={() => setShowSourcePicker(false)}
        onSelect={async (choice) => {
          setShowSourcePicker(false);

          try {
            if (choice === 'camera') {
              await scanForensicDocument((scannedUri) => {
                if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
                  setDraftUpload('reference', currentReferenceIndex, scannedUri);
                } else if (currentUploadTarget === 'suspect') {
                  setDraftUpload('suspect', 0, scannedUri);
                }
              });
              return;
            }

            const isDuplicate = (asset: any) => {
              const identifier = asset.assetId || asset.fileName || String(asset.fileSize);
              if (!identifier) return false;

              const searchStr = `?id=${encodeURIComponent(identifier)}`;

              const isRefDup = uploads.references.some((uri) => uri?.includes(searchStr));
              const isSuspectDup = uploads.suspect?.includes(searchStr);

              return isRefDup || isSuspectDup;
            };

            if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
              const remainingSlots = 4 - currentReferenceIndex;
              const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                allowsEditing: false,
                selectionLimit: Math.max(1, remainingSlots),
                quality: 0.9,
              });

              if (result && !result.canceled) {
                const assets = result.assets || [];
                let addedCount = 0;
                let duplicateCount = 0;

                for (let i = 0; i < assets.length; i++) {
                  const asset = assets[i];
                  if (!asset || !asset.uri) continue;

                  if (isDuplicate(asset)) {
                    duplicateCount++;
                    continue;
                  }

                  const slotIndex = currentReferenceIndex + addedCount;
                  if (slotIndex > 3) break;

                  const identifier = asset.assetId || asset.fileName || String(asset.fileSize);
                  const finalUri = identifier ? `${asset.uri}?id=${encodeURIComponent(identifier)}` : asset.uri;

                  setDraftUpload('reference', slotIndex, finalUri);
                  addedCount++;
                }

                if (duplicateCount > 0) {
                  Alert.alert(
                    'Duplicate Detected',
                    `${duplicateCount} image(s) were skipped because they are already selected in this case.`
                  );
                }
              }
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: false,
              quality: 0.9,
            });

            if (result && !result.canceled) {
              const asset = result.assets?.[0];
              if (asset && asset.uri) {
                if (isDuplicate(asset)) {
                  Alert.alert('Already Selected', 'This image is already being used as a reference signature.');
                  return;
                }

                const identifier = asset.assetId || asset.fileName || String(asset.fileSize);
                const finalUri = identifier ? `${asset.uri}?id=${encodeURIComponent(identifier)}` : asset.uri;

                if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
                  setDraftUpload('reference', currentReferenceIndex, finalUri);
                } else if (currentUploadTarget === 'suspect') {
                  setDraftUpload('suspect', 0, finalUri);
                }
              }
            }
          } catch (e) {
            console.warn('Gallery pick failed', e);
            Alert.alert('Error', 'Unable to pick image from gallery.');
          }
        }}
      />

      <Modal visible={Boolean(previewUri)} transparent animationType="fade" onRequestClose={closePreview}>
        <Pressable style={styles.previewBackdrop} onPress={closePreview}>
          <Pressable style={styles.previewSheet} onPress={() => {}}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{previewLabel}</Text>
              <Pressable onPress={closePreview} style={styles.previewCloseButton}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>
            {previewUri ? <Image source={{ uri: previewUri }} style={styles.previewImage} resizeMode="contain" /> : null}
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

function TopBar({ title, step, onBackPress }: { title: string; step: string; onBackPress: () => void }) {
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backButtonBox}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        <Text style={styles.stepCounter}>{step}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBarWrapper: {
    backgroundColor: colors.background2,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabledBorder,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background2,
  },
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepCounter: {
    ...getTypographyStyle('l1List'),
    color: colors.label,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressBarFull: {
    backgroundColor: colors.primary,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 100,
    gap: 16,
  },
  headerSection: {
    marginBottom: 8,
  },
  sectionHeading: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    ...getTypographyStyle('c1Caption', 'regular'),
    marginTop: 4,
    lineHeight: 18,
    color: colors.textSecondary,
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  uploadSlotWrapper: {
    width: '48%',
  },
  slotLabel: {
    ...getTypographyStyle('c3Caption', 'bold'),
    color: colors.label,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  uploadSlot: {
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.uploadSlotBorder,
    borderRadius: 12,
    backgroundColor: colors.background2,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    overflow: 'hidden',
  },
  uploadSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: colors.primaryLight,
  },
  uploadSlotContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: colors.warningBackground,
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadSlotText: {
    ...getTypographyStyle('c2Caption'),
    color: colors.textSecondary,
  },
  uploadedImage: {
    ...StyleSheet.absoluteFillObject,
  },
  uploadedSuspectImage: {
    ...StyleSheet.absoluteFillObject,
  },
  uploadCheckBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: colors.iconBadgeBackground,
    borderRadius: 999,
  },
  uploadCheckBadgeLarge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: colors.iconBadgeBackground,
    borderRadius: 999,
  },
  clearImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.iconBadgeBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearImageButtonLarge: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: colors.iconBadgeBackgroundStrong,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspectHeader: {
    marginTop: 12,
    marginBottom: 12,
  },
  suspectSlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.suspectBorder,
    borderRadius: 12,
    backgroundColor: colors.suspectBackground,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170,
    overflow: 'hidden',
  },
  suspectSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: colors.suspectBackgroundFilled,
  },
  suspectSlotContent: {
    alignItems: 'center',
    gap: 12,
  },
  suspectUploadButton: {
    width: 46,
    height: 46,
    borderRadius: 99,
    backgroundColor: colors.suspectAccentBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspectSlotTitle: {
    ...getTypographyStyle('b2Button'),
    color: colors.suspectAccent,
  },
  suspectSlotSubtitle: {
    ...getTypographyStyle('b3Button', 'medium'),
    color: colors.suspectSubtext,
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewSheet: {
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    padding: 12,
    maxHeight: '82%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewTitle: {
    flex: 1,
    ...getTypographyStyle('b2Button'),
    color: colors.textPrimary,
  },
  previewCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.disabledBorder,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.cardBackground,
  },
  previewImage: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
});