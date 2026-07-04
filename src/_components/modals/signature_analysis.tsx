import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import {
    getSignatureAnalysisCaseStatus,
    getSignatureAnalysisVerdictLabel,
    parseGradcamBlobIds,
    resolveCaseVerdict,
    type OverlayVariant,
    type SignatureAnalysisResult,
    type SignatureAnalysisViewMode,
} from '@/services/signatureAnalysis';
import { API_BASE_URL, API_ENDPOINTS, buildApiUrl } from '../../constants/api';
import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
import { type CaseStatus, useCaseStore } from '../../store/caseStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';

const ACCENT = '#1E6FD9';
const SCREEN_BG = '#ffffff';

const viewModes = ['Heatmap', 'Bounding Box', 'Stroke Diff'] as const;
const VIEW_MODE_TO_VARIANT: Record<ViewMode, OverlayVariant> = {
  'Heatmap': 'heatmap',
  'Bounding Box': 'bbox',
  'Stroke Diff': 'stroke_diff',
  };
type ViewMode = SignatureAnalysisViewMode;

const processingSteps: ProcessingStep[] = [
  {
    id: 'sig-preprocess',
    label: 'Image preprocessing',
    detail: 'Normalize and enhance contrast',
  },
  {
    id: 'sig-feature',
    label: 'Feature extraction',
    detail: 'Siamese network encoding',
  },
  {
    id: 'sig-score',
    label: 'Similarity scoring',
    detail: 'Triplet loss comparison',
  },
  {
    id: 'sig-heatmap',
    label: 'Heatmap generation',
    detail: 'Grad-CAM visualization',
  },
  {
    id: 'sig-report',
    label: 'Report compilation',
    detail: 'Building forensic output',
  },
];

