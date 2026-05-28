import { type AnalysisPriority, useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { BackHandler, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import DraftSavedModal from '@/_components/modals/draft_saved';

const ACCENT = '#1F5DA8';
const SCREEN_BG = '#FFFFFF';
const documentOptions = ['Bank cheque', 'Legal contract', 'Government form', 'Insurance document', 'Payroll statement'];
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
            <Ionicons name="information-circle" size={14} color="#94A3B8" />
            <Text style={styles.helperText}>{month} · Month  {day} · Day  {year} · Year  {caseNo} · Case no.</Text>
          </View>
        </View>
        <View style={styles.formGroup}>
          <FieldLabel label="Subject name" />
          <TextInput value={draftCase.subjectName} onChangeText={(value) => updateDraftCase('subjectName', value)} placeholder="Enter subject name" placeholderTextColor="#CBD5E1" style={styles.textInput} />
        </View>
        <View style={styles.formGroup}>
          <FieldLabel label="Examiner" />
          <TextInput value={draftCase.examiner} onChangeText={(value) => updateDraftCase('examiner', value)} placeholder="Enter examiner name" placeholderTextColor="#CBD5E1" style={styles.textInput} />
        </View>
        <View style={styles.formGroup}>
          <FieldLabel label="Document Type" />
          <Pressable onPress={() => setShowDocumentDropdown(!showDocumentDropdown)} style={styles.dropdownButton}>
            <Text style={styles.dropdownText}>{draftCase.documentType || 'Bank cheque'}</Text>
            <Ionicons name={showDocumentDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#0F172A" />
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
              return (
                <Pressable key={priority} onPress={() => updateDraftCase('priority', priority)} style={[styles.priorityChip, selected && { backgroundColor: ACCENT, borderColor: ACCENT }]}>
                  <Text style={[styles.priorityText, selected && { color: '#FFFFFF' }]}>{priority}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </ScrollView>
      <View style={[styles.buttonContainer, { bottom: insets.bottom, zIndex: 50 }]}>
        <Pressable onPress={() => nav.push('/analysis/signature/uploads')} disabled={!canContinue} style={[styles.primaryButton, !canContinue && styles.disabledButton]}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </View>

      <DraftSavedModal
        visible={showDraftSavedModal}
        title="Save Draft"
        message="How would you like to proceed?"
        primaryLabel="Save as Draft"
        secondaryLabel="Discard"
        tertiaryLabel="Go Back"
        onSecondaryPress={() => {
          discardSignatureDraft();
          setShowDraftSavedModal(false);
          nav.back();
        }}
        onTertiaryPress={() => {
          setShowDraftSavedModal(false);
        }}
        onContinue={() => {
          setShowDraftSavedModal(false);
          nav.back();
        }}
        onDismiss={() => {
          discardSignatureDraft();
          setShowDraftSavedModal(false);
          nav.back();
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
            <Ionicons name="chevron-back" size={20} color="#0F172A" />
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
    backgroundColor: SCREEN_BG,
  },
  topBarWrapper: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  backButton: {
    padding: 4,
  },
  backButtonBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  stepCounter: {
    fontSize: 13,
    fontWeight: '700',
    color: '#94A3B8',
  },
  progressBar: {
    height: 3,
    backgroundColor: '#E8EBF0',
    width: '100%',
  },
  progressWrap: {
    position: 'relative',
  },
  progressFill: {
    height: 3,
    backgroundColor: ACCENT,
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
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.3,
  },
  sectionSubheading: {
    marginTop: 4,
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
  },
  formGroup: {
    gap: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  caseIdBox: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  caseIdDisplay: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '600',
  },
  caseIdHelper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 0,
    marginTop: 4,
  },
  helperText: {
    fontSize: 11,
    color: '#94A3B8',
    lineHeight: 14,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  dropdownMenu: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    marginTop: 4,
    overflow: 'hidden',
  },
  dropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E8EBF0',
  },
  dropdownItemText: {
    fontSize: 14,
    color: '#0F172A',
    fontWeight: '500',
  },
  priorityRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    borderWidth: 1,
    borderColor: '#D8E3EF',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
    backgroundColor: '#FFFFFF',
  },
  priorityText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    borderRadius: 12,
    backgroundColor: ACCENT,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabledButton: {
    backgroundColor: '#CBD5E1',
    opacity: 1,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E8EBF0',
  },
});
