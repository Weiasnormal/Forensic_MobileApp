import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as Sharing from 'expo-sharing';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import * as FileSystem from 'expo-file-system/legacy';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import {
    findOverlayImage, 
    REFERENCE_SLOTS,
    getSignatureAnalysisCaseStatus,
    getSignatureAnalysisVerdictLabel,
    resolveCaseVerdict,
    type SignatureAnalysisResult,
    type SignatureAnalysisViewMode,
    type OverlayVariant,
} from '@/services/signatureAnalysis';
import { API_ENDPOINTS, buildApiUrl, API_KEY } from '../../../constants/api';
import { useAnalysisFlowStore } from '../../../store/analysisFlowStore';
import { type CaseStatus, useCaseStore } from '../../../store/caseStore';

const getAuthImageSource = (uri?: string | null) => {
  if (!uri) return undefined;

  if (uri.startsWith('file://') || uri.startsWith('data:')) {
    return { uri };
  }
  
  return {
    uri,
    headers: {
      'X-Api-Key': API_KEY || '',
    },
  };
};
const viewModes = ['Heatmap', 'Bounding Box', 'Stroke Diff'] as const;

const VIEW_MODE_TO_VARIANT: Record<ViewMode, OverlayVariant> = {
  'Heatmap': 'Overlay',
  'Bounding Box': 'BoundingBox',
  'Stroke Diff': 'StrokeDiff',
};

type ViewMode = SignatureAnalysisViewMode;

const VIEW_MODE_THEME: Record<ViewMode, { bg: string; edge: string; badge: string }> = {
  'Heatmap': { bg: '#DBEAFE', edge: '#60A5FA', badge: '#1D4ED8' },
  'Bounding Box': { bg: '#E0F2FE', edge: '#38BDF8', badge: '#0369A1' },
  'Stroke Diff': { bg: colors.inputBorder, edge: colors.label, badge: colors.statsTextPrimary },
};

