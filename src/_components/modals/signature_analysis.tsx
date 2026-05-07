import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
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

  return (
    <ProcessingScreen
      title="Processing Signature"
      subtitle="AI forensic engine is running multi-stage comparison"
      accentColor={ACCENT}
      steps={processingSteps}
      onComplete={() => nav.replace('/analysis/signature/results')}
    />
  );
}

export function SignatureResultsScreen() {
  const suspectUri = useAnalysisFlowStore((state) => state.signature.uploads.suspect);
  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');

  const activeTone = useMemo(() => {
    if (activeView === 'Heatmap') {
      return { bg: '#DBEAFE', edge: '#60A5FA', badge: '#1D4ED8' };
    }

    if (activeView === 'Bounding box') {
      return { bg: '#E0F2FE', edge: '#38BDF8', badge: '#0369A1' };
    }

    return { bg: '#E2E8F0', edge: '#94A3B8', badge: '#334155' };
  }, [activeView]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader title="Signature Results" subtitle="Step 4 of 4 - Forensic output" accentColor={ACCENT} />

        <View style={[styles.card, styles.resultHeroCard]}>
          <View style={styles.resultTitleRow}>
            <Text style={styles.resultVerdict}>FORGED</Text>
            <View style={styles.confidencePill}>
              <Ionicons name="analytics" size={12} color="#1E3A8A" />
              <Text style={styles.confidenceText}>Confidence 94.3%</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Suspect signature diverges in baseline, slant consistency, and pressure profile.
          </Text>
        </View>

        <View style={styles.toggleRow}>
          {viewModes.map((mode) => {
            const selected = mode === activeView;

            return (
              <Pressable
                key={mode}
                onPress={() => setActiveView(mode)}
                style={[styles.toggleChip, selected && { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}
              >
                <Text style={[styles.toggleChipText, selected && { color: '#1E40AF' }]}>{mode}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.previewCard, { backgroundColor: activeTone.bg, borderColor: activeTone.edge }]}>
          <View style={[styles.previewBadge, { backgroundColor: activeTone.badge }]}>
            <Text style={styles.previewBadgeText}>{activeView}</Text>
          </View>
          <View style={styles.previewCanvas}>
            <Text style={styles.previewText}>{suspectUri ? 'Suspect signature visualization loaded' : 'No suspect image uploaded'}</Text>
            <View style={styles.previewMarkWrap}>
              <View style={[styles.previewMark, styles.previewMarkHot]} />
              <View style={[styles.previewMark, styles.previewMarkWarm]} />
              <View style={[styles.previewMark, styles.previewMarkCold]} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Key findings</Text>
          {findings.map((item) => {
            const colors = statusColors(item.status);

            return (
              <View key={item.metric} style={styles.findingRow}>
                <View style={styles.findingTextWrap}>
                  <Text style={styles.findingMetric}>{item.metric}</Text>
                  <Text style={styles.findingValue}>{item.value}</Text>
                </View>
                <View style={[styles.statusTag, { backgroundColor: colors.bg, borderColor: colors.border }]}>
                  <Text style={[styles.statusTagText, { color: colors.text }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable onPress={() => Alert.alert('Export started', 'PDF report generation has started.')} style={styles.primaryButton}>
          <Text style={styles.primaryButtonText}>Export PDF report</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
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
});