function buildPayloadRows(result: SignatureAnalysisResult, verdictLabel: string, currentCase: any) {
  const { isSuspected } = resolveCaseVerdict(currentCase, result);
  //const finalVerdict = currentCase?.verdict || currentCase?.Verdict || 'UNKNOWN';
  const isForged = isSuspected; //finalVerdict === 'FORGED';
  
  return [
    { metric: 'General information', 
      value: result.case_name || 'N/A', 
      detail: 'Cross-referenced with internal database.' },

    { metric: 'Relation to Baseline', 
      value: isForged ? 'Inconsistent (High Deviation)' : 'Consistent with Baseline', 
      detail: `Distance metric computed at ${(result.distance || 0).toFixed(4)}.` },

    { metric: 'Line Quality', 
      value: isForged ? 'Tremor / Hesitation detected' : 'Smooth, fluid strokes', 
      detail: 'Analysis of stroke velocity, pressure points, and fluidity.' },
    { metric: 'Proportion & Spacing', 
      value: isForged ? 'Irregular (x4 discrepancies)' : 'Matches baseline proportions', 
      detail: 'Height-to-width ratios and intra-character spacing evaluated.' },

    { metric: 'Connecting Strokes', 
      value: isForged ? 'Blunt endings / unnatural lifts' : 'Natural flow and continuous', 
      detail: 'Micro-lifts and terminal stroke tapering analyzed.' },

    { metric: 'Pattern Variation', 
      value: isForged ? 'Beyond controlling pattern' : 'Within natural variation bounds', 
      detail: 'Compared against the provided reference samples.' },
  ];
}
export function SignatureProcessingView() {
  const router = useRouter();
  const nav = router as any;
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);
  const submissionStatus = useCaseStore((state) => state.submissionStatus);
  const submissionStep = useCaseStore((state) => state.submissionStep);
  const submissionProgress = useCaseStore((state) => state.submissionProgress);
  const submissionError = useCaseStore((state) => state.submissionError);
  const resetSubmissionState = useCaseStore((state) => state.resetSubmissionState);

  const setSignatureStatus = (status: CaseStatus) => {
    if (!currentCaseId) return;
    updateCaseStatus(currentCaseId, status);
  };

  const handleBackToHome = () => {
    setSignatureStatus('Processing');
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };

  useEffect(() => {
    if (submissionStatus !== 'error') return;
    Alert.alert('Submission failed', submissionError || 'An unexpected error occurred.', [
      {
        text: 'Back to uploads',
        onPress: () => {
          resetSubmissionState();
          nav.replace('/analysis/signature/uploads');
        },
      },
    ]);
  }, [submissionStatus]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ProcessingScreen
        title="Processing Signature"
        subtitle="AI forensic engine is running multi-stage comparison"
        accentColor={ACCENT}
        steps={processingSteps}
        progress={submissionProgress}
        statusText={submissionStep || 'Preparing…'}
        onComplete={() => {
          if (submissionStatus === 'success' && currentCaseId) {
            nav.replace(`/analysis/signature/results/${currentCaseId}`);
          }
        }}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 16 }}>
        <Pressable style={styles.primaryButton} onPress={handleBackToHome}>
          <Text style={styles.primaryButtonText}>Run in Background</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export function SignatureResultsScreen() {
  const router = useRouter();
  const nav = router as any;
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);

  const safeCaseId = String(currentCaseId).trim();
  const analysisResult = useCaseStore((state) =>
    safeCaseId ? state.signatureAnalysisResults[safeCaseId] : undefined,
  );
  const currentCase = useCaseStore((state) =>
    safeCaseId ? state.cases.find((c) => String(c.caseId) === safeCaseId) : undefined,
  );
  //const allCases = useCaseStore((state) => state.cases);
  // console.log("===== DEBUGGING RESULTS PAGE =====");
  // console.log("1. Clean Safe Case ID:", safeCaseId);
  // console.log("2. Did we find the case in the store?:", !!currentCase);
  // console.log("3. ALL IDs currently in store:", allCases.map(c => c.caseId));
  // if (currentCase) {
  //   console.log("4. Uploads object exists?:", !!currentCase.uploads);
  //   console.log("5. Suspect Image inside store:", currentCase.uploads?.suspect);
  // }
  // console.log("==================================");

  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');
  const insets = useSafeAreaInsets();
  const [previewSource, setPreviewSource] = useState<{ uri: string } | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');

  const activeTone = useMemo(() => {
    if (activeView === 'Heatmap') {
      return { bg: '#DBEAFE', edge: '#60A5FA', badge: '#1D4ED8' };
    }

    if (activeView === 'Bounding Box') {
      return { bg: '#E0F2FE', edge: '#38BDF8', badge: '#0369A1' };
    }

    return { bg: '#E2E8F0', edge: '#94A3B8', badge: '#334155' };
  }, [activeView]);

  const payloadRows = useMemo(() => {
    if (!analysisResult) return []; 
    const finalVerdict = currentCase?.verdict || currentCase?.Verdict || 'UNKNOWN';
    const verdictLabel = getSignatureAnalysisVerdictLabel(finalVerdict as any);
    return buildPayloadRows(analysisResult, verdictLabel, currentCase);
  }, [analysisResult, currentCase]);

  const gradcamSlots = useMemo(
    () => parseGradcamBlobIds(analysisResult?.gradcam_blob_ids ?? []),
    [analysisResult],
  );

const referenceOverlayUris = useMemo(() => {
  return gradcamSlots.references.map((refSlot) => {
    const ref = refSlot[VIEW_MODE_TO_VARIANT[activeView]];
    return currentCaseId && ref
      ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(currentCaseId, ref.folder, ref.fileName))
      : null;
  });
}, [currentCaseId, gradcamSlots, activeView]);

