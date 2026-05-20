import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
import { useCaseStore } from '../../store/caseStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';

const ACCENT = '#1F5DA8';
const SCREEN_BG = '#ffffff';

const viewModes = ['Heatmap', 'Bounding box', 'Stroke diff'] as const;
type ViewMode = (typeof viewModes)[number];

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
    detail: 'Contrastive loss comparison',
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

const findings = [
  { metric: 'Letter formation', value: 'Major divergence from references', status: 'bad' },
  { metric: 'Word spacing', value: 'Compressed pattern in suspect script', status: 'warning' },
  { metric: 'Baseline alignment', value: 'Irregular vertical drift', status: 'bad' },
  { metric: 'Pen pressure', value: 'Pressure profile partially aligned', status: 'warning' },
  { metric: 'Writing slant', value: 'Strong rightward mismatch', status: 'bad' },
  { metric: 'CRAFT regions', value: 'Anomalies concentrated in initials', status: 'ok' },
] as const;

function statusColors(status: 'ok' | 'warning' | 'bad') {
  if (status === 'ok') {
    return { bg: '#ECFDF3', text: '#15803D', border: '#BBF7D0' };
  }

  if (status === 'warning') {
    return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
  }

  return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
}

export function SignatureProcessingView() {
  const router = useRouter();
  const nav = router as any;
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);

  const setSignatureStatus = (status: 'Processing' | 'Completed') => {
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
          setSignatureStatus('Processing');
          nav.replace('/analysis/signature/results');
        }}
      />
      <View style={{ paddingHorizontal: 16, paddingBottom: 16, gap: 10 }}>
        <Pressable
          style={{
            paddingVertical: 14,
            paddingHorizontal: 16,
            backgroundColor: '#1F5DA8',
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
  const suspectUri = useAnalysisFlowStore((state) => state.signature.uploads.suspect);
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);
  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');

  const setSignatureStatus = (status: 'Processing' | 'Completed') => {
    if (!currentCaseId) {
      return;
    }

    updateCaseStatus(currentCaseId, status);
  };

  const handleBackToDashboard = () => {
    // Update case status to "Completed"
    setSignatureStatus('Completed');
    // Reset analysis type
    useAnalysisFlowStore.setState({ currentAnalysisType: null });
    // Navigate to dashboard
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
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

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload Signatures" step={""} onBackPress={() => nav.back()} />

      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(160, insets.bottom + 120) }]} showsVerticalScrollIndicator={false}>
        <View style={styles.heroResultWrap}>
          <View style={styles.heroBadge}>
            <Ionicons name="alert-circle" size={20} color="#7F1D1D" />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={styles.heroPercent}>94.3% <Text style={styles.heroLabel}>SUSPECTED</Text></Text>
            <Text style={styles.heroCase}>VERDICT · {currentCaseId ?? '—'}</Text>
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
              <View key={`r-${i}`} style={styles.thumbCardSmall}>
                <View style={styles.thumbPreview} />
                <Text style={styles.thumbLabel}>SIG 01</Text>
                <Text style={styles.thumbTag}>Reference</Text>
              </View>
            ))}
          </View>

          <View style={styles.largeThumbWrap}>
            <View style={styles.largeThumbPreview} />
            <Text style={styles.suspectLabel}>SUSPECT</Text>
            <Text style={styles.suspectHint}>Anomaly detected</Text>
          </View>
        </View>

        <View style={styles.findingsContainer}>
          <View style={styles.findingsHeaderRow}>
            <Text style={styles.findingsTitle}>Key Findings</Text>
            <Text style={styles.findingsTap}>Tap for detail</Text>
          </View>
          <View style={styles.findingsList}>
            <Pressable style={styles.findingItem}>
              <View style={styles.findingIndicator} />
              <View style={styles.findingTextCol}>
                <Text style={styles.findingMain}>General information</Text>
                <Text style={styles.findingSub}>Simulated Writing</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>

            <Pressable style={styles.findingItem}>
              <View style={styles.findingIndicator} />
              <View style={styles.findingTextCol}>
                <Text style={styles.findingMain}>Relation to Baseline</Text>
                <Text style={styles.findingSub}>Inconsistent</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>

            <Pressable style={styles.findingItem}>
              <View style={styles.findingIndicator} />
              <View style={styles.findingTextCol}>
                <Text style={styles.findingMain}>Line Quality</Text>
                <Text style={styles.findingSub}>Tremor detected</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>

            <Pressable style={styles.findingItem}>
              <View style={styles.findingIndicator} />
              <View style={styles.findingTextCol}>
                <Text style={styles.findingMain}>Proportion & Spacing</Text>
                <Text style={styles.findingSub}>Irregular (x4)</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>

            <Pressable style={styles.findingItem}>
              <View style={styles.findingIndicator} />
              <View style={styles.findingTextCol}>
                <Text style={styles.findingMain}>Variation</Text>
                <Text style={styles.findingSub}>Beyond controlling pattern</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
            </Pressable>
          </View>
        </View>

      </ScrollView>

      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <Pressable onPress={() => Alert.alert('Export started', 'PDF report generation has started.')} style={styles.primaryButton}>
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
    borderRadius: 14,
    backgroundColor: '#FEF2F2',
    padding: 16,
  },
  heroBadge: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTextWrap: { flex: 1 },
  heroPercent: { fontSize: 20, fontWeight: '900', color: '#7F1D1D' },
  heroLabel: { fontSize: 12, fontWeight: '800', color: '#7F1D1D', textTransform: 'uppercase' },
  heroCase: { marginTop: 6, color: '#7F1D1D', fontSize: 12, opacity: 0.9 },

  viewTabsRow: { flexDirection: 'row', gap: 8, marginTop: 8 },
  viewTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: '#EEF2F7', backgroundColor: '#FFFFFF' },
  viewTabActive: { backgroundColor: '#FFFFFF', borderColor: '#F1F5F9' },
  viewTabText: { color: '#64748B', fontSize: 12, fontWeight: '700' },
  viewTabTextActive: { color: '#0F172A' },

  thumbsGrid: { flexDirection: 'column', gap: 12, marginTop: 12 },
  smallThumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  thumbCardSmall: { borderRadius: 12, borderWidth: 1, borderColor: '#EEF2F7', padding: 10, backgroundColor: '#FFFFFF', width: '48%' , marginBottom: 8},
  thumbPreview: { height: 56, borderRadius: 8, backgroundColor: '#F8FAFC', marginBottom: 8 },
  thumbLabel: { fontSize: 12, fontWeight: '800', color: '#0F172A' },
  thumbTag: { fontSize: 11, color: '#10B981', fontWeight: '700', marginTop: 4 },

  largeThumbWrap: { borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', backgroundColor: '#FFFFFF', padding: 12, alignItems: 'center', justifyContent: 'center' },
  largeThumbPreview: { width: '100%', height: 120, borderRadius: 8, backgroundColor: '#F8FAFB', marginBottom: 10 },
  suspectLabel: { color: '#EF4444', fontSize: 12, fontWeight: '800' },
  suspectHint: { color: '#F97316', fontSize: 12, marginTop: 4 },

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