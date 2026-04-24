import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
    Alert,
    Pressable,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';

import {
    hasCompleteUploads,
    useAnalysisFlowStore,
    type AnalysisPriority,
} from '../../store/analysisFlowStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';
import UploadSlot from '../analysis/UploadSlot';

const ACCENT = '#16803C';
const SCREEN_BG = '#F5FCF7';

const documentOptions = [
  'Handwritten statement',
  'Personal letter',
  'Witness affidavit',
  'Notebook page',
  'Exam answer sheet',
];

const priorities: AnalysisPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
const viewModes = ['Heatmap', 'Bounding box', 'Stroke diff'] as const;
type ViewMode = (typeof viewModes)[number];

const processingSteps: ProcessingStep[] = [
  {
    id: 'hw-preprocess',
    label: 'Image preprocessing',
    detail: 'Normalize and binarize',
  },
  {
    id: 'hw-feature',
    label: 'Writer feature extraction',
    detail: 'LSTM handcrafted features',
  },
  {
    id: 'hw-score',
    label: 'Authorship scoring',
    detail: 'Writer-ID comparison',
  },
  {
    id: 'hw-heatmap',
    label: 'Anomaly heatmap',
    detail: 'Grad-CAM visualization',
  },
  {
    id: 'hw-report',
    label: 'Report compilation',
    detail: 'Building forensic output',
  },
];

const findings = [
  { metric: 'Letter slant angle', value: 'Average mismatch by 10.7 degrees', status: 'bad' },
  { metric: 'Pen pressure', value: 'Pressure rhythm partially overlapping', status: 'warning' },
  { metric: 'Character spacing', value: 'Compressed spacing in suspect words', status: 'bad' },
  { metric: 'Baseline alignment', value: 'Inconsistent lower baseline', status: 'warning' },
  { metric: 'Stroke rhythm', value: 'Abrupt pen lift transitions detected', status: 'bad' },
  { metric: 'Word proportions', value: 'Narrow body-height profile', status: 'warning' },
] as const;

function mockImageUri(seed: string) {
  return `https://picsum.photos/seed/${seed}/800/460`;
}

function statusColors(status: 'ok' | 'warning' | 'bad') {
  if (status === 'ok') {
    return { bg: '#ECFDF3', text: '#15803D', border: '#BBF7D0' };
  }
  if (status === 'warning') {
    return { bg: '#FFFBEB', text: '#B45309', border: '#FDE68A' };
  }
  return { bg: '#FEF2F2', text: '#B91C1C', border: '#FECACA' };
}