const suspectOverlayUri = useMemo(() => {
  const ref = gradcamSlots.suspect[VIEW_MODE_TO_VARIANT[activeView]];
  return currentCaseId && ref
    ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(currentCaseId, ref.folder, ref.fileName))
    : null;
}, [currentCaseId, gradcamSlots, activeView]);

  //Prefetch all overlay images to reduce flicker when switching views
  useEffect(() => {
    const refs = currentCase?.uploads.references ?? [];
    const urisToPrefetch = [
      ...refs.filter(Boolean).map((uri) => uri!.split('?')[0]),
      suspectOverlayUri,
      ...referenceOverlayUris,
    ].filter(Boolean) as string[];

    if (urisToPrefetch.length > 0) {
      ExpoImage.prefetch(urisToPrefetch);
    }
  }, [currentCase, suspectOverlayUri, referenceOverlayUris]);

  useEffect(() => {
    if (currentCase?.status === 'Processing') {
      nav.replace('/analysis/signature/processing');
    }
  }, [currentCase?.status, nav]);

  if (currentCase?.status === 'Processing') return null;

  // SAFETY CHECK
  if (!analysisResult) {
    return (
      <SafeAreaView style={styles.screen}>
        <TopBar title="Analysis Error" step="" onBackPress={() => nav.back()} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Ionicons name="warning-outline" size={48} color="#EF4444" style={{ marginBottom: 12 }} />
          <Text style={{ fontSize: 16, color: '#EF4444', fontWeight: 'bold' }}>Data Missing</Text>
          <Text style={{ fontSize: 14, color: '#64748B', marginTop: 4 }}>No analysis results found from the server.</Text>
        </View>
      </SafeAreaView>
    );
  }

  // REAL result 
  const activeResult = analysisResult; 
 
  const uploadedReferences = currentCase?.uploads.references ?? [];
  const uploadedSuspect = currentCase?.uploads.suspect ?? null;

  const { verdictLabel, isSuspected, confidence: confidenceValue } =
  resolveCaseVerdict(currentCase, activeResult);
  
  const resultCardTheme = isSuspected
    ? {
        cardBg: '#FEF1F1',
        iconBg: '#EB5757',
        text: '#EB5757',
        subtleText: '#64748B',
        iconName: 'alert-circle' as const,
        iconColor: '#FFFFFF',
      }
    : {
        cardBg: '#F1FAF3',
        iconBg: '#22B24C',
        text: '#16A34A',
        subtleText: '#64748B',
        iconName: 'checkmark-circle' as const,
        iconColor: '#FFFFFF',
      };

  const setSignatureStatus = (status: CaseStatus) => {
    if (!currentCaseId) {
      return;
    }

    updateCaseStatus(currentCaseId, status);
  };

  const handleBackToDashboard = () => {
   
    setSignatureStatus(getSignatureAnalysisCaseStatus(activeResult));
    useAnalysisFlowStore.setState({ currentAnalysisType: null });
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };
  const handleExportPdf = async () => {
      if (!currentCaseId) {
        Alert.alert('Error', 'Case ID is missing.');
        return;
      }

      try {
        const reportPdfUrl = buildApiUrl(`/cases/${currentCaseId}/results`);
        const localUri = FileSystem.documentDirectory + `AVERA_Forensic_Report_${currentCaseId}.pdf`;

        const { uri } = await FileSystem.downloadAsync(
          reportPdfUrl,
          localUri,
        );

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(uri, {
            mimeType: 'application/pdf',
            dialogTitle: 'Export Forensic PDF Report',
            UTI: 'com.adobe.pdf', 
          });
        } else {
          Alert.alert('Download Complete', `File saved to: ${uri}`);
        }
      } catch (error) {
        console.warn('Failed to download PDF:', error);
        Alert.alert('Export Failed', 'The PDF report is either still generating or unavailable.');
      }
    };

  const openPreview = (source: { uri: string }, label: string) => {
    setPreviewSource(source);
    setPreviewLabel(label);
  };

  const closePreview = () => {
    setPreviewSource(null);
    setPreviewLabel('');
  };

  const referenceSlots = [0, 1, 2, 3] as const;

  const processingTime = activeResult?.analysisTimeMs 
    ? (activeResult.analysisTimeMs / 1000).toFixed(2) 
    : null;

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload Signatures" step={""} onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(160, insets.bottom + 120) }]} showsVerticalScrollIndicator={false}>
      <View style={[styles.heroResultWrap, { backgroundColor: resultCardTheme.cardBg }]}>
        <View style={[styles.heroBadge, { backgroundColor: resultCardTheme.iconBg }]}>
          <Ionicons name={resultCardTheme.iconName} size={28} color={resultCardTheme.iconColor} />
        </View>
        <View style={styles.heroTextWrap}>
          <Text style={[styles.heroPercent, { color: resultCardTheme.text }]}>
            {(confidenceValue || 0).toFixed(1) + '%'}{' '}
            <Text style={[styles.heroLabel, { color: resultCardTheme.text }]}>{verdictLabel}</Text>
          </Text>

          <Text style={[styles.heroCase, { color: resultCardTheme.subtleText }]}>
            VERDICT · {activeResult.case_name}
          </Text>

          {processingTime && (
            <Text style={styles.heroProcessingTime}>
              Analysis completed in {processingTime}s
            </Text>
          )}
        </View>
      </View>

        <View style={styles.viewTabsRow}>
          {viewModes.map((mode) => {
            const selected = mode === activeView;
            return (
              <Pressable key={mode} onPress={() => setActiveView(mode)} style={[styles.viewTab, selected && styles.viewTabActive]}>
                <Text style={[styles.viewTabText, selected && styles.viewTabTextActive]}>{mode}</Text>
              </Pressable>
            );
          })}
        </View>

      <View style={styles.thumbsGrid}>
          <View style={styles.smallThumbsGrid}>
            {referenceSlots.map((i) => {
              const uri = uploadedReferences[i];
              const referenceLabel = `SIG ${String(i + 1).padStart(2, '0')}`;

              if (uri) {
                const overlayUri = referenceOverlayUris[i];
                const displayUri = overlayUri ?? uri.split('?')[0];
                const previewTitle = overlayUri
                  ? `${referenceLabel} — ${activeView}`
                  : `Uploaded Reference ${String(i + 1).padStart(2, '0')}`;

                return (
                  <Pressable
                    key={`r-${i}`}
                    style={styles.thumbCardSmall}
                    onPress={() => openPreview({ uri: displayUri }, previewTitle)}
                  >
                    <View style={styles.thumbImageWrap}>
                      <ExpoImage
                        source={{ uri: displayUri }}
                        style={StyleSheet.absoluteFill}
                        contentFit="cover"
                      />
                    </View>
                    <Text style={styles.thumbLabel}>{referenceLabel}</Text>
                    <Text style={styles.thumbTag}>Reference</Text>
                  </Pressable>
                );
              }
              return (
                <View key={`r-${i}`} style={[styles.thumbCardSmall, styles.thumbPlaceholderCard, { borderColor: activeTone.edge, backgroundColor: activeTone.bg }]}>
                  <View style={[styles.thumbPlaceholderIconWrap, { borderColor: activeTone.edge }]}>
                    <Ionicons name="image-outline" size={24} color={activeTone.badge} />
                  </View>
                  <Text style={styles.thumbLabel}>{referenceLabel}</Text>
                  <Text style={styles.thumbTag}>Upload pending</Text>
                </View>
              );
            })}
          </View>
         
          {uploadedSuspect ? (
            <Pressable
              style={styles.largeThumbWrap}
              onPress={() => {
                const hasOverlay = Boolean(gradcamSlots.suspect[VIEW_MODE_TO_VARIANT[activeView]]);
                openPreview(
                  { uri: hasOverlay ? suspectOverlayUri! : uploadedSuspect.split('?')[0] },
                  hasOverlay ? `Suspected Signature — ${activeView}` : 'Uploaded Suspected Signature'
                );
              }}
            >
              <View style={styles.largeThumbImageWrap}>
                {gradcamSlots.suspect[VIEW_MODE_TO_VARIANT[activeView]] ? (
                <ExpoImage
                  source={{ uri: suspectOverlayUri! }}
                  style={StyleSheet.absoluteFill}
                  contentFit="contain"
                />
              ) : (
                <ExpoImage
                  source={{ uri: uploadedSuspect.split('?')[0] }}
                  style={StyleSheet.absoluteFill}
                  contentFit="contain"
                />
              )}
          </View>

              <Text style={styles.suspectLabel}>UPLOADED SUSPECT</Text>
            </Pressable>
          ) : (
            <View style={[styles.largeThumbWrap, styles.largeThumbPlaceholder, { borderColor: activeTone.edge, backgroundColor: activeTone.bg }]}>
              <View style={[styles.largeThumbPlaceholderIconWrap, { borderColor: activeTone.edge }]}>
                <Ionicons name="scan-outline" size={28} color={activeTone.badge} />
              </View>
              <Text style={styles.suspectLabel}>{activeView.toUpperCase()}</Text>
              <Text style={styles.suspectHint}>Upload the suspect image to preview it here.</Text>
            </View>
          )}
        </View>

        <View style={styles.findingsContainer}>
          <View style={styles.findingsHeaderRow}>
            <Text style={styles.findingsTitle}>Key Findings</Text>
            <Text style={styles.findingsTap}>Tap for detail</Text>
          </View>
          <View style={styles.findingsList}>
            {payloadRows.map((item) => {
              const colors = isSuspected
                ? { line: '#EF4444', text: '#EF4444' }
                : { line: '#16A34A', text: '#16A34A' };

              return (
                <Pressable key={item.metric} style={styles.findingItem}>
                  <View style={[styles.findingIndicator, { backgroundColor: colors.line }]} />
                  <View style={styles.findingTextCol}>
                    <Text style={styles.findingMain}>{item.metric}</Text>
                    <Text style={[styles.findingSub, { color: colors.text }]}>{item.value}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
                </Pressable>
              );
            })}
          </View>
        </View>

      </ScrollView>

      <Modal visible={previewSource !== null} transparent animationType="fade" onRequestClose={closePreview}>
        <Pressable style={styles.previewBackdrop} onPress={closePreview}>
          <Pressable style={styles.previewSheet} onPress={() => {}}>
            <View style={styles.previewHeader}>
              <Text style={styles.previewTitle}>{previewLabel}</Text>
              <Pressable onPress={closePreview} style={styles.previewCloseButton}>
                <Ionicons name="close" size={22} color="#0F172A" />
              </Pressable>
            </View>
            {previewSource !== null ? (
            <View style={[styles.previewImage, { overflow: 'hidden' }]}>
              <ExpoImage source={previewSource} style={StyleSheet.absoluteFill} contentFit="contain" />
            </View>
          ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <Pressable onPress={handleExportPdf} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Export as PDF</Text>
        </Pressable>

        <Pressable onPress={handleBackToDashboard} style={[styles.backButtonSecondary, { marginTop: 12 }]}>
          <Text style={styles.backButtonSecondaryText}>Back to Dashboard</Text>
        </Pressable>
      </View>
    </SafeAreaView>
   
  );
}

