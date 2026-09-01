import { useLocalSearchParams, useRouter } from 'expo-router';
import { Check, Info } from 'lucide-react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';

import PrimaryButton from '@/_components/common/PrimaryButton';
import SecondaryButton from '@/_components/common/SecondaryButton';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import { useCaseStore } from '@/store/caseStore';
import ErrorModal from '@/_components/modals/error_modal';

interface ProcessingStepInfo {
  id: string;
  label: string;
  detail: string;
  heroTitle: string;
  heroSubtitle: string;
}

const PROCESSING_STEPS: ProcessingStepInfo[] = [
  {
    id: 'sig-preprocess',
    label: 'Image preprocessing',
    detail: 'Normalize & enhance contrast',
    heroTitle: 'Preprocessing...',
    heroSubtitle: 'Normalizing & enhancing contrast',
  },
  {
    id: 'sig-feature',
    label: 'Feature extraction',
    detail: 'Siamese network encoding',
    heroTitle: 'Extracting features...',
    heroSubtitle: 'Siamese network encoding',
  },
  {
    id: 'sig-score',
    label: 'Similarity scoring',
    detail: 'Triplet loss comparison',
    heroTitle: 'Scoring similarity...',
    heroSubtitle: 'Triplet loss comparison',
  },
  {
    id: 'sig-heatmap',
    label: 'Heatmap generation',
    detail: 'Grad-CAM visualization',
    heroTitle: 'Generating heatmap...',
    heroSubtitle: 'Grad-CAM visualization',
  },
  {
    id: 'sig-report',
    label: 'Report compilation',
    detail: 'Building forensic output',
    heroTitle: 'Compiling report...',
    heroSubtitle: 'Building forensic output',
  },
];

const RING_SIZE = 160;
const RING_STROKE = 12;
const RING_RADIUS = (RING_SIZE - RING_STROKE) / 2;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

function getHeroContent(progress: number) {
  if (progress <= 0) {
    return { title: 'Initializing...', subtitle: 'Preparing signature images' };
  }
  if (progress >= 100) {
    const last = PROCESSING_STEPS[PROCESSING_STEPS.length - 1];
    return { title: last.heroTitle, subtitle: last.heroSubtitle };
  }
  const stepWidth = 100 / PROCESSING_STEPS.length;
  const currentIndex = Math.min(Math.floor(progress / stepWidth), PROCESSING_STEPS.length - 1);
  const referenceStep = currentIndex === 0 ? PROCESSING_STEPS[0] : PROCESSING_STEPS[currentIndex - 1];
  return { title: referenceStep.heroTitle, subtitle: referenceStep.heroSubtitle };
}

