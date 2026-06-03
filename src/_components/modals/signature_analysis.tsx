import { Ionicons } from '@expo/vector-icons';
import { Asset } from 'expo-asset';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import {
    createMockSignatureAnalysisResult,
    getMockSignatureAnalysisAssets,
    getMockSignatureAnalysisPdf,
    getSignatureAnalysisCaseStatus,
    getSignatureAnalysisConfidence,
    getSignatureAnalysisVerdictLabel,
    type MockSignatureAnalysisResult,
    type SignatureAnalysisViewMode,
} from '../../services/mockSignatureAnalysis';
import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
import { type CaseStatus, useCaseStore } from '../../store/caseStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';

const ACCENT = '#1E6FD9';
const SCREEN_BG = '#ffffff';

const viewModes = ['Heatmap', 'Bounding box', 'Stroke diff'] as const;
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

function statusColors(status: 'ok' | 'warning' | 'bad') {
  if (status === 'ok') {
    return { bg: '#ECFDF3', text: '#15803D', border: '#BBF7D0' };
  }

  if (status === 'warning') {
    return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
  }

  return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
}

function buildPayloadRows(result: MockSignatureAnalysisResult, verdictLabel: string) {
  return [
    { metric: 'General information', value: result.case_name },
    { metric: 'Relation to Baseline', value: result.verdict === 'FORGED' ? 'Inconsistent' : 'Simulated Writing' },
    { metric: 'Line Quality', value: result.verdict === 'FORGED' ? 'Tremor detected' : 'Tremor detected' },
    { metric: 'Proportion & Spacing', value: 'Irregular (x4)' },
    { metric: 'Variation', value: 'Beyond controlling pattern' },
  ];
}

