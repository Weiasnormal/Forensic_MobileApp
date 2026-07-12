import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import PrimaryButton from '@/_components/common/PrimaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { type CaseStatus, useCaseStore } from '../../store/caseStore';
import ProcessingScreen, { type ProcessingStep } from '../analysis/ProcessingScreen';

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

export function SignatureProcessingView() {
  const router = useRouter();
  const nav = router as any;
  const currentCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const updateCaseStatus = useCaseStore((state) => state.updateCaseStatus);
  const submissionStatus = useCaseStore((state) => state.submissionStatus);
  const submissionStep = useCaseStore((state) => state.submissionStep);
  const submissionProgress = useCaseStore((state) => state.submissionProgress);
  const submissionError = useCaseStore((state) => state.submissionError);
  const resetSubmissionState = useCaseStore((state) => state.resetSubmissionState);

  const setSignatureStatus = (status: CaseStatus) => {
    if (!currentCaseId) return;
    updateCaseStatus(currentCaseId, status);
  };

  const handleBackToHome = () => {
    setSignatureStatus('Processing');
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };

  useEffect(() => {
    if (submissionStatus !== 'error') return;
    Alert.alert('Submission failed', submissionError || 'An unexpected error occurred.', [
      {
        text: 'Back to uploads',
        onPress: () => {
          resetSubmissionState();
          nav.replace('/analysis/signature/uploads');
        },
      },
    ]);
  }, [nav, resetSubmissionState, submissionError, submissionStatus]);

  return (
    <SafeAreaView style={styles.screen}>
      <ProcessingScreen
        title="Processing Signature"
        subtitle="AI forensic engine is running multi-stage comparison"
        accentColor={colors.primary}
        steps={processingSteps}
        progress={submissionProgress}
        statusText={submissionStep || 'Preparing…'}
        onComplete={() => {
          if (submissionStatus === 'success' && currentCaseId) {
            nav.replace(`/analysis/signature/results/${currentCaseId}`);
          }
        }}
      />
      <View style={styles.buttonWrap}>
        <PrimaryButton label="Run in Background" onPress={handleBackToHome} size="medium" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  buttonWrap: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
});