export default function SignatureProcessingRoute() {
  const router = useRouter();
  const nav = router as any;
  const params = useLocalSearchParams<{ caseId?: string }>();

  const storeActiveCaseId = useCaseStore((state) => state.activeSignatureCaseId);
  const setActiveSignatureCaseId = useCaseStore((state) => state.setActiveSignatureCaseId);
  const retryAnalysis = useCaseStore((state) => state.retryAnalysis);
  const resetSubmissionState = useCaseStore((state) => state.resetSubmissionState);

  const routeCaseId = typeof params.caseId === 'string' ? params.caseId : undefined;
  const currentCaseId = routeCaseId ?? storeActiveCaseId ?? null;

  useEffect(() => {
    if (routeCaseId && routeCaseId !== storeActiveCaseId) {
      setActiveSignatureCaseId(routeCaseId);
    }
  }, [routeCaseId, storeActiveCaseId, setActiveSignatureCaseId]);

  const job = useCaseStore((state) => (currentCaseId ? state.processingJobs[currentCaseId] : undefined));
  const legacyStatus = useCaseStore((state) => state.submissionStatus);
  const legacyStep = useCaseStore((state) => state.submissionStep);
  const legacyProgress = useCaseStore((state) => state.submissionProgress);
  const legacyError = useCaseStore((state) => state.submissionError);

  const effectiveStatus = job?.status ?? legacyStatus;
  const effectiveStep = job?.step ?? legacyStep;
  const effectiveError = job?.error ?? legacyError;
  const targetProgress = Math.min(100, Math.max(0, job?.progress ?? legacyProgress ?? 0));
  const isFailedState = effectiveStatus === 'error' || effectiveStatus === 'interrupted';


  const [displayProgress, setDisplayProgress] = useState(targetProgress);
  const [isCompleteFired, setIsCompleteFired] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const targetRef = useRef(targetProgress);
  const creepAccumulatorRef = useRef(0);

  useEffect(() => {
    targetRef.current = targetProgress;
  }, [targetProgress]);

  useEffect(() => {
    let lastTick = Date.now();
    const intervalId = setInterval(() => {
      const now = Date.now();
      const dt = now - lastTick;
      lastTick = now;

      setDisplayProgress((current) => {
        const target = targetRef.current;

        if (current < target) {
          const gap = target - current;
          const step = Math.max(1, Math.ceil(gap / 6));
          return Math.min(target, current + step);
        }

        if (!isFailedState && target < 100 && current < 97) {
          creepAccumulatorRef.current += dt;
          if (creepAccumulatorRef.current >= 650) {
            creepAccumulatorRef.current = 0;
            return Math.min(current + 1, target + 10, 97);
          }
          return current;
        }

        if (current > target) return target;
        return current;
      });
    }, 45);

    return () => clearInterval(intervalId);
  }, [isFailedState]);

  const progress = displayProgress;
  const stepWidth = 100 / PROCESSING_STEPS.length;
  const activeStepIndex = Math.min(PROCESSING_STEPS.length - 1, Math.floor(progress / stepWidth));
  const hero = useMemo(() => getHeroContent(progress), [progress]);
  const strokeDashoffset = useMemo(
    () => RING_CIRCUMFERENCE - (RING_CIRCUMFERENCE * progress) / 100,
    [progress],
  );

  const handleBackToHome = () => {
    nav.replace({ pathname: '/User/user_dashboard', params: { tab: 'home' } });
  };

  useEffect(() => {
    if (isFailedState) {
      setShowErrorModal(true);
    }
  }, [isFailedState]);

  useEffect(() => {
    if (isFailedState || progress < 100 || isCompleteFired) return;
    const doneTimer = setTimeout(() => {
      setIsCompleteFired(true);
      if (effectiveStatus === 'success' && currentCaseId) {
        nav.replace({ pathname: '/analysis/signature/signature_results', params: { caseId: currentCaseId } });
      }
    }, 200);
    return () => clearTimeout(doneTimer);
  }, [isCompleteFired, progress, effectiveStatus, currentCaseId, nav, isFailedState]);

  const handleRetry = async () => {
    if (!currentCaseId) return;
    setShowErrorModal(false);
    setIsCompleteFired(false);
    try {
      await retryAnalysis(currentCaseId);
    } catch (error) {
      console.warn('Retry analysis failed:', error);
    }
  };

  const handleDiscardAndReupload = () => {
    setShowErrorModal(false);
    resetSubmissionState();
    nav.replace('/analysis/signature/uploads');
  };

  if (!currentCaseId) {
    return (
      <SafeAreaView style={styles.screen}>
        <View style={styles.emptyState}>
          <Info size={32} color={colors.label} />
          <Text style={styles.emptyStateTitle}>No case selected</Text>
          <Text style={styles.emptyStateSubtitle}>
            Open this screen from a case marked &quot;Processing&quot; on your dashboard.
          </Text>
          <PrimaryButton label="Back to Home" onPress={handleBackToHome} size="medium" style={styles.emptyStateButton} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.topSection}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                stroke={colors.statsBackground}
                fill="none"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                strokeWidth={RING_STROKE}
              />
              <Circle
                stroke={isFailedState ? colors.danger : colors.primary}
                fill="none"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RING_RADIUS}
                strokeWidth={RING_STROKE}
                strokeDasharray={`${RING_CIRCUMFERENCE} ${RING_CIRCUMFERENCE}`}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
              />
            </Svg>

            <View style={styles.ringCenter} pointerEvents="none">
              <Text style={styles.progressText}>{Math.round(progress)}%</Text>
              <Text style={styles.progressLabel}>{isFailedState ? 'INTERRUPTED' : 'COMPLETE'}</Text>
            </View>
          </View>

          <Text style={styles.title}>{isFailedState ? 'Processing interrupted' : hero.title}</Text>
          <Text style={styles.subtitle}>
            {isFailedState ? (effectiveError ?? 'Something went wrong.') : hero.subtitle}
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.checklistSection}>
          {PROCESSING_STEPS.map((step, index) => {
            const isActive = index === activeStepIndex && progress < 100 && !isFailedState;
            const isDone = (index < activeStepIndex || progress === 100) && !isFailedState;
            const isPending = !isActive && !isDone;

            return (
              <View key={step.id} style={styles.stepRow}>
                <View style={styles.iconContainer}>
                  {isDone && (
                    <View style={[styles.iconCircle, styles.iconDone]}>
                      <Check size={14} color={colors.primaryText} strokeWidth={3} />
                    </View>
                  )}
                  {isActive && (
                    <View style={[styles.iconCircle, styles.iconActive, { borderColor: colors.primary }]}>
                      <View style={[styles.iconActiveDot, { backgroundColor: colors.primary }]} />
                    </View>
                  )}
                  {isPending && <View style={[styles.iconCircle, styles.iconPending]} />}
                </View>

                <View style={styles.stepTextWrap}>
                  <Text style={[styles.stepTitle, isPending ? styles.stepTitlePending : styles.stepTitleActive]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepSubtitle}>{step.detail}</Text>
                </View>

                <View style={styles.statusWrap}>
                  {isDone && <Text style={styles.statusTextDone}>Done</Text>}
                  {isActive && <Text style={styles.statusTextRunning}>Running</Text>}
                  {isPending && <Text style={styles.statusTextPending}>—</Text>}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.backgroundHint}>
          <Info size={14} color={colors.label} />
          <Text style={styles.backgroundHintText}>
            {isFailedState
              ? 'This case is safely saved. You can retry the analysis without re-uploading your images.'
              : "You may continue using the app while processing runs in the background. We'll notify you once it's complete."}
          </Text>
        </View>
        {isFailedState ? (
          <>
            <PrimaryButton label="Retry Analysis" onPress={handleRetry} size="medium" />
            <SecondaryButton label="Back to Home" onPress={handleBackToHome} size="medium" style={styles.secondaryButtonSpacing} />
          </>
        ) : (
          <PrimaryButton label="Back to Home" onPress={handleBackToHome} size="medium" />
        )}
      </View>

      <ErrorModal
        visible={showErrorModal}
        title="Processing interrupted"
        message={effectiveError || 'This case could not finish processing.'}
        primaryLabel="Retry Analysis"
        onPrimaryPress={handleRetry}
        secondaryLabel="Start over with new uploads"
        onSecondaryPress={handleDiscardAndReupload}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.cardBackground,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  topSection: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    ...getTypographyStyle('largeTitle'),
    color: colors.textPrimary,
    letterSpacing: -1,
    marginBottom: -2,
  },
  progressLabel: {
    ...getTypographyStyle('c1Caption', 'medium'),
    color: colors.label,
    letterSpacing: 1,
  },
  title: {
    ...getTypographyStyle('t1Title'),
    color: colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: colors.statsBackground,
    marginBottom: 24,
  },
  checklistSection: {
    width: '100%',
    gap: 20,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  iconContainer: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconDone: {
    backgroundColor: colors.statusGenuine,
  },
  iconActive: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
  },
  iconActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconPending: {
    backgroundColor: colors.cardBackground,
    borderWidth: 2,
    borderColor: colors.disabledBorder,
  },
  stepTextWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  stepTitle: {
    ...getTypographyStyle('c1Caption', 'bold'),
    marginBottom: 2,
  },
  stepTitleActive: {
    color: colors.textPrimary,
  },
  stepTitlePending: {
    color: colors.label,
  },
  stepSubtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
  },
  statusWrap: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  statusTextDone: {
    ...getTypographyStyle('c1Caption', 'bold'),
    color: colors.statusGenuine,
  },
  statusTextRunning: {
    ...getTypographyStyle('c1Caption', 'bold'),
    color: colors.primary,
  },
  statusTextPending: {
    ...getTypographyStyle('c1Caption', 'bold'),
    color: colors.textTertiary,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    paddingTop: 8,
    gap: 10,
  },
  backgroundHint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingHorizontal: 2,
  },
  backgroundHintText: {
    ...getTypographyStyle('c3Caption'),
    color: colors.label,
    flex: 1,
    lineHeight: 14,
    paddingBottom: 10,
  },
  secondaryButtonSpacing: {
    marginTop: 10,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 10,
  },
  emptyStateTitle: {
    ...getTypographyStyle('t3Title'),
    color: colors.textPrimary,
    marginTop: 4,
  },
  emptyStateSubtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: colors.textSecondary,
    textAlign: 'center',
  },
  emptyStateButton: {
    marginTop: 12,
    alignSelf: 'stretch',
  },
});