function buildPayloadRows(result: SignatureAnalysisResult, verdictLabel: string, currentCase: any) {
  const { isSuspected } = resolveCaseVerdict(currentCase, result);
  const isForged = isSuspected;

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

export function SignatureResultsScreen() {
  const router = useRouter();
  const nav = router as any;

  const params = useLocalSearchParams<{ caseId?: string }>();
  const setActiveSignatureCaseId = useCaseStore((state) => state.setActiveSignatureCaseId);

  useEffect(() => {
    if (params.caseId) {
      setActiveSignatureCaseId(params.caseId);
    }

    return () => {
      setActiveSignatureCaseId(null);
    };
  }, [params.caseId, setActiveSignatureCaseId]);

  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);

  const safeCaseId = String(currentCaseId).trim();
  const analysisResult = useCaseStore((state) =>
    safeCaseId ? state.signatureAnalysisResults[safeCaseId] : undefined,
  );
  const currentCase = useCaseStore((state) =>
    safeCaseId ? state.cases.find((c) => String(c.caseId) === safeCaseId) : undefined,
  );

  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');
  const insets = useSafeAreaInsets();
  const [previewSource, setPreviewSource] = useState<{ uri: string } | null>(null);
  const [previewLabel, setPreviewLabel] = useState('');

  const activeTone = useMemo(() => VIEW_MODE_THEME[activeView], [activeView]);

  const payloadRows = useMemo(() => {
    if (!analysisResult) return [];
    const finalVerdict = currentCase?.verdict || currentCase?.Verdict || 'UNKNOWN';
    const verdictLabel = getSignatureAnalysisVerdictLabel(finalVerdict as any);
    return buildPayloadRows(analysisResult, verdictLabel, currentCase);
  }, [analysisResult, currentCase]);

  const referenceOverlayUris = useMemo(() => {
  const variant = VIEW_MODE_TO_VARIANT[activeView];
    return REFERENCE_SLOTS.map((slot) => {
      const ref = findOverlayImage(analysisResult?.overlay_images, slot, variant);
      return currentCaseId && ref
        ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(currentCaseId, ref.id))
        : null;
    });
  }, [currentCaseId, analysisResult, activeView]);

  const suspectOverlayUri = useMemo(() => {
    const ref = findOverlayImage(analysisResult?.overlay_images, 'Suspected', VIEW_MODE_TO_VARIANT[activeView]);
    return currentCaseId && ref
      ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(currentCaseId, ref.id))
      : null;
  }, [currentCaseId, analysisResult, activeView]);

  // Prefetch all overlay images to reduce flicker when switching views
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
        <View style={styles.centerFill}>
          <Ionicons name="warning-outline" size={48} color={colors.danger} style={styles.errorIcon} />
          <Text style={styles.errorTitle}>Data Missing</Text>
          <Text style={styles.errorSubtitle}>No analysis results found from the server.</Text>
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
        cardBg: colors.dangerLight,
        iconBg: colors.danger,
        text: colors.danger,
        subtleText: colors.textSecondary,
        iconName: 'alert-circle' as const,
        iconColor: colors.primaryText,
      }
    : {
        cardBg: colors.statusGenuineBg,
        iconBg: colors.statusGenuine,
        text: colors.statusGenuine,
        subtleText: colors.textSecondary,
        iconName: 'checkmark-circle' as const,
        iconColor: colors.primaryText,
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
      <TopBar title="Upload Signatures" step={''} onBackPress={() => nav.back()} />

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
                const hasOverlay = Boolean(findOverlayImage(analysisResult?.overlay_images, 'Suspected', VIEW_MODE_TO_VARIANT[activeView]));
                openPreview(
                  { uri: hasOverlay ? suspectOverlayUri! : uploadedSuspect.split('?')[0] },
                  hasOverlay ? `Suspected Signature — ${activeView}` : 'Uploaded Suspected Signature'
                );
              }}
            >
              <View style={styles.largeThumbImageWrap}>
                {findOverlayImage(analysisResult?.overlay_images, 'Suspected', VIEW_MODE_TO_VARIANT[activeView]) ? (
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
              // Exact match for the "genuine" case (statusGenuine); "suspected"
              // case reuses colors.danger as the closest existing red (see
              // resultCardTheme note above — not an exact hex match).
              const findingTone = isSuspected
                ? { line: colors.danger, text: colors.danger }
                : { line: colors.statusGenuine, text: colors.statusGenuine };

              return (
                <Pressable key={item.metric} style={styles.findingItem}>
                  <View style={[styles.findingIndicator, { backgroundColor: findingTone.line }]} />
                  <View style={styles.findingTextCol}>
                    <Text style={styles.findingMain}>{item.metric}</Text>
                    <Text style={[styles.findingSub, { color: findingTone.text }]}>{item.value}</Text>
                  </View>
                  <Ionicons name="chevron-forward" size={18} color={colors.label} />
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
                <Ionicons name="close" size={22} color={colors.textPrimary} />
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
        <PrimaryButton label="Export as PDF" onPress={handleExportPdf} size="medium" />
        <SecondaryButton label="Back to Dashboard" onPress={handleBackToDashboard} size="medium" style={styles.secondaryButtonSpacing} />
      </View>
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
    backgroundColor: colors.background2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    gap: 16,
  },
  centerFill: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorIcon: {
    marginBottom: 12,
  },
  errorTitle: {
    ...getTypographyStyle('headline'),
    color: colors.danger,
  },
  errorSubtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 4,
  },
  heroResultWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderRadius: 22,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 8,
    shadowColor: '#000000', // no black token exists in colors.ts; native shadow color, left as-is
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
    ...getTypographyStyle('t2Title'),
    letterSpacing: -0.3,
  },
  heroLabel: {
    ...getTypographyStyle('t2Title'),
    letterSpacing: -0.3,
    textTransform: 'uppercase',
  },
  heroCase: {
    ...getTypographyStyle('l2List'),
    marginTop: 6,
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  heroProcessingTime: {
    ...getTypographyStyle('c2Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 6,
  },
  viewTabsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  viewTab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    backgroundColor: colors.cardBackground,
  },
  // #F1F5F9 has no exact token match; closest available (~10 hex units off)
  // is statsBackground. Flagging as an approximation, not exact.
  viewTabActive: { backgroundColor: colors.cardBackground, borderColor: colors.statsBackground },
  viewTabText: { ...getTypographyStyle('b3Button'), color: colors.textSecondary },
  viewTabTextActive: { color: colors.textPrimary },

  thumbsGrid: { flexDirection: 'column', gap: 12, marginTop: 12 },
  smallThumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  thumbCardSmall: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    padding: 10,
    backgroundColor: colors.cardBackground,
    width: '48%',
    marginBottom: 8,
  },
  thumbPlaceholderCard: { alignItems: 'center', justifyContent: 'center', minHeight: 118, gap: 6 },
  // rgba(255,255,255,0.65) doesn't match either iconBadgeBackground token
  // (0.88/0.90 opacity) closely enough to swap silently — flagging, left as-is.
  thumbPlaceholderIconWrap: {
    width: 56,
    height: 56,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.65)',
  },
  thumbImageWrap: {
    width: '100%',
    height: 56,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  thumbLabel: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  thumbTag: { ...getTypographyStyle('l2List'), color: colors.statusGenuine, marginTop: 4 },

  largeThumbImageWrap: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.background,
  },
  largeThumbWrap: {
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.statsBackground, 
    backgroundColor: colors.cardBackground,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  largeThumbPlaceholder: {
    minHeight: 166,
    gap: 6,
  },
  largeThumbPlaceholderIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.7)', // same translucent-white flag as thumbPlaceholderIconWrap
  },
  suspectLabel: {
    ...getTypographyStyle('b3Button'),
    color: colors.danger, // #EF4444 approximated to danger #DC2626, not exact
  },
  suspectHint: {
    ...getTypographyStyle('b3Button'),
    color: colors.suspectAccent, // exact semantic fit — this is literally the "suspect" amber family
    marginTop: 4,
  },
  previewBackdrop: {
    flex: 1,
    // Same base color as colors.overlay (rgb(15,23,42)) but heavier opacity
    // (0.82 vs colors.overlay's 0.56) — flagging rather than silently
    // lightening this modal backdrop.
    backgroundColor: 'rgba(15, 23, 42, 0.82)',
    padding: 10,
    justifyContent: 'center',
  },
  previewSheet: {
    backgroundColor: colors.cardBackground,
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
    ...getTypographyStyle('l1List'),
    flex: 1,
    color: colors.textPrimary,
    paddingRight: 10,
  },
  previewCloseButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.statsBackground, // same #F1F5F9 approximation as above
  },
  previewImage: {
    width: '100%',
    aspectRatio: 2,
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
  },

  findingsContainer: {
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.dividerLight,
    backgroundColor: colors.cardBackground,
    padding: 12,
  },
  findingsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  // fontSize 15/bold has no exact token; headline (14/bold) is the closest, ~1px off.
  findingsTitle: { ...getTypographyStyle('headline'), color: colors.textPrimary },
  findingsTap: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },
  findingsList: { gap: 8 },
  findingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: colors.dividerLight,
  },
  findingIndicator: { width: 4, height: 44, borderRadius: 3 },
  findingTextCol: { flex: 1 },
  findingMain: { ...getTypographyStyle('l1List'), color: colors.textPrimary },
  findingSub: { ...getTypographyStyle('c2Caption', 'regular'), marginTop: 4 },

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
  secondaryButtonSpacing: {
    marginTop: 12,
  },

  topBarWrapper: {
    backgroundColor: colors.background2,
    borderBottomWidth: 1,
    borderBottomColor: colors.inputBorder,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: colors.background2,
  },
  backButton: { padding: 4 },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: { flex: 1, ...getTypographyStyle('t3Title'), color: colors.textPrimary, textAlign: 'center' },
  stepCounter: { width: 36, ...getTypographyStyle('l1List'), color: colors.label, textAlign: 'center' },
});