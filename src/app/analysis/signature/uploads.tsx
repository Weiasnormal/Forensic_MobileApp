import MediaSourcePicker from '@/_components/modals/media_source_picker';
import { hasCompleteUploads, useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import React, { useCallback, useRef, useState } from 'react';
import { Alert, BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const ACCENT = '#1F5DA8';
const SCREEN_BG = '#FFFFFF';

export default function SignatureUploadsRoute() {
  const router = useRouter();
  const nav = router as any;
  const insets = useSafeAreaInsets();
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'reference' | 'suspect' | null>(null);
  const [currentReferenceIndex, setCurrentReferenceIndex] = useState<number | null>(null);
  const [showSourcePicker, setShowSourcePicker] = useState(false);
  const cameraRef = useRef(null);
  const uploads = useCaseStore((state) => state.draftSignatureCase.uploads);
  const setDraftUpload = useCaseStore((state) => state.setDraftUpload);
  const submitNewCase = useCaseStore((state) => state.submitNewCase);
  const isSubmitting = useCaseStore((state) => state.isSubmitting);
  const canRun = hasCompleteUploads(uploads);

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
    setCurrentUploadTarget(target);
    if (refIndex !== undefined) {
      setCurrentReferenceIndex(refIndex);
    }
    // show custom source picker modal
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

  const handleSubmit = async () => {
    try {
      await submitNewCase();
      nav.replace('/analysis/signature/processing');
    } catch (error) {
      console.warn('Unable to submit new case:', error);
      Alert.alert('Submit failed', 'Please complete the case details and try again.');
    }
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
                <Pressable onPress={() => handleCameraPress('reference', index)} style={[styles.uploadSlot, uri && styles.uploadSlotFilled]}>
                  {!uri ? (
                    <View style={styles.uploadSlotContent}>
                      <View style={styles.uploadButton}>
                        <Ionicons name="add" size={24} color="#94A3B8" />
                      </View>
                      <Text style={styles.uploadSlotText}>Add photo</Text>
                    </View>
                  ) : (
                    <View style={styles.uploadedImagePlaceholder}>
                      <Ionicons name="checkmark-circle" size={32} color={ACCENT} />
                    </View>
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
        <Pressable onPress={() => handleCameraPress('suspect')} style={[styles.suspectSlot, uploads.suspect && styles.suspectSlotFilled]}>
          {!uploads.suspect ? (
            <View style={styles.suspectSlotContent}>
              <View style={styles.suspectUploadButton}>
                <Ionicons name="add" size={28} color="#D97706" />
              </View>
              <Text style={styles.suspectSlotTitle}>Add suspected signature</Text>
              <Text style={styles.suspectSlotSubtitle}>Tap to upload or take a photo</Text>
            </View>
          ) : (
            <View style={styles.uploadedImagePlaceholder}>
              <Ionicons name="checkmark-circle" size={40} color="#D97706" />
            </View>
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

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 0.9,
            });

            const uri = (result as any).uri ?? (result as any).assets?.[0]?.uri;

            if (result && !(result as any).cancelled && uri) {
              if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
                setDraftUpload('reference', currentReferenceIndex, uri);
              } else if (currentUploadTarget === 'suspect') {
                setDraftUpload('suspect', 0, uri);
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
    width: 44,
    height: 44,
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
  uploadedImagePlaceholder: {
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
    width: 56,
    height: 56,
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
});
