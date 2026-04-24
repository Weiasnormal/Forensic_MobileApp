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
    View
} from 'react-native';

import {
    hasCompleteUploads,
    useAnalysisFlowStore,
    type AnalysisPriority,
} from '../../store/analysisFlowStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';
import UploadSlot from '../analysis/UploadSlot';

const ACCENT = '#1F5DA8';
const SCREEN_BG = '#F5FAFF';

const documentOptions = [
  'Bank cheque',
  'Legal contract',
  'Government form',
  'Insurance document',
  'Payroll statement',
];

const priorities: AnalysisPriority[] = ['Low', 'Medium', 'High', 'Urgent'];
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

export function SignatureCaseDetailsScreen() {
  const router = useRouter();
  const nav = router as any;
  const flow = useAnalysisFlowStore((state) => state.signature);
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
            onChangeText={(value) => setSubjectName('signature', value)}
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
                  onPress={() => setDocumentType('signature', option)}
                  style={[styles.selectChip, selected && { backgroundColor: '#DBEAFE', borderColor: '#BFDBFE' }]}
                >
                  <Text style={[styles.selectChipText, selected && { color: '#1D4ED8' }]}>{option}</Text>
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
                  onPress={() => setPriority('signature', priority)}
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
          onPress={() => nav.push('/analysis/signature/uploads')}
          disabled={!canContinue}
          style={[styles.primaryButton, !canContinue && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Continue to uploads</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SignatureUploadsScreen() {
  const router = useRouter();
  const nav = router as any;
  const uploads = useAnalysisFlowStore((state) => state.signature.uploads);
  const setReference = useAnalysisFlowStore((state) => state.setReference);
  const setSuspect = useAnalysisFlowStore((state) => state.setSuspect);
  const canRun = hasCompleteUploads(uploads);

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="Upload signatures" step="2 / 3" onBackPress={() => nav.back()} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Reference signatures</Text>
          <Text style={styles.sectionDescription}>Upload 4 known genuine signatures from the same person.</Text>
          <View style={styles.grid}>
            {uploads.references.map((uri, index) => {
              const refLabel = `REF ${String(81 + index)}`;
              return (
                <View key={`sig-ref-${index}`} style={styles.gridItem}>
                  <Text style={styles.refLabel}>{refLabel}</Text>
                  <UploadSlot
                    label="Add photo"
                    uri={uri}
                    accentColor={ACCENT}
                    onPress={() =>
                      setReference('signature', index, mockImageUri(`signature-ref-${index + 1}-${Date.now()}`))
                    }
                    onClear={() => setReference('signature', index, null)}
                  />
                </View>
              );
            })}
          </View>

          <View style={styles.suspectSectionHeader}>
            <Text style={styles.suspectBadge}>UNDER SCRUTINY</Text>
          </View>
          <Text style={styles.sectionTitle}>Suspected signature</Text>
          <Text style={styles.sectionDescription}>Upload the signature to be verified.</Text>
          <UploadSlot
            label="Add suspected signature"
            uri={uploads.suspect}
            accentColor="#D97706"
            onPress={() => setSuspect('signature', mockImageUri(`signature-sus-${Date.now()}`))}  
            onClear={() => setSuspect('signature', null)}
          />

          <View style={styles.tipsBox}>
            <View style={styles.tipsHeader}>
              <Ionicons name="information-circle" size={16} color="#0F172A" />
              <Text style={styles.tipsTitle}>Tips for best accuracy</Text>
            </View>
            <Text style={styles.tipItem}>• Flat surface · high-contrast ink · no shadows</Text>
            <Text style={styles.tipItem}>• Crop tightly around the signature only</Text>
          </View>
        </View>

        <Pressable
          onPress={() => nav.push('/analysis/signature/processing')}
          disabled={!canRun}
          style={[styles.primaryButton, !canRun && styles.disabledButton]}
        >
          <Text style={styles.primaryButtonText}>Run Analysis</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
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
        <StepHeader
          title="Signature Results"
          subtitle="Step 4 of 4 - Forensic output"
          accentColor={ACCENT}
        />

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
            <Text style={styles.previewText}>
              {suspectUri ? 'Suspect signature visualization loaded' : 'No suspect image uploaded'}
            </Text>
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
    paddingTop: 35,
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
    borderColor: '#DCEAFE',
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
    borderColor: '#DBE5F1',
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
    borderColor: '#D8E3EF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#F8FBFF',
  },
  caseIdText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
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
    borderColor: '#D5E2EF',
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
    borderColor: '#CFDCEC',
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
    borderColor: '#D9E2EE',
    borderRadius: 12,
    backgroundColor: '#F8FBFF',
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
});
