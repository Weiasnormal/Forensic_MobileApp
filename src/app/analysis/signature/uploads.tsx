import { hasCompleteUploads, useAnalysisFlowStore } from '@/store/analysisFlowStore';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const ACCENT = '#1F5DA8';
const SCREEN_BG = '#FFFFFF';

export default function SignatureUploadsRoute() {
  const router = useRouter();
  const nav = router as any;
  const [permission, requestPermission] = useCameraPermissions();
  const [cameraVisible, setCameraVisible] = useState(false);
  const [currentUploadTarget, setCurrentUploadTarget] = useState<'reference' | 'suspect' | null>(null);
  const [currentReferenceIndex, setCurrentReferenceIndex] = useState<number | null>(null);
  const cameraRef = useRef(null);
  const uploads = useAnalysisFlowStore((state) => state.signature.uploads);
  const setReference = useAnalysisFlowStore((state) => state.setReference);
  const setSuspect = useAnalysisFlowStore((state) => state.setSuspect);
  const canRun = hasCompleteUploads(uploads);

  const handleCameraPress = (target: 'reference' | 'suspect', refIndex?: number) => {
    if (!permission?.granted) {
      requestPermission();
      return;
    }
    setCurrentUploadTarget(target);
    if (refIndex !== undefined) {
      setCurrentReferenceIndex(refIndex);
    }
    setCameraVisible(true);
  };

  const handleCapture = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await (cameraRef.current as any).takePictureAsync({ base64: true });
      if (photo?.uri) {
        if (currentUploadTarget === 'reference' && currentReferenceIndex !== null) {
          setReference('signature', currentReferenceIndex, photo.uri);
        } else if (currentUploadTarget === 'suspect') {
          setSuspect('signature', photo.uri);
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

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload Signatures" step="2 / 2" onBackPress={() => nav.back()} />
      <View style={[styles.progressBar, styles.progressBarFull]} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <Text style={styles.sectionHeading}>Reference Signatures</Text>
          <Text style={styles.sectionSubheading}>Upload 4 reference signatures</Text>
        </View>
        <View style={styles.referenceGrid}>
          {uploads.references.map((uri, index) => {
            const refLabel = `REF ${String(index + 1).padStart(2, '0')}`;
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
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => nav.push('/analysis/signature/processing')} disabled={!canRun} style={[styles.primaryButton, !canRun && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>Run Analysis</Text>
        </Pressable>
      </View>
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
    bottom: 0,
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