function buildSignaturePdfHtml(result: MockSignatureAnalysisResult, verdictLabel: string) {
  const confidence = getSignatureAnalysisConfidence(result).toFixed(1);

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          body { font-family: Arial, sans-serif; margin: 32px; color: #0f172a; }
          h1 { margin: 0 0 8px; font-size: 26px; }
          .sub { color: #64748b; margin-bottom: 20px; font-size: 13px; }
          .card { border: 1px solid #dbe5f1; border-radius: 16px; padding: 18px; margin-bottom: 18px; }
          .verdict { font-size: 22px; font-weight: 700; color: ${verdictLabel === 'SUSPECTED' ? '#eb5757' : '#16a34a'}; }
          .row { display: flex; justify-content: space-between; padding: 10px 0; border-top: 1px solid #eef2f7; }
          .row:first-of-type { border-top: 0; }
          .label { color: #334155; font-weight: 700; }
          .value { color: #0f172a; font-weight: 600; text-align: right; max-width: 60%; }
        </style>
      </head>
      <body>
        <h1>Signature Analysis Report</h1>
        <div class="sub">Mock export generated from the current in-app analysis result</div>
        <div class="card">
          <div class="verdict">${confidence}% ${verdictLabel}</div>
          <div class="sub">Case · ${result.case_name}</div>
          <div class="row"><div class="label">Confidence Genuine</div><div class="value">${result.confidence_genuine.toFixed(4)}%</div></div>
          <div class="row"><div class="label">Confidence Forged</div><div class="value">${result.confidence_forged.toFixed(4)}%</div></div>
          <div class="row"><div class="label">Distance</div><div class="value">${result.distance.toFixed(7)}</div></div>
          <div class="row"><div class="label">Threshold</div><div class="value">${result.threshold.toFixed(4)}</div></div>
          <div class="row"><div class="label">GradCAM Blob</div><div class="value">${result.gradcam_blob_id}</div></div>
        </div>
      </body>
    </html>
  `;
}

// NOTE: Removed static require for a bundled PDF/image to avoid bundling errors when the
// asset isn't present. If you add a real PDF under
// `assets/expo.icon/Assets/SampleTest/pdf/`, update this function to return its URI.

export function SignatureProcessingView() {
  const router = useRouter();
  const nav = router as any;
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);

  const setSignatureStatus = (status: CaseStatus) => {
    if (!currentCaseId) {
      return;
    }

    updateCaseStatus(currentCaseId, status);
  };

  const insets = useSafeAreaInsets();

  const handleBackToHome = () => {
    // Update case status to "Processing" when going back from processing page
    setSignatureStatus('Processing');
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#ffffff' }}>
      <ProcessingScreen
        title="Processing Signature"
        subtitle="AI forensic engine is running multi-stage comparison"
        accentColor={ACCENT}
        steps={processingSteps}
        onComplete={() => {
          if (currentCaseId) {
            nav.replace(`/analysis/signature/results/${currentCaseId}`);
          }
        }}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
        <Pressable
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: '#1E6FD9',
            borderRadius: 14,
            alignItems: 'center',
          }}
          onPress={handleBackToHome}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 15, fontWeight: '800' }}>Back to Home</Text>
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
  const analysisResult = useCaseStore((state) =>
    currentCaseId ? state.signatureAnalysisResults[currentCaseId] : undefined,
  );
  const currentCase = useCaseStore((state) =>
    currentCaseId ? state.cases.find((c) => c.caseId === currentCaseId) : undefined,
  );
  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');
  const [previewSource, setPreviewSource] = useState<number | { uri: string } | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');
  const mockTemplateNumber = currentCase?.mockTemplateNumber ?? 1;

  useEffect(() => {
    if (currentCase?.status === 'Processing') {
      nav.replace('/analysis/signature/processing');
    }
  }, [currentCase?.status, nav]);

  if (currentCase?.status === 'Processing') {
    return null;
  }

  // Build a mock result based on the stored case status (Suspected/Genuine)
  const forcedVerdict = currentCase?.status === 'Suspected' ? 'FORGED' : 'GENUINE';
  const activeResult = analysisResult ?? createMockSignatureAnalysisResult(mockTemplateNumber, forcedVerdict as any);
  const caseAssets = getMockSignatureAnalysisAssets(mockTemplateNumber, activeView);
  const uploadedReferences = currentCase?.uploads.references ?? [];
  const uploadedSuspect = currentCase?.uploads.suspect ?? null;
  const verdictLabel = getSignatureAnalysisVerdictLabel(activeResult.verdict);
  const confidenceValue = getSignatureAnalysisConfidence(activeResult);
  const payloadRows = useMemo(() => buildPayloadRows(activeResult, verdictLabel), [activeResult, verdictLabel]);
  const isSuspected = verdictLabel === 'SUSPECTED';
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
    // Keep the stored case status aligned with the analysis verdict.
    setSignatureStatus(getSignatureAnalysisCaseStatus(activeResult));
    // Reset analysis type
    useAnalysisFlowStore.setState({ currentAnalysisType: null });
    // Navigate to dashboard
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };

  const handleExportPdf = async () => {
    try {
      const pdfModule = getMockSignatureAnalysisPdf(mockTemplateNumber);

      if (!pdfModule) {
        Alert.alert('Export failed', 'Unable to locate the PDF report.');
        return;
      }

      const pdfAsset = Asset.fromModule(pdfModule);
      await pdfAsset.downloadAsync();

      const localUri = pdfAsset.localUri ?? pdfAsset.uri;

      if (!localUri) {
        Alert.alert('Export failed', 'Unable to prepare the PDF report.');
        return;
      }

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(localUri, {
          mimeType: 'application/pdf',
          dialogTitle: 'Export PDF Report',
          UTI: 'com.adobe.pdf',
        });
        return;
      }

      Alert.alert('PDF ready', `Saved to: ${localUri}`);
    } catch (error) {
      console.warn('Failed to export bundled PDF report:', error);
      Alert.alert('Export failed', 'Unable to create the PDF report.');
    }
  };

  const activeTone = useMemo(() => {
    if (activeView === 'Heatmap') {
      return { bg: '#DBEAFE', edge: '#60A5FA', badge: '#1D4ED8' };
    }

    if (activeView === 'Bounding box') {
      return { bg: '#E0F2FE', edge: '#38BDF8', badge: '#0369A1' };
    }

    return { bg: '#E2E8F0', edge: '#94A3B8', badge: '#334155' };
  }, [activeView]);

  const insets = useSafeAreaInsets();
  const openPreview = (source: number | { uri: string }, label: string) => {
    setPreviewSource(source);
    setPreviewLabel(label);
  };

  const closePreview = () => {
    setPreviewSource(null);
    setPreviewLabel('');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload Signatures" step={""} onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(160, insets.bottom + 120) }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.heroResultWrap, { backgroundColor: resultCardTheme.cardBg }]}>
          <View style={[styles.heroBadge, { backgroundColor: resultCardTheme.iconBg }]}>
            <Ionicons name={resultCardTheme.iconName} size={28} color={resultCardTheme.iconColor} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroPercent, { color: resultCardTheme.text }]}>{confidenceValue.toFixed(1)}% <Text style={[styles.heroLabel, { color: resultCardTheme.text }]}>{verdictLabel}</Text></Text>
            <Text style={[styles.heroCase, { color: resultCardTheme.subtleText }]}>VERDICT · {activeResult.case_name}</Text>
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
            {[0, 1, 2, 3].map((i) => (
              <Pressable key={`r-${i}`} style={styles.thumbCardSmall} onPress={() => openPreview(caseAssets.references[i], `Reference ${String(i + 1).padStart(2, '0')}`)}>
                <ExpoImage source={caseAssets.references[i]} style={styles.thumbPreview} contentFit="cover" />
                <Text style={styles.thumbLabel}>{`SIG ${String(i + 1).padStart(2, '0')}`}</Text>
                <Text style={styles.thumbTag}>Reference</Text>
              </Pressable>
            ))}
          </View>

          <Pressable style={styles.largeThumbWrap} onPress={() => openPreview(caseAssets.suspect, `Suspect · ${activeView}`)}>
            <ExpoImage source={caseAssets.suspect} style={styles.largeThumbPreview} contentFit="cover" />
            <Text style={styles.suspectLabel}>{activeView.toUpperCase()}</Text>
          </Pressable>
        </View>

        {(uploadedReferences.some(Boolean) || uploadedSuspect) ? (
          <View style={styles.uploadedSection}>
            <View style={styles.findingsHeaderRow}>
              <Text style={styles.findingsTitle}>Uploaded Signatures</Text>
              <Text style={styles.findingsTap}>Tap to enlarge</Text>
            </View>

            <View style={styles.smallThumbsGrid}>
              {uploadedReferences.map((uri, index) => {
                if (!uri) {
                  return null;
                }

                return (
                  <Pressable
                    key={`uploaded-ref-${index}`}
                    style={styles.thumbCardSmall}
                    onPress={() => openPreview({ uri }, `Uploaded Reference ${String(index + 1).padStart(2, '0')}`)}
                  >
                    <ExpoImage source={{ uri }} style={styles.thumbPreview} contentFit="cover" />
                    <Text style={styles.thumbLabel}>{`SIG ${String(index + 1).padStart(2, '0')}`}</Text>
                    <Text style={styles.thumbTag}>Uploaded Reference</Text>
                  </Pressable>
                );
              })}
            </View>

            {uploadedSuspect ? (
              <Pressable
                style={styles.largeThumbWrap}
                onPress={() => openPreview({ uri: uploadedSuspect }, 'Uploaded Suspected Signature')}
              >
                <ExpoImage source={{ uri: uploadedSuspect }} style={styles.largeThumbPreview} contentFit="cover" />
                <Text style={styles.suspectLabel}>UPLOADED SUSPECT</Text>
              </Pressable>
            ) : null}
          </View>
        ) : null}

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
              <ExpoImage source={previewSource} style={styles.previewImage} contentFit="contain" />
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <Pressable onPress={handleExportPdf} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Export PDF Report</Text>
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

function StepHeader({
  title,
  subtitle,
  accentColor,
}: {
  title: string;
  subtitle: string;
  accentColor: string;
}) {
  return (
    <View style={styles.headerWrap}>
      <Text style={styles.headerTitle}>{title}</Text>
      <Text style={styles.headerSubtitle}>{subtitle}</Text>
      <View style={[styles.headerBar, { backgroundColor: accentColor }]} />
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
  /* --- New styles for results layout --- */
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
  thumbPreview: { height: 56, borderRadius: 8, backgroundColor: '#F8FAFC', marginBottom: 8, overflow: 'hidden' },
  thumbLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  thumbTag: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 4 },

  largeThumbWrap: { borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF', padding: 12, alignItems: 'center', justifyContent: 'center' },
  largeThumbPreview: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#F8FAFB', marginBottom: 10, overflow: 'hidden' },
  suspectLabel: { color: '#EF4444', fontSize: 12, fontWeight: '800' },
  suspectHint: { color: '#F97316', fontSize: 12, marginTop: 4 },

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
    height: 300,
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
});