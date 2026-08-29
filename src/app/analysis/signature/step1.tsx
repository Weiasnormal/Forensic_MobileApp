import { type AnalysisPriority, useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import DraftSavedModal from '@/_components/modals/draft_saved';
import FormField from '@/_components/common/FormField';
import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import ErrorBanner from '@/_components/common/ErrorBanner';

const documentOptions = ['Bank cheque', 'Property deed', 'Last will', 'Contract', 'Affidavit', 'Other'];
const priorities: AnalysisPriority[] = ['Low', 'Medium', 'High', 'Urgent'];

export default function SignatureStep1Route() {
  const router = useRouter();
  const nav = router as any;
  const draftCase = useCaseStore((state) => state.draftSignatureCase);
  const updateDraftCase = useCaseStore((state) => state.updateDraftCase);
  const discardSignatureDraft = useCaseStore((state) => state.discardSignatureDraft);
  const [showDocumentDropdown, setShowDocumentDropdown] = useState(false);
  const [showDraftSavedModal, setShowDraftSavedModal] = useState(false);
  const canContinue = draftCase.subjectName.trim().length > 1 && draftCase.examiner.trim().length > 1;
  const caseIdParts = draftCase.caseId.split('-');
  const month = caseIdParts[0];
  const day = caseIdParts[1];
  const year = caseIdParts[2];
  const caseNo = caseIdParts[3];

  

  const submissionError = useCaseStore((state) => state.submissionError);

  const insets = useSafeAreaInsets();

  const confirmSaveDraft = useCallback(() => {
    setShowDraftSavedModal(true);
  }, []);

  useFocusEffect(
    useCallback(() => {
      const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
        confirmSaveDraft();
        return true;
      });

      return () => subscription.remove();
    }, [confirmSaveDraft])
  );

  return (
    <SafeAreaView style={styles.screen}>
      <TopBar title="New Analysis" step="1 / 2" onBackPress={confirmSaveDraft} />
      <View style={styles.progressWrap}>
        <View style={styles.progressBar} />
        <View style={[styles.progressFill, { width: '50%' }]} />
      </View>
      <ScrollView contentContainerStyle={[styles.content, { paddingBottom: Math.max(120, insets.bottom + 96) }]} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <ErrorBanner message={submissionError} title="Upload issue" />
        <View style={styles.headerSection}>
          <Text style={styles.sectionHeading}>Case Details</Text>
          <Text style={styles.sectionSubheading}>Basic information for this forensic case</Text>
        </View>
        <View style={styles.formGroup}>
          <FieldLabel label="Case ID" />
          <View style={styles.caseIdBox}>
            <Text style={styles.caseIdDisplay}>{draftCase.caseId}</Text>
          </View>
          <View style={styles.caseIdHelper}>
            <Ionicons name="information-circle" size={14} color={colors.label} />
            <Text style={styles.helperText}>{month} · Month  {day} · Day  {year} · Year  {caseNo} · Case no.</Text>
          </View>
        </View>

        <FormField
          label="Subject name"
          value={draftCase.subjectName}
          onChangeText={(value) => updateDraftCase('subjectName', value)}
          placeholder="Enter subject name"
        />

        <FormField
          label="Examiner"
          value={draftCase.examiner}
          onChangeText={(value) => updateDraftCase('examiner', value)}
          placeholder="Enter examiner name"
        />

        <View style={styles.formGroup}>
          <FieldLabel label="Document Type" />
          <Pressable onPress={() => setShowDocumentDropdown(!showDocumentDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>{draftCase.documentType || 'Bank cheque'}</Text>
            <Ionicons name={showDocumentDropdown ? 'chevron-up' : 'chevron-down'} size={20} color={colors.textPrimary} />
          </Pressable>
          {showDocumentDropdown && (
            <View style={styles.dropdownMenu}>
              {documentOptions.map((option) => (
                <Pressable key={option} onPress={() => { updateDraftCase('documentType', option); setShowDocumentDropdown(false); }} style={styles.dropdownItem}>
                  <Text style={styles.dropdownItemText}>{option}</Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
        <View style={styles.formGroup}>
          <FieldLabel label="Priority" />
          <View style={styles.priorityRow}>
            {priorities.map((priority) => {
              const selected = draftCase.priority === priority;
              const isUrgent = priority === 'Urgent';
              return (
                <Pressable
                  key={priority}
                  onPress={() => updateDraftCase('priority', priority)}
                  style={[
                    styles.priorityChip,
                    selected && (isUrgent ? styles.priorityChipSelectedDanger : styles.priorityChipSelected),
                  ]}
                >
                  <Text
                    style={[
                      styles.priorityText,
                      selected && (isUrgent ? styles.priorityTextSelectedDanger : styles.priorityTextSelected),
                    ]}
                  >
                    {priority}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}>
        <PrimaryButton
          label="Continue"
          onPress={() => nav.push('/analysis/signature/uploads')}
          disabled={!canContinue}
          size="medium"
        />
      </View>

      <DraftSavedModal
        visible={showDraftSavedModal}
        onSaveDraft={() => {
          setShowDraftSavedModal(false);
          nav.back();
        }}
        onDiscard={() => {
          discardSignatureDraft();
          setShowDraftSavedModal(false);
          nav.back();
        }}
        onGoBack={() => {
          setShowDraftSavedModal(false);
        }}
      />
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

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.fieldLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background2,
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
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    textAlign: 'center',
  },
  stepCounter: {
    ...getTypographyStyle('l1List'),
    color: colors.label,
  },
  progressBar: {
    height: 3,
    backgroundColor: colors.border,
    width: '100%',
  },
  progressWrap: {
    position: 'relative',
  },
  progressFill: {
    height: 3,
    backgroundColor: colors.primary,
    position: 'absolute',
    top: 0,
    left: 0,
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
    ...getTypographyStyle('t2Title'),
    color: colors.textPrimary,
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    marginTop: 4,
  },
  formGroup: {
    gap: 8,
  },
  fieldLabel: {
    ...getTypographyStyle('c1Caption'),
    color: colors.textSecondary,
    letterSpacing: 0.4,
  },
  caseIdBox: {
    borderWidth: 1,
    borderColor: colors.uploadSlotBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.cardBackground,
  },
  caseIdDisplay: {
    ...getTypographyStyle('body', 'semiBold'),
    color: colors.textPrimary,
  },
  caseIdHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  helperText: {
    ...getTypographyStyle('l2List', 'regular'),
    color: colors.label,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: colors.uploadSlotBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: colors.cardBackground,
  },
  dropdownText: {
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: colors.uploadSlotBorder,
    borderRadius: 12,
    backgroundColor: colors.cardBackground,
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dropdownItemText: {
    ...getTypographyStyle('body'),
    color: colors.textPrimary,
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: colors.uploadSlotBorder,
    borderRadius: 10,
    paddingHorizontal: 22,
    paddingVertical: 9,
    backgroundColor: colors.cardBackground,
  },
  priorityChipSelectedDanger: {
    backgroundColor: colors.dangerLight,
    borderColor: colors.dangerBorder,
  },
  priorityChipSelected: {
    backgroundColor: colors.badgeBackground,
    borderColor: colors.primaryDisabled,
  },
  priorityText: {
    ...getTypographyStyle('c1Caption'),
    color: colors.chipTextInactive,
  },
  priorityTextSelectedDanger: {
    color: colors.danger,
  },
  priorityTextSelected: {
    color: colors.primary,
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});