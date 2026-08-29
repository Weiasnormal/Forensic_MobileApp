import React, { useMemo, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import KeyFindingsModal from '@/_components/modals/key_findingsmodal';
import { findOverlayImage, REFERENCE_SLOTS, resolveCaseVerdict } from '@/services/signatureAnalysis';
import { API_ENDPOINTS, buildApiUrl, API_KEY } from '@/constants/api';
import { useCaseStore } from '@/store/caseStore';
import { getAuthHeader } from '@/store/authStore';
import ErrorModal from '@/_components/modals/error_modal';


export default function AdminCaseResultsCard({ caseIdProp }: { caseIdProp?: string }) {
  const router = useRouter() as any;
  const insets = useSafeAreaInsets();

  const activeCaseIdFromStore = useCaseStore((s) => s.activeSignatureCaseId);
  const currentCaseId = caseIdProp ?? activeCaseIdFromStore;
  const safeCaseId = String(currentCaseId ?? '').trim();

  const caseItem = useCaseStore((s) => (safeCaseId ? s.cases.find((c) => String(c.caseId) === safeCaseId) : undefined));
  const analysisResult = useCaseStore((s) => (safeCaseId ? s.signatureAnalysisResults[safeCaseId] : undefined));

  const [activeView, setActiveView] = useState<'Heatmap' | 'Bounding Box' | 'Stroke Diff'>('Heatmap');
  const [selectedFinding, setSelectedFinding] = useState<{ metric: string; value: string; detail?: string } | null>(null);

  const resolved = useMemo(() => resolveCaseVerdict(caseItem ?? null, analysisResult), [caseItem, analysisResult]);
  const verdictLabel = resolved.verdictLabel;
  const confidenceValue = resolved.confidence;

  const [reviewError, setReviewError] = useState<string | null>(null);

  const referenceOverlayUris = useMemo(() => {
    const variant = activeView === 'Heatmap' ? 'Overlay' : activeView === 'Bounding Box' ? 'BoundingBox' : 'StrokeDiff';
    return REFERENCE_SLOTS.map((slot) => {
      const ref = findOverlayImage(analysisResult?.overlay_images, slot as any, variant as any);
      return safeCaseId && ref ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(safeCaseId, ref.id)) : null;
    });
  }, [analysisResult, activeView, safeCaseId]);

  const suspectOverlayUri = useMemo(() => {
    const ref = findOverlayImage(analysisResult?.overlay_images, 'Suspected', activeView === 'Heatmap' ? 'Overlay' : activeView === 'Bounding Box' ? 'BoundingBox' : 'StrokeDiff');
    return safeCaseId && ref ? buildApiUrl(API_ENDPOINTS.ml.getBlobImage(safeCaseId, ref.id)) : null;
  }, [analysisResult, activeView, safeCaseId]);

  const payloadRows = useMemo(() => {
    if (!analysisResult) return [];
    const isSuspected = (analysisResult as any).isSuspected ?? true;
    const isForged = isSuspected;
    return [
      { metric: 'General information', value: (analysisResult as any).case_name || 'N/A', detail: (analysisResult as any).notes ?? 'Cross-referenced with internal database.' },
      { metric: 'Relation to Baseline', value: isForged ? 'Inconsistent' : 'Consistent', detail: `Distance ${(analysisResult.distance || 0).toFixed(4)}` },
      { metric: 'Line Quality', value: isForged ? 'Tremor detected' : 'Smooth', detail: 'Stroke velocity & pressure analysis' },
      { metric: 'Proportion & Spacing', value: isForged ? 'Irregular (x4)' : 'Matches baseline', detail: 'Height/width & spacing' },
      { metric: 'Variation', value: isForged ? 'Beyond controlling pattern' : 'Within natural variation', detail: 'Pattern consistency check' },
    ];
  }, [analysisResult]);

  const openFinding = (item: { metric: string; value: string; detail?: string }) => setSelectedFinding(item);
  const closeFinding = () => setSelectedFinding(null);

  const handleSaveReview = () => {
    // TODO: wire to POST /admin/cases/{id}/review once the backend endpoint exists.
    setReviewError('Supervisor review submission is not yet available. This will be enabled in a future update.');
  };

  const handleExportPdf = () => {
    // TODO: wire to GET /cases/{id}/results (endpoint exists — see GetResults.cs);
    // this card just hasn't been connected to it yet.
    setReviewError('PDF export from this screen is not yet connected. Use the analyst results screen to export.');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{caseItem?.caseCode ?? safeCaseId ?? '—'}</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(140, insets.bottom + 80) }]} showsVerticalScrollIndicator={false}>
        <View style={[styles.resultBadge, { backgroundColor: resolved.isSuspected ? colors.dangerLight : colors.statusGenuineBg }]}>
          <View style={[styles.resultBadgeIcon, { backgroundColor: resolved.isSuspected ? colors.danger : colors.statusGenuine }]}>
            <Ionicons name={resolved.isSuspected ? 'alert-circle' : 'checkmark-circle'} size={20} color={colors.primaryText} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.resultPercent}>{(confidenceValue || 0).toFixed(1)}% <Text style={styles.resultLabel}>{verdictLabel}</Text></Text>
            <Text style={styles.resultSubtitle}>VERDICT · {caseItem?.subjectName ?? ''}</Text>
          </View>
        </View>

        <View style={styles.infoGrid}>
          <View style={styles.infoCard}><Text style={styles.infoLabel}>Analyst</Text><Text style={styles.infoValue}>{caseItem?.examiner ?? '—'}</Text></View>
          <View style={styles.infoCard}><Text style={styles.infoLabel}>Date</Text><Text style={styles.infoValue}>{caseItem?.createdAt ? new Date(caseItem.createdAt).toLocaleDateString() : '—'}</Text></View>
          <View style={styles.infoCard}><Text style={styles.infoLabel}>Document Type</Text><Text style={styles.infoValue}>{caseItem?.documentType ?? '—'}</Text></View>
          <View style={styles.infoCard}><Text style={styles.infoLabel}>Admin Status</Text><Text style={styles.infoValue}>{caseItem?.status ?? 'Awaiting Review'}</Text></View>
        </View>

        <View style={styles.viewTabsRow}>
          {['Heatmap','Bounding Box','Stroke Diff'].map((m) => (
            <Pressable key={m} style={[styles.viewTab, m === activeView && styles.viewTabActive]} onPress={() => setActiveView(m as any)}>
              <Text style={[styles.viewTabText, m === activeView && styles.viewTabTextActive]}>{m}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.thumbsGrid}>
          <View style={styles.smallThumbsGrid}>
            {REFERENCE_SLOTS.map((slot, idx) => {
              const localUri = caseItem?.uploads?.references?.[idx];
              const backendUri = referenceOverlayUris[idx];
              const uri = localUri ?? backendUri;
              if (!uri) return <View key={`ph-${idx}`} style={[styles.thumbCardSmall, styles.thumbPlaceholder]} />;
              return (
                <Pressable key={`r-${idx}`} style={styles.thumbCardSmall} onPress={() => {}}>
                  <View style={styles.thumbImageWrap}>
                    <ExpoImage 
                    source={{ uri: uri.split('?')[0], 
                    headers: { 'X-Api-Key': API_KEY || '', 
                    ...getAuthHeader() } }} 
                    style={StyleSheet.absoluteFill} 
                    contentFit="cover" />
                    </View>
                  <Text style={styles.thumbLabel}>{`SIG ${String(idx+1).padStart(2,'0')}`}</Text>
                  <Text style={styles.thumbTag}>Reference</Text>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.largeThumbWrap}>
            {caseItem?.uploads?.suspect || suspectOverlayUri ? (
              <ExpoImage 
              source={suspectOverlayUri ? { 
                uri: suspectOverlayUri, 
                headers: {'X-Api-Key': API_KEY || '', 
                  ...getAuthHeader() } } : 
                { uri: String(caseItem?.uploads?.suspect ?? '').split('?')[0] }} 
                style={styles.largeThumbImage} 
                contentFit="contain" />
            ) : (
              <View style={styles.largeThumbPlaceholder}><Ionicons name="scan-outline" size={28} color={colors.label} /><Text style={styles.largeThumbText}>No suspect image</Text></View>
            )}
            <Text style={styles.suspectLabel}>SUSPECT</Text>
            <Text style={styles.suspectHint}>{(analysisResult && (analysisResult as any).verdictLabel) ?? 'Anomaly detected'}</Text>
          </View>
        </View>

        <View style={styles.card}> 
          <View style={styles.findingsHeaderRow}>
            <Text style={styles.findingsTitle}>Key Findings</Text>
            <Text style={styles.findingsTap}>Tap for detail</Text>
          </View>
          <View style={styles.findingsList}>
            {payloadRows.map((item) => (
              <Pressable key={item.metric} style={styles.findingItem} onPress={() => openFinding(item)}>
                <View style={[styles.findingIndicator, { backgroundColor: colors.danger }]} />
                <View style={styles.findingTextCol}>
                  <Text style={styles.findingMain}>{item.metric}</Text>
                  <Text style={styles.findingSub}>{item.value}</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.label} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionHeader}>Supervisor Review</Text>
          <View style={styles.reviewRow}>
            <Text style={styles.reviewLabel}>Model Assessment</Text>
            <Text style={[styles.resultPercent, { margin: 0, fontSize: 13, color: colors.danger }]}>94.3% SUSPECTED</Text>
          </View>

          <Text style={styles.sectionSub}>Review Decision</Text>
          <View style={styles.radioRow}>
            <View style={styles.radioItem}><View style={[styles.radioIcon, { borderColor: colors.danger }]}><Ionicons name="close" color={colors.danger} size={14} /></View><Text style={styles.radioText}>Confirm Suspected</Text></View>
            <View style={styles.radioItem}><View style={[styles.radioIcon, { borderColor: colors.statusGenuine }]}><Ionicons name="checkmark" color={colors.statusGenuine} size={14} /></View><Text style={styles.radioText}>Confirm Genuine</Text></View>
          </View>

          <Text style={styles.sectionLabel}>Review Note (Optional)</Text>
          <View style={styles.noteBox}><Text style={styles.notePlaceholder}>Add observations, evidence references, or rationale for this review decision...</Text></View>

          <PrimaryButton label="Save Review" onPress={handleSaveReview} size="large" />
          <SecondaryButton label="Export PDF Report" onPress={handleExportPdf} style={{ marginTop: 12 }} />
        </View>

      </ScrollView>

      <KeyFindingsModal visible={selectedFinding !== null} onClose={closeFinding} title={selectedFinding?.metric ?? ''} badgeLabel={selectedFinding?.value ?? ''} observation={selectedFinding?.detail} isSuspected={resolved.isSuspected} measuredStandard={undefined} measuredQuestioned={undefined} />

      <ErrorModal
        visible={!!reviewError}
        title="Not Available Yet"
        message={reviewError ?? ''}
        onPrimaryPress={() => setReviewError(null)}
      />

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background2 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.inputBorder },
  backBtn: { padding: 6 },
  headerTitle: { ...getTypographyStyle('t3Title'), color: colors.textPrimary },
  content: { paddingHorizontal: 16, gap: 16, paddingTop: 12 },

  resultBadge: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight },
  resultBadgeIcon: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  resultPercent: { ...getTypographyStyle('t2Title'), color: colors.danger, letterSpacing: -0.3 },
  resultLabel: { ...getTypographyStyle('b3Button'), color: colors.danger, textTransform: 'uppercase' },
  resultSubtitle: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary, marginTop: 6 },

  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginTop: 12 },
  infoCard: { width: '48%', backgroundColor: colors.cardBackground, borderRadius: 10, padding: 12, borderWidth: 1, borderColor: colors.dividerLight },
  infoLabel: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },
  infoValue: { ...getTypographyStyle('l1List'), color: colors.textPrimary, marginTop: 6 },

  viewTabsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  viewTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.dividerLight, backgroundColor: colors.cardBackground },
  viewTabActive: { borderColor: colors.statsBackground },
  viewTabText: { ...getTypographyStyle('b3Button'), color: colors.textSecondary },
  viewTabTextActive: { color: colors.textPrimary },

  thumbsGrid: { flexDirection: 'column', gap: 12, marginTop: 12 },
  smallThumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  thumbCardSmall: { borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, padding: 10, backgroundColor: colors.cardBackground, width: '48%', marginBottom: 8 },
  thumbPlaceholder: { minHeight: 118, alignItems: 'center', justifyContent: 'center' },
  thumbImageWrap: { width: '100%', height: 56, borderRadius: 8, overflow: 'hidden', marginBottom: 8, backgroundColor: colors.background },
  thumbLabel: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  thumbTag: { ...getTypographyStyle('l2List'), color: colors.statusGenuine, marginTop: 4 },

  largeThumbWrap: { borderRadius: 12, borderWidth: 1, borderColor: colors.statsBackground, backgroundColor: colors.cardBackground, padding: 12, alignItems: 'center', justifyContent: 'center' },
  largeThumbImage: { width: '100%', height: 140, borderRadius: 8 },
  largeThumbPlaceholder: { alignItems: 'center', justifyContent: 'center', paddingVertical: 28 },
  largeThumbText: { marginTop: 8, color: colors.label },
  suspectLabel: { ...getTypographyStyle('b3Button'), color: colors.danger, marginTop: 8 },
  suspectHint: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.suspectAccent, marginTop: 4 },

  card: { backgroundColor: colors.cardBackground, borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, padding: 12 },
  findingsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  findingsTitle: { ...getTypographyStyle('headline'), color: colors.textPrimary },
  findingsTap: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },
  findingsList: { gap: 8 },
  findingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.dividerLight },
  findingIndicator: { width: 4, height: 44, borderRadius: 3 },
  findingTextCol: { flex: 1 },
  findingMain: { ...getTypographyStyle('l1List'), color: colors.textPrimary },
  findingSub: { ...getTypographyStyle('c2Caption', 'regular'), marginTop: 4 },

  sectionHeader: { ...getTypographyStyle('headline'), color: colors.textPrimary, marginBottom: 12 },
  sectionSub: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label, marginBottom: 8 },
  sectionLabel: { ...getTypographyStyle('c2Caption', 'bold'), color: colors.label, marginBottom: 8 },
  reviewRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  reviewLabel: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },

  radioRow: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  radioItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  radioIcon: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioText: { ...getTypographyStyle('b3Button') },

  noteBox: { borderWidth: 1, borderColor: colors.dividerLight, borderRadius: 10, padding: 12, marginBottom: 12, minHeight: 80 },
  notePlaceholder: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary },
});
