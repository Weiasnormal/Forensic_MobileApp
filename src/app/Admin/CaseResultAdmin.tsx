import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, {  useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, TextInput, Switch } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

const viewModes = ['Heatmap', 'Bounding Box', 'Stroke Diff'] as const;
type ViewMode = typeof viewModes[number];

export default function CaseResultAdmin() {
  const router = useRouter();
  const nav = router as any;
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ caseId?: string }>();

  // Use the same store architecture as signature_results.tsx
  const currentCaseId = params.caseId || '0429-2026-001'; 
  const [activeView, setActiveView] = useState<ViewMode>('Heatmap');

  // Supervisor Review State
  const [reviewDecision, setReviewDecision] = useState<'suspected' | 'genuine' | null>(null);
  const [flagInternalReview, setFlagInternalReview] = useState(false);
  const [pdfExportPermission, setPdfExportPermission] = useState(true);
  const [reviewNote, setReviewNote] = useState('');

  // Mock ML Verdict data (In production, replace with resolveCaseVerdict from your store)
  const mlConfidence = 94.3;
  const mlVerdict = 'SUSPECTED'; 
  const isMlSuspected = mlVerdict === 'SUSPECTED';

  // Computed Override Status
  const isOverridden = 
    (isMlSuspected && reviewDecision === 'genuine') || 
    (!isMlSuspected && reviewDecision === 'suspected');

  const finalDecisionLabel = reviewDecision 
    ? reviewDecision.toUpperCase() 
    : mlVerdict;

  const handleSaveReview = () => {
    // Implement API call to save supervisor review
    nav.back();
  };

  const handleExportReport = () => {
    // Implement Export
  };

  return (
    <SafeAreaView style={styles.screen}>
      {/* Case ID Header */}
      <TopBar title={currentCaseId} onBackPress={() => nav.back()} />

      <ScrollView 
        contentContainerStyle={[styles.content, { paddingBottom: Math.max(160, insets.bottom + 120) }]} 
        showsVerticalScrollIndicator={false}
      >
        {/* ML Verdict Banner */}
        <View style={[styles.heroResultWrap, { backgroundColor: colors.dangerLight }]}>
          <View style={[styles.heroBadge, { backgroundColor: colors.danger }]}>
            <Ionicons name="alert-circle" size={28} color={colors.primaryText} />
          </View>
          <View style={styles.heroTextWrap}>
            <Text style={[styles.heroPercent, { color: colors.danger }]}>
              {mlConfidence}% <Text style={styles.heroLabel}>{mlVerdict}</Text>
            </Text>
            <Text style={[styles.heroCase, { color: colors.textSecondary }]}>
              VERDICT · {currentCaseId}
            </Text>
          </View>
        </View>

        {/* Case Info Grid */}
        <View style={styles.infoGrid}>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Analyst</Text>
            <Text style={styles.infoValue}>Maria Cruz</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Date</Text>
            <Text style={styles.infoValue}>Mar 29, 2026</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Document Type</Text>
            <Text style={styles.infoValue}>Bank Cheque</Text>
          </View>
          <View style={styles.infoCard}>
            <Text style={styles.infoLabel}>Admin Status</Text>
            <Text style={styles.infoValue}>Awaiting Review</Text>
          </View>
        </View>

        {/* View Mode Tabs */}
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

        {/* Image Grid (4 References, 1 Suspect) */}
        <View style={styles.thumbsGrid}>
          <View style={styles.smallThumbsGrid}>
            {[1, 2, 3, 4].map((i) => (
              <View key={`ref-${i}`} style={styles.thumbCardSmall}>
                <View style={styles.thumbImageWrap}>
                   <Ionicons name="image-outline" size={24} color={colors.label} />
                </View>
                <Text style={styles.thumbLabel}>SIG {String(i).padStart(2, '0')}</Text>
                <Text style={styles.thumbTag}>Reference</Text>
              </View>
            ))}
          </View>
          
          <View style={styles.largeThumbWrap}>
            <View style={styles.largeThumbImageWrap}>
                <Ionicons name="scan-outline" size={28} color={colors.danger} />
            </View>
            <Text style={styles.suspectLabel}>SUSPECT</Text>
            <Text style={styles.suspectHint}>Anomaly detected</Text>
          </View>
        </View>

        {/* Key Findings Section */}
        <View style={styles.findingsContainer}>
          <View style={styles.findingsHeaderRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Ionicons name="information-circle-outline" size={20} color={colors.textPrimary} />
                <Text style={styles.findingsTitle}>Key Findings</Text>
            </View>
            <Text style={styles.findingsTap}>Tap for detail</Text>
          </View>
          <View style={styles.findingsList}>
             {/* Mock Finding Item */}
            <Pressable style={styles.findingItem}>
                <View style={[styles.findingIndicator, { backgroundColor: colors.danger }]} />
                <View style={styles.findingTextCol}>
                    <Text style={styles.findingMain}>General information</Text>
                    <Text style={[styles.findingSub, { color: colors.danger }]}>Simulated Writing</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={colors.label} />
            </Pressable>
          </View>
        </View>

        {/* --- SUPERVISOR REVIEW SECTION --- */}
        <View style={styles.reviewSection}>
            <View style={styles.reviewHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    <Ionicons name="checkbox-outline" size={20} color={colors.textPrimary} />
                    <Text style={styles.findingsTitle}>Supervisor Review</Text>
                </View>
                <View style={styles.reviewPendingBadge}>
                    <Text style={styles.reviewPendingText}>Review Pending</Text>
                </View>
            </View>

            <View style={styles.modelAssessmentRow}>
                <Text style={styles.modelAssessmentLabel}>Model Assessment</Text>
                <Text style={[styles.modelAssessmentVerdict, { color: isMlSuspected ? colors.danger : colors.statusGenuine }]}>
                    {mlConfidence}% {mlVerdict}
                </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.reviewDecisionBlock}>
                <Text style={styles.findingsTitle}>Review Decision</Text>
                <Text style={styles.reviewDecisionSub}>Confirm or override the model assessment based on your review of the evidence.</Text>

                {/* Final Decision Banner (Shows when Override happens) */}
                {reviewDecision && (
                   <View style={[
                       styles.finalDecisionBanner, 
                       isOverridden ? styles.overrideBanner : styles.confirmBanner
                    ]}>
                       <Ionicons name={isOverridden ? "warning" : "checkmark-circle"} size={16} color={isOverridden ? colors.statusSuspected : colors.statusGenuine} />
                       <Text style={[styles.finalDecisionText, { color: isOverridden ? colors.statusSuspected : colors.statusGenuine }]}>
                           {isOverridden ? 'OVERRIDING ML VERDICT: ' : 'CONFIRMING ML VERDICT: '}
                           <Text style={{ fontWeight: 'bold' }}>FINAL WILL BE {finalDecisionLabel}</Text>
                       </Text>
                   </View>
                )}

                {/* Confirm Suspected Option */}
                <Pressable style={styles.radioOption} onPress={() => setReviewDecision('suspected')}>
                    <View style={styles.radioIconWrap}>
                        <Ionicons name="close-circle-outline" size={24} color={colors.danger} />
                    </View>
                    <View style={styles.radioTextWrap}>
                        <Text style={styles.radioTitle}>Confirm Suspected</Text>
                        <Text style={styles.radioDesc}>
                           {isMlSuspected ? 'Matches model prediction' : 'Overrides model prediction'}
                        </Text>
                    </View>
                    <Ionicons 
                        name={reviewDecision === 'suspected' ? 'radio-button-on' : 'radio-button-off'} 
                        size={24} 
                        color={reviewDecision === 'suspected' ? colors.primary : colors.inputBorder} 
                    />
                </Pressable>

                {/* Confirm Genuine Option */}
                <Pressable style={styles.radioOption} onPress={() => setReviewDecision('genuine')}>
                    <View style={styles.radioIconWrap}>
                        <Ionicons name="checkmark-circle-outline" size={24} color={colors.statusGenuine} />
                    </View>
                    <View style={styles.radioTextWrap}>
                        <Text style={styles.radioTitle}>Confirm Genuine</Text>
                        <Text style={styles.radioDesc}>
                           {!isMlSuspected ? 'Matches model prediction' : 'Overrides model prediction'}
                        </Text>
                    </View>
                    <Ionicons 
                        name={reviewDecision === 'genuine' ? 'radio-button-on' : 'radio-button-off'} 
                        size={24} 
                        color={reviewDecision === 'genuine' ? colors.primary : colors.inputBorder} 
                    />
                </Pressable>
                
                {/* Flag for Internal Review */}
                <View style={styles.toggleRow}>
                    <View style={styles.radioIconWrap}>
                        <Ionicons name="flag-outline" size={24} color={colors.danger} />
                    </View>
                    <View style={styles.radioTextWrap}>
                        <Text style={styles.radioTitle}>Flag for Internal Review</Text>
                        <Text style={styles.radioDesc}>Does not affect review outcome</Text>
                    </View>
                    <Switch 
                        value={flagInternalReview} 
                        onValueChange={setFlagInternalReview}
                        trackColor={{ false: colors.inputBorder, true: colors.primary }} 
                    />
                </View>

                {/* PDF Export Permission */}
                <View style={[styles.toggleRow, { borderBottomWidth: 0 }]}>
                    <View style={styles.radioIconWrap}>
                        <Ionicons name="document-text-outline" size={24} color={colors.textSecondary} />
                    </View>
                    <View style={styles.radioTextWrap}>
                        <Text style={styles.radioTitle}>Allow PDF Export</Text>
                        <Text style={styles.radioDesc}>Enable exporting this report</Text>
                    </View>
                    <Switch 
                        value={pdfExportPermission} 
                        onValueChange={setPdfExportPermission}
                        trackColor={{ false: colors.inputBorder, true: colors.primary }} 
                    />
                </View>

            </View>

            <View style={styles.divider} />

            {/* Review Note */}
            <View style={styles.noteSection}>
                <Text style={styles.findingsTitle}>Review Note <Text style={styles.optionalText}>(Optional)</Text></Text>
                <View style={styles.textAreaContainer}>
                    <TextInput
                        style={styles.textArea}
                        placeholder="Add observations, evidence references, or rationale for this review decision..."
                        placeholderTextColor={colors.label}
                        multiline
                        maxLength={500}
                        value={reviewNote}
                        onChangeText={setReviewNote}
                    />
                    <Text style={styles.charCounter}>{reviewNote.length}/500</Text>
                </View>
                
                <View style={styles.infoBanner}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.label} />
                    <Text style={styles.infoBannerText}>
                        Notes are internally visible and logged with the final audit report.
                    </Text>
                </View>
            </View>
        </View>

      </ScrollView>

      {/* Floating Action Buttons */}
      <View style={[styles.buttonContainer, { bottom: insets.bottom }]}>
        <PrimaryButton label="Save Review" onPress={handleSaveReview} size="medium" />
        <SecondaryButton label="Export PDF Report" onPress={handleExportReport} size="medium" style={styles.secondaryButtonSpacing} />
      </View>
    </SafeAreaView>
  );
}