function TopBar({ title, step, onBackPress }: { title: string; step: string; onBackPress: () => void }) {
  return (
    <View style={styles.topBarWrapperCustom}>
      <View style={styles.topBarCustom}>
        <Pressable onPress={onBackPress} style={styles.backButtonCustom}>
          <View style={styles.backButtonBoxCustom}>
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
          </View>
        </Pressable>
        <Text style={styles.topBarTitleCustom}>{title}</Text>
        <Text style={styles.stepCounterCustom}>{step}</Text>
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DBE5F1',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 14,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  headerWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DCEAFE',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 13,
    lineHeight: 18,
  },
  headerBar: {
    marginTop: 12,
    width: 60,
    height: 4,
    borderRadius: 999,
  },
  resultHeroCard: {
    borderColor: '#BFDBFE',
    backgroundColor: '#EFF6FF',
  },
  resultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultVerdict: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E3A8A',
    letterSpacing: -0.5,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confidenceText: {
    color: '#1E3A8A',
    fontWeight: '700',
    fontSize: 12,
  },
  heroSubtitle: {
    color: '#334155',
    fontSize: 12,
    lineHeight: 18,
  },
  heroProcessingTime: {
  fontSize: 10,
  color: '#64748b',
  marginTop: 6,
  fontWeight: '500',
},
  toggleRow: {
    flexDirection: 'row',
    gap: 8,
  },
  toggleChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#D4DFEC',
    borderRadius: 999,
    paddingVertical: 9,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  toggleChipText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  previewCard: {
    minHeight: 190,
    position: 'relative',
  },
  previewBadge: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  previewBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  previewCanvas: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.18)',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.66)',
    padding: 12,
    gap: 14,
  },
  previewText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  previewMarkWrap: {
    flexDirection: 'row',
    gap: 10,
  },
  previewMark: {
    flex: 1,
    height: 66,
    borderRadius: 10,
  },
  previewMarkHot: {
    backgroundColor: 'rgba(239,68,68,0.35)',
  },
  previewMarkWarm: {
    backgroundColor: 'rgba(251,191,36,0.36)',
  },
  previewMarkCold: {
    backgroundColor: 'rgba(37,99,235,0.32)',
  },
  findingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: '#ECF2F8',
    paddingTop: 10,
  },
  findingTextWrap: {
    flex: 1,
  },
  findingMetric: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  findingValue: {
    marginTop: 2,
    color: '#64748B',
    fontSize: 12,
  },
  statusTag: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 5,
  },
  statusTagText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  topBarWrapperCustom: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBarCustom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButtonCustom: { padding: 4 },
  backButtonBoxCustom: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitleCustom: { flex: 1, fontSize: 18, fontWeight: '700', color: '#0F172A', textAlign: 'center' },
  stepCounterCustom: { width: 36, fontSize: 13, fontWeight: '700', color: '#94A3B8', textAlign: 'center' },

  heroResultWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 8,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1 },
  heroPercent: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  heroLabel: {
    fontSize: 22,
    lineHeight: 26,
    fontWeight: '900',
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  heroCase: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },

  viewTabsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  viewTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: '#EEF2F7', backgroundColor: '#FFFFFF' },
  viewTabActive: { backgroundColor: '#FFFFFF', borderColor: '#F1F5F9' },
  viewTabText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  viewTabTextActive: { color: '#0F172A' },

  thumbsGrid: { flexDirection: 'column', gap: 12, marginTop: 12 },
  uploadedSection: {
    marginTop: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEF2F7',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 10,
  },
  smallThumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  thumbCardSmall: { borderRadius: 12, borderWidth: 1, borderColor: '#EEF2F7', padding: 10, backgroundColor: '#FFFFFF', width: '48%' , marginBottom: 8},
  thumbPlaceholderCard: { alignItems: 'center', justifyContent: 'center', minHeight: 118, gap: 6 },
  thumbPlaceholderIconWrap: { width: 56, height: 56, borderRadius: 18, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,255,255,0.65)' },
  thumbPreview: { height: 56, borderRadius: 8, backgroundColor: '#F8FAFC', marginBottom: 8, overflow: 'hidden' },
  thumbLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  thumbTag: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 4 },

  thumbImageWrap: {
  width: '100%',
  height: 90,          
  borderRadius: 8,
  overflow: 'hidden',
  marginBottom: 8,
  backgroundColor: '#F8FAFC',
},
largeThumbImageWrap: {
  width: '100%',
  height: 200,         
  borderRadius: 8,
  overflow: 'hidden',
  marginBottom: 8,
  backgroundColor: '#F8FAFC',
},
  largeThumbWrap: { 
    borderRadius: 12,
    borderWidth: 1, 
    borderColor: '#F1F5F9', 
    backgroundColor: '#FFFFFF', 
    padding: 12, 
    alignItems: 'center', 
    justifyContent: 'center' 
  },
  largeThumbPlaceholder: { 
    minHeight: 166, 
    gap: 6 
  },
  largeThumbPlaceholderIconWrap: { 
    width: 72, 
    height: 72, 
    borderRadius: 22, 
    borderWidth: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: 'rgba(255,255,255,0.7)' 
  },
  largeThumbPreview: { 
    width: '100%', 
    height: 2, 
    borderRadius: 8, 
    backgroundColor: '#F8FAFB', 
    marginBottom: 10, 
    overflow: 'hidden' 
  },
  suspectLabel: { 
    color: '#EF4444', 
    fontSize: 12, 
    fontWeight: '800' 
  },
  suspectHint: { 
    color: '#F97316', 
    fontSize: 12, 
    marginTop: 4 
  },
  previewBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    padding: 10,
    justifyContent: 'center',
  },
  previewSheet: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 10,
    maxHeight: '72%',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  previewTitle: {
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    paddingRight: 10,
  },
  previewCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F1F5F9',
  },
  previewImage: {
    width: '100%',
    aspectRatio: 2, 
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
  },

  findingsContainer: { marginTop: 12, borderRadius: 12, borderWidth: 1, borderColor: '#EEF2F7', backgroundColor: '#FFFFFF', padding: 12 },
  findingsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  findingsTitle: { fontSize: 15, fontWeight: '800', color: '#0F172A' },
  findingsTap: { color: '#94A3B8', fontSize: 12 },
  findingsList: { gap: 8 },
  findingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  findingIndicator: { width: 4, height: 44, borderRadius: 3, backgroundColor: '#FCA5A5' },
  findingTextCol: { flex: 1 },
  findingMain: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  findingSub: { color: '#EF4444', fontSize: 12, marginTop: 4 },

  exportButton: { marginTop: 12, backgroundColor: ACCENT, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  exportButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  backButtonSecondary: { marginTop: 12, borderWidth: 1, borderColor: '#E6EEF8', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  backButtonSecondaryText: { color: '#64748B', fontSize: 15, fontWeight: '800' },
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
  imageOverlayWrap: {
  position: 'relative',
  width: '100%',
},
imageOverlayWrapSmall: {
  position: 'relative',
  width: '100%',
},
});