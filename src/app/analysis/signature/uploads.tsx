import MediaSourcePicker from '@/_components/modals/media_source_picker';
import { hasCompleteUploads, useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, BackHandler, Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#1E6FD9';
const SCREEN_BG = '#F7F9FC';

export default function SignatureUploadsRoute() {
  const router = useRouter();
  const nav = router as any;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'reference' | 'suspect' | null>(null);
  const [currentReferenceIndex, setCurrentReferenceIndex] = useState<number | null>(null);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const cameraRef = useRef(null);
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
    if (!permission?.granted) {
      requestPermission();
      return;
    }

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

    setShowSourcePicker(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await (cameraRef.current as any).takePictureAsync({ base64: true });
      if (photo?.uri) {
        if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
          setDraftUpload('reference', currentReferenceIndex, photo.uri);
        } else if (currentUploadTarget === 'suspect') {
          setDraftUpload('suspect', 0, photo.uri);
        }
      }
      setCameraVisible(false);
      setCurrentUploadTarget(null);
      setCurrentReferenceIndex(null);
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert('Error', 'Failed to capture image. Please try again.');
    }
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
                        <Ionicons name="add" size={18} color="#94A3B8" />
                      </View>
                      <Text style={styles.uploadSlotText}>Add photo</Text>
                    </View>
                  ) : (
                    <>
                      <Image source={{ uri }} style={styles.uploadedImage} resizeMode="cover" />
                      <View style={styles.uploadCheckBadge}>
                        <Ionicons name="checkmark-circle" size={24} color={ACCENT} />
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
                        <Ionicons name="trash" size={14} color="#0F172A" />
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
                <Ionicons name="add" size={28} color="#D97706" />
              </View>
              <Text style={styles.suspectSlotTitle}>Add suspected signature</Text>
              <Text style={styles.suspectSlotSubtitle}>Tap to upload or take a photo</Text>
            </View>
          ) : (
            <>
              <Image source={{ uri: uploads.suspect }} style={styles.uploadedSuspectImage} resizeMode="cover" />
              <View style={styles.uploadCheckBadgeLarge}>
                <Ionicons name="checkmark-circle" size={28} color="#D97706" />
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
                <Ionicons name="trash" size={16} color="#0F172A" />
              </Pressable>
            </>
          )}
        </Pressable>
      </ScrollView>
      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}>
        <Pressable onPress={handleSubmit} disabled={!canRun || isSubmitting} style={[styles.primaryButton, (!canRun || isSubmitting) && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>{isSubmitting ? 'Saving...' : 'Run Analysis'}</Text>
        </Pressable>
      </View>
      <MediaSourcePicker
        visible={showSourcePicker}
        onCancel={() => setShowSourcePicker(false)}
        onSelect={async (choice) => {
        setShowSourcePicker(false);
        if (choice === 'camera') {
          setCameraVisible(true);
          return;
        }

        try {
          const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!perm.granted) {
            Alert.alert('Permission required', 'Gallery access is required to pick images.');
            return;
          }

            // duplicate Checker
          const isDuplicate = (asset: any) => {
            // Create a unique fingerprint using iOS assetId, Android fileName, or fileSize as a fallback
            const identifier = asset.assetId || asset.fileName || String(asset.fileSize);
            if (!identifier) return false;

            const searchStr = `?id=${encodeURIComponent(identifier)}`;

            // Check if this unique ID is already anywhere in our uploads
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

                // Attach the fingerprint to the URI before saving to the global store
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

          // SUSPECT SIGNATURE 
          const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 0.9,
          });

          if (result && !result.canceled) {
            const asset = result.assets?.[0];
            if (asset && asset.uri) {
              if (isDuplicate(asset)) {
                // Instantly alert the user if they pick a duplicate for the Suspect slot
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
      {cameraVisible && (
        <View style={styles.cameraOverlay}>
          <SafeAreaView style={styles.cameraContainer}>
            <View style={styles.cameraHeader}>
              <Pressable onPress={() => setCameraVisible(false)} style={styles.cameraDismiss}>
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </Pressable>
              <Text style={styles.cameraTitle}>Capture Signature</Text>
              <View style={{ width: 24 }} />
            </View>
            <View style={styles.cameraViewContainer}>
              <CameraView ref={cameraRef} style={styles.cameraView} facing="back" zoom={0} />
            </View>
            <View style={styles.cameraFooter}>
              <Pressable onPress={handleCapture} style={styles.captureButton}>
                <View style={styles.captureInner} />
              </Pressable>
              <Text style={styles.cameraHint}>Tap to capture signature</Text>
            </View>
          </SafeAreaView>
        </View>
      )}

      <Modal visible={Boolean(previewUri)} transparent animationType="fade" onRequestClose={closePreview}>
        <Pressable style={styles.previewBackdrop} onPress={closePreview}>
          <Pressable style={styles.previewSheet} onPress={() => {}}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{previewLabel}</Text>
              <Pressable onPress={closePreview} style={styles.previewCloseButton}>
                <Ionicons name="close" size={22} color="#0F172A" />
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
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
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
    backgroundColor: SCREEN_BG,
  },
  topBarWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E8EBF0',
    width: '100%',
  },
  progressBarFull: {
    backgroundColor: ACCENT,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  uploadSlot: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D8E3EF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 120,
    overflow: 'hidden',
  },
  uploadSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: '#F0F6FF',
  },
  uploadSlotContent: {
    alignItems: 'center',
    gap: 8,
  },
  uploadButton: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#E8EBF0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadSlotText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
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
    backgroundColor: '#FFFFFFE0',
    borderRadius: 999,
  },
  uploadCheckBadgeLarge: {
    position: 'absolute',
    top: 10,
    left: 10,
    backgroundColor: '#FFFFFFE0',
    borderRadius: 999,
  },
  changeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFFE6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FFFFFFE6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    backgroundColor: '#FFFFFFE6',
    borderWidth: 1,
    borderColor: '#E2E8F0',
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
    borderColor: '#FED7AA',
    borderRadius: 12,
    backgroundColor: '#FFFBF0',
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 170,
    overflow: 'hidden',
  },
  suspectSlotFilled: {
    borderStyle: 'solid',
    backgroundColor: '#FEF9F3',
  },
  suspectSlotContent: {
    alignItems: 'center',
    gap: 12,
  },
  suspectUploadButton: {
    width: 46,
    height: 46,
    borderRadius: 999,
    backgroundColor: '#FCD34D',
    alignItems: 'center',
    justifyContent: 'center',
  },
  suspectSlotTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#D97706',
  },
  suspectSlotSubtitle: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '500',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    opacity: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EBF0',
  },
  cameraOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000000',
    zIndex: 1000,
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000000',
  },
  cameraHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  cameraDismiss: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  cameraViewContainer: {
    flex: 1,
    backgroundColor: '#000000',
    overflow: 'hidden',
  },
  cameraView: {
    flex: 1,
  },
  cameraFooter: {
    backgroundColor: '#000000',
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    gap: 8,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: ACCENT,
  },
  cameraHint: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    fontWeight: '600',
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(2, 6, 23, 0.72)',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  previewSheet: {
    backgroundColor: '#FFFFFF',
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
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  previewCloseButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  previewImage: {
    width: '100%',
    height: 420,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
  },
});