// Reusing TopBar styling structurally similar to signature_results.tsx
function TopBar({ title, onBackPress }: { title: string; onBackPress: () => void }) {
  return (
    <View style={styles.topBarWrapper}>
      <View style={styles.topBar}>
        <Pressable onPress={onBackPress} style={styles.backButton}>
          <View style={styles.backButtonBox}>
            <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
          </View>
        </Pressable>
        <Text style={styles.topBarTitle}>{title}</Text>
        <View style={{ width: 36 }} /> {/* Spacer for centering */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background2 },
  content: { paddingHorizontal: 16, paddingTop: 16, gap: 16 },
  
  // Header Info
  heroResultWrap: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 22, paddingVertical: 16, paddingHorizontal: 18 },
  heroBadge: { width: 56, height: 56, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  heroTextWrap: { flex: 1 },
  heroPercent: { ...getTypographyStyle('t2Title'), letterSpacing: -0.3 },
  heroLabel: { ...getTypographyStyle('t2Title'), letterSpacing: -0.3, textTransform: 'uppercase' },
  heroCase: { ...getTypographyStyle('l2List'), marginTop: 6, letterSpacing: 0.4 },
  
  // Metadata Grid
  infoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  infoCard: { width: '48%', backgroundColor: colors.cardBackground, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight },
  infoLabel: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label, marginBottom: 4 },
  infoValue: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },

  // Tabs
  viewTabsRow: { flexDirection: 'row', gap: 8 },
  viewTab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 999, borderWidth: 1, borderColor: colors.dividerLight, backgroundColor: colors.cardBackground },
  viewTabActive: { backgroundColor: colors.cardBackground, borderColor: colors.statsBackground },
  viewTabText: { ...getTypographyStyle('b3Button'), color: colors.textSecondary },
  viewTabTextActive: { color: colors.textPrimary },

  // Thumbnail Grid
  thumbsGrid: { flexDirection: 'column', gap: 12 },
  smallThumbsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between' },
  thumbCardSmall: { borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, padding: 10, backgroundColor: colors.cardBackground, width: '48%', marginBottom: 8, alignItems: 'center' },
  thumbImageWrap: { width: '100%', height: 48, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  thumbLabel: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  thumbTag: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.statusGenuine, marginTop: 4 },
  
  largeThumbWrap: { borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, backgroundColor: colors.cardBackground, padding: 12, alignItems: 'center' },
  largeThumbImageWrap: { width: '100%', height: 120, borderRadius: 8, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  suspectLabel: { ...getTypographyStyle('b3Button'), color: colors.textSecondary },
  suspectHint: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.danger, marginTop: 4 },

  // Key Findings
  findingsContainer: { borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, backgroundColor: colors.cardBackground, padding: 16 },
  findingsHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  findingsTitle: { ...getTypographyStyle('t3Title'), color: colors.textPrimary },
  findingsTap: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.primary },
  findingsList: { gap: 6 },
  findingItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: colors.dividerLight },
  findingIndicator: { width: 4, height: 32, borderRadius: 3 },
  findingTextCol: { flex: 1 },
  findingMain: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  findingSub: { ...getTypographyStyle('c2Caption', 'regular'), marginTop: 4 },

  // --- Supervisor Review UI ---
  reviewSection: { borderRadius: 12, borderWidth: 1, borderColor: colors.dividerLight, backgroundColor: colors.cardBackground, padding: 16, marginTop: 8 },
  reviewHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  reviewPendingBadge: { backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16 },
  reviewPendingText: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary },
  
  modelAssessmentRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modelAssessmentLabel: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  modelAssessmentVerdict: { ...getTypographyStyle('b3Button'), fontWeight: 'bold' },

  divider: { height: 1, backgroundColor: colors.dividerLight, marginVertical: 16 },

  reviewDecisionBlock: { gap: 12 },
  reviewDecisionSub: { ...getTypographyStyle('c1Caption', 'regular'), color: colors.textSecondary, marginBottom: 8 },

  // Final Decision Overriding Banner
  finalDecisionBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 12, borderRadius: 8, marginBottom: 12, borderWidth: 1 },
  overrideBanner: { backgroundColor: colors.dangerLight},
  confirmBanner: { backgroundColor: colors.statusGenuineBg, borderColor: colors.statusGenuine },
  finalDecisionText: { ...getTypographyStyle('c1Caption', 'regular') },

  radioOption: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.dividerLight },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.dividerLight },
  radioIconWrap: { width: 32, alignItems: 'center' },
  radioTextWrap: { flex: 1 },
  radioTitle: { ...getTypographyStyle('b3Button'), color: colors.textPrimary },
  radioDesc: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label, marginTop: 4 },

  noteSection: { gap: 12 },
  optionalText: { color: colors.label, fontWeight: 'normal' },
  textAreaContainer: { borderWidth: 1, borderColor: colors.inputBorder, borderRadius: 12, padding: 12, backgroundColor: colors.background, minHeight: 120 },
  textArea: { flex: 1, ...getTypographyStyle('b3Button'), color: colors.textPrimary, textAlignVertical: 'top' },
  charCounter: { textAlign: 'right', ...getTypographyStyle('c2Caption', 'regular'), color: colors.label, marginTop: 8 },

  infoBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.background, padding: 12, borderRadius: 8, borderWidth: 1, borderColor: colors.dividerLight },
  infoBannerText: { flex: 1, ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },

  // Buttons & Topbar
  buttonContainer: { position: 'absolute', left: 0, right: 0, backgroundColor: colors.background2, paddingHorizontal: 16, paddingVertical: 16, borderTopWidth: 1, borderTopColor: colors.border },
  secondaryButtonSpacing: { marginTop: 12 },
  topBarWrapper: { backgroundColor: colors.background2, borderBottomWidth: 1, borderBottomColor: colors.inputBorder },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backButton: { padding: 4 },
  backButtonBox: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: colors.inputBorder, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { ...getTypographyStyle('t3Title'), color: colors.textPrimary, textAlign: 'center' },
});