export function HandwritingCaseDetailsScreen() {
  const router = useRouter();
  const nav = router as any;
  const flow = useAnalysisFlowStore((state) => state.handwriting);
  const setSubjectName = useAnalysisFlowStore((state) => state.setSubjectName);
  const setDocumentType = useAnalysisFlowStore((state) => state.setDocumentType);
  const setPriority = useAnalysisFlowStore((state) => state.setPriority);
  const canContinue = flow.caseDetails.subjectName.trim().length > 1 && flow.caseDetails.documentType.length > 0;

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Case details" step="1 / 3" onBackPress={() => nav.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.card}>
          <FieldLabel label="Case ID" />
          <View style={styles.caseIdRow}>
            <Ionicons name="albums-outline" size={16} color="#334155" />
            <Text style={styles.caseIdText}>{flow.caseDetails.caseId}</Text>
          </View>

          <FieldLabel label="Subject name" />
          <TextInput
            value={flow.caseDetails.subjectName}
            onChangeText={(value) => setSubjectName('handwriting', value)}
            placeholder="Enter subject name"
            placeholderTextColor="#94A3B8"
            style={styles.input}
          />

          <FieldLabel label="Document type" />
          <View style={styles.optionWrap}>
            {documentOptions.map((option) => {
              const selected = flow.caseDetails.documentType === option;
              return (
                <Pressable
                  key={option}
                  onPress={() => setDocumentType('handwriting', option)}
                  style={[styles.selectChip, selected && { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
                >
                  <Text style={[styles.selectChipText, selected && { color: '#166534' }]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>

          <FieldLabel label="Priority" />
          <View style={styles.priorityRow}>
            {priorities.map((priority) => {
              const selected = flow.caseDetails.priority === priority;
              return (
                <Pressable
                  key={priority}
                  onPress={() => setPriority('handwriting', priority)}
                  style={[
                    styles.priorityChip,
                    selected && { backgroundColor: ACCENT, borderColor: ACCENT },
                  ]}
                >
                  <Text style={[styles.priorityText, selected && { color: '#FFFFFF' }]}>{priority}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <Pressable
          onPress={() => nav.push('/analysis/handwriting/uploads')}
          disabled={!canContinue}
          style={[styles.primaryButton, !canContinue && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Continue to uploads</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function HandwritingUploadsScreen() {
  const router = useRouter();
  const nav = router as any;
  const uploads = useAnalysisFlowStore((state) => state.handwriting.uploads);
  const setReference = useAnalysisFlowStore((state) => state.setReference);
  const setSuspect = useAnalysisFlowStore((state) => state.setSuspect);
  const canRun = hasCompleteUploads(uploads);

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload handwriting" step="2 / 3" onBackPress={() => nav.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reference handwriting</Text>
          <Text style={styles.sectionDescription}>Upload 4 known genuine handwriting samples from the same person.</Text>
          <View style={styles.grid}>
            {uploads.references.map((uri, index) => {
              const refLabel = `REF ${String(81 + index)}`;
              return (
                <View key={`hw-ref-${index}`} style={styles.gridItem}>
                  <Text style={styles.refLabel}>{refLabel}</Text>
                  <UploadSlot
                    label="Add photo"
                    uri={uri}
                    accentColor={ACCENT}
                    onPress={() =>
                      setReference('handwriting', index, mockImageUri(`handwriting-ref-${index + 1}-${Date.now()}`))
                    }
                    onClear={() => setReference('handwriting', index, null)}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.suspectSectionHeader}>
            <Text style={styles.suspectBadge}>UNDER SCRUTINY</Text>
          </View>
          <Text style={styles.sectionTitle}>Suspected handwriting</Text>
          <Text style={styles.sectionDescription}>Upload the handwriting sample to be verified.</Text>
          <UploadSlot
            label="Add suspected handwriting"
            uri={uploads.suspect}
            accentColor="#D97706"
            onPress={() => setSuspect('handwriting', mockImageUri(`handwriting-sus-${Date.now()}`))}  
            onClear={() => setSuspect('handwriting', null)}
          />

          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons name="information-circle" size={16} color="#0F172A" />
              <Text style={styles.tipsTitle}>Tips for best accuracy</Text>
            </View>
            <Text style={styles.tipItem}>• Full page or multi-line text preferred</Text>
            <Text style={styles.tipItem}>• Consistent pen and paper, no distortions</Text>
          </View>
        </View>

        <Pressable
          onPress={() => nav.push('/analysis/handwriting/processing')}
          disabled={!canRun}
          style={[styles.primaryButton, !canRun && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Run Analysis</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function HandwritingProcessingView() {
  const router = useRouter();
  const nav = router as any;

  return (
    <ProcessingScreen
      title="Processing Handwriting"
      subtitle="AI writer-identification pipeline is in progress"
      accentColor={ACCENT}
      steps={processingSteps}
      onComplete={() => nav.replace('/analysis/handwriting/results')}
    />
  );
}

export function HandwritingResultsScreen() {
  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');

  const activeTone = useMemo(() => {
    if (activeView === 'Heatmap') {
      return { bg: '#DCFCE7', edge: '#86EFAC', badge: '#166534' };
    }
    if (activeView === 'Bounding box') {
      return { bg: '#ECFDF3', edge: '#4ADE80', badge: '#15803D' };
    }
    return { bg: '#E2E8F0', edge: '#94A3B8', badge: '#334155' };
  }, [activeView]);

  return (
    <SafeAreaView style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <StepHeader
          title="Handwriting Results"
          subtitle="Step 4 of 4 - Forensic output"
          accentColor={ACCENT}
        />

        <View style={[styles.card, styles.resultHeroCard]}>
          <View style={styles.resultTitleRow}>
            <Text style={styles.resultVerdict}>NOT AUTHOR</Text>
            <View style={styles.confidencePill}>
              <Ionicons name="analytics" size={12} color="#14532D" />
              <Text style={styles.confidenceText}>Confidence 91.7%</Text>
            </View>
          </View>
          <Text style={styles.heroSubtitle}>
            Writer profile diverges across slant and rhythm clusters from all provided references.
          </Text>
        </View>

        <View style={styles.toggleRow}>
          {viewModes.map((mode) => {
            const selected = mode === activeView;
            return (
              <Pressable
                key={mode}
                onPress={() => setActiveView(mode)}
                style={[styles.toggleChip, selected && { backgroundColor: '#DCFCE7', borderColor: '#BBF7D0' }]}
              >
                <Text style={[styles.toggleChipText, selected && { color: '#166534' }]}>{mode}</Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.card, styles.previewCard, { backgroundColor: activeTone.bg, borderColor: activeTone.edge }]}>
          <View style={[styles.previewBadge, { backgroundColor: activeTone.badge }]}>
            <Text style={styles.previewBadgeText}>{activeView}</Text>
          </View>
          <TurnitinStyleDocument />
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
                <View
                  style={[
                    styles.statusTag,
                    { backgroundColor: colors.bg, borderColor: colors.border },
                  ]}
                >
                  <Text style={[styles.statusTagText, { color: colors.text }]}>{item.status.toUpperCase()}</Text>
                </View>
              </View>
            );
          })}
        </View>

        <Pressable
          onPress={() => Alert.alert('Export started', 'PDF report generation has started.')}
          style={styles.primaryButton}
        >
          <Text style={styles.primaryButtonText}>Export PDF report</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

function TurnitinStyleDocument() {
  const lines = [
    [65, 44, 52, 38, 60, 34],
    [40, 48, 72, 58, 36, 61],
    [54, 42, 31, 63, 37, 48],
    [33, 52, 68, 46, 58, 40],
    [66, 39, 55, 47, 32, 61],
    [48, 44, 35, 57, 42, 52],
  ];

  return (
    <View style={styles.documentWrap}>
      {lines.map((line, lineIndex) => (
        <View key={`doc-line-${lineIndex}`} style={styles.documentLine}>
          {line.map((width, wordIndex) => {
            const isAnomaly =
              (lineIndex === 1 && wordIndex === 2) ||
              (lineIndex === 2 && wordIndex === 3) ||
              (lineIndex === 4 && wordIndex === 0) ||
              (lineIndex === 5 && wordIndex === 4);

            return (
              <View
                key={`doc-word-${lineIndex}-${wordIndex}`}
                style={[
                  styles.wordRect,
                  { width },
                  isAnomaly && styles.wordRectAnomaly,
                ]}
              />
            );
          })}
        </View>
      ))}

      <View style={styles.legendRow}>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#CBD5E1' }]} />
          <Text style={styles.legendText}>Normal</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendDot, { backgroundColor: '#EF4444' }]} />
          <Text style={styles.legendText}>Anomalous</Text>
        </View>
      </View>
    </View>
  );
}

function TopBar({
  title,
  step,
  onBackPress,
}: {
  title: string;
  step: string;
  onBackPress: () => void;
}) {
  return (
    <View style={styles.topBar}>
      <Pressable onPress={onBackPress} style={styles.backButton}>
        <Ionicons name="chevron-back" size={24} color="#0F172A" />
      </Pressable>
      <Text style={styles.topBarTitle}>{title}</Text>
      <Text style={styles.stepCounter}>{step}</Text>
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

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: SCREEN_BG,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
    marginHorizontal: 12,
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    gap: 14,
  },
  headerWrap: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D8F5E2',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  headerTitle: {
    fontSize: 23,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    marginTop: 4,
    color: '#64748B',
    fontSize: 12,
  },
  headerBar: {
    marginTop: 10,
    width: 110,
    height: 4,
    borderRadius: 999,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E7DF',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 14,
    gap: 12,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  caseIdRow: {
    marginTop: -2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#D6E5DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F4FCF7',
  },
  caseIdText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D6E5DD',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  optionWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  selectChip: {
    borderWidth: 1,
    borderColor: '#D6E5DD',
    backgroundColor: '#F8FAFC',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  selectChipText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '600',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: '#CBE0D3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
  },
  priorityText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionDescription: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  refLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  gridItem: {
    width: '48.2%',
  },
  suspectSectionHeader: {
    marginTop: 16,
    marginBottom: 8,
  },
  suspectBadge: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    letterSpacing: 0.5,
  },
  tipsBox: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: '#D9E7DF',
    borderRadius: 12,
    backgroundColor: '#F4FCF7',
    padding: 12,
    gap: 8,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  tipsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  tipItem: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  primaryButton: {
    borderRadius: 13,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabledButton: {
    opacity: 0.45,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  resultHeroCard: {
    borderColor: '#BBF7D0',
    backgroundColor: '#ECFDF3',
  },
  resultTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  resultVerdict: {
    fontSize: 24,
    fontWeight: '900',
    color: '#14532D',
    letterSpacing: -0.4,
  },
  confidencePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  confidenceText: {
    color: '#14532D',
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
    borderColor: '#D2E5D8',
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
    minHeight: 250,
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
  documentWrap: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(100,116,139,0.18)',
    backgroundColor: 'rgba(255,255,255,0.82)',
    paddingHorizontal: 10,
    paddingVertical: 12,
    gap: 7,
  },
  documentLine: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  wordRect: {
    height: 8,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
  },
  wordRectAnomaly: {
    backgroundColor: '#EF4444',
  },
  legendRow: {
    marginTop: 4,
    flexDirection: 'row',
    gap: 12,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
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
});
