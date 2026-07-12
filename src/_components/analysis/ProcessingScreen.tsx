import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState, useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { getTypographyStyle } from '@/constants/typography';

export interface ProcessingStep {
  id: string;
  label: string;
  detail: string;
}

interface ProcessingScreenProps {
  title?: string; 
  subtitle?: string; 
  accentColor?: string;
  steps: ProcessingStep[];
  onComplete: () => void;
  totalDurationMs?: number;
  progress?: number;    
  statusText?: string; 
}

const RING_SIZE = 160;
const RING_STROKE = 12;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProcessingScreen({
  title, subtitle, accentColor, steps, onComplete, totalDurationMs = 7500, progress: controlledProgress, statusText,
}: ProcessingScreenProps) {
  const isControlled = controlledProgress !== undefined;
  const [internalProgress, setInternalProgress] = useState(0);
  const [isCompleteFired, setIsCompleteFired] = useState(false);

  const targetProgress = isControlled
    ? Math.min(100, Math.max(0, controlledProgress!))
    : internalProgress;
  const [displayProgress, setDisplayProgress] = useState(0);
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

        if (isControlled && target < 100 && current < 97) {
          creepAccumulatorRef.current += dt;
          if (creepAccumulatorRef.current >= 650) {
            creepAccumulatorRef.current = 0;
            return Math.min(current + 1, target + 10, 97);
          }
          return current;
        }

        if (current > target) {
          return target;
        }

        return current;
      });
    }, 45);

    return () => clearInterval(intervalId);
  }, [isControlled]);

  const progress = displayProgress;

  const stepProgressWidth = 100 / steps.length;
  const activeStepIndex = Math.min(steps.length - 1, Math.floor(progress / stepProgressWidth));
  const dashOffset = useMemo(() => CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100, [progress]);

  useEffect(() => {
    if (isControlled) return; 
    const tickMs = Math.max(Math.round(totalDurationMs / 100), 30);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const tick = () => {
      setInternalProgress((current) => Math.min(current + 1, 100));
      timeoutId = setTimeout(tick, tickMs);
    };
    timeoutId = setTimeout(tick, tickMs);
    return () => { if (timeoutId) clearTimeout(timeoutId); };
  }, [totalDurationMs, isControlled]);

  useEffect(() => {
    if (progress < 100 || isCompleteFired) return;
    const doneTimer = setTimeout(() => {
      setIsCompleteFired(true);
      onComplete();
    }, isControlled ? 200 : 480);
    return () => clearTimeout(doneTimer);
  }, [isCompleteFired, onComplete, progress, isControlled]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.container}>
        
        <View style={styles.topSection}>
          <View style={styles.ringWrap}>
            <Svg width={RING_SIZE} height={RING_SIZE}>
              <Circle
                stroke="#F1F5F9"
                fill="none"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={RING_STROKE}
              />
              <Circle
                stroke={accentColor}
                fill="none"
                cx={RING_SIZE / 2}
                cy={RING_SIZE / 2}
                r={RADIUS}
                strokeWidth={RING_STROKE}
                strokeDasharray={`${CIRCUMFERENCE} ${CIRCUMFERENCE}`}
                strokeDashoffset={dashOffset}
                strokeLinecap="round"
                transform={`rotate(-90, ${RING_SIZE / 2}, ${RING_SIZE / 2})`}
              />
            </Svg>

            <View style={styles.ringCenter}>
              <Text style={[styles.progressText, { color: '#000000' }]}>{progress}%</Text>
              <Text style={[styles.progressLabel, { color: '#94A3B8' }]}>COMPLETE</Text>
            </View>
          </View>

          <Text style={styles.title}>{statusText ?? 'Running AI pipeline'}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.checklistSection}>
          {steps.map((step, index) => {
            const isActive = index === activeStepIndex && progress < 100;
            const isDone = index < activeStepIndex || progress === 100;
            const isPending = !isActive && !isDone;

            return (
              <View key={step.id} style={styles.stepRow}>
                
                <View style={styles.iconContainer}>
                  {isDone && (
                    <View style={[styles.iconCircle, styles.iconDone]}>
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </View>
                  )}
                  {isActive && (
                    <View style={[styles.iconCircle, styles.iconActive, { borderColor: accentColor }]}>
                      <View style={[styles.iconActiveDot, { backgroundColor: accentColor }]} />
                    </View>
                  )}
                  {isPending && (
                    <View style={[styles.iconCircle, styles.iconPending]} />
                  )}
                </View>

                <View style={styles.stepTextWrap}>
                  <Text style={[styles.stepTitle, (isActive || isDone) ? styles.stepTitleActive : styles.stepTitlePending]}>
                    {step.label}
                  </Text>
                  <Text style={styles.stepSubtitle}>
                    {step.detail}
                  </Text>
                </View>
 
                <View style={styles.statusWrap}>
                  {isDone && <Text style={styles.statusTextDone}>Done</Text>}
                  {isActive && <Text style={[styles.statusTextRunning, { color: accentColor }]}>Running</Text>}
                </View>
              </View>
            );
          })}
        </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 40,
    paddingBottom: 20,
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
    ...getTypographyStyle('largeTitle', 'bold'),
    letterSpacing: -1,
    marginBottom: -2,
  },
  progressLabel: {
    ...getTypographyStyle('c1Caption', 'medium'),
    letterSpacing: 1,
  },
  title: {
    ...getTypographyStyle('t1Title', 'bold'),
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  subtitle: {
    ...getTypographyStyle('c1Caption'),
    color: '#64748B',
    textAlign: 'center',
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#F1F5F9',
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
    backgroundColor: '#22C55E',
  },
  iconActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
  },
  iconActiveDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  iconPending: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
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
    color: '#0F172A',
    ...getTypographyStyle('c1Caption', 'bold'),
  },
  stepTitlePending: {
    color: '#94A3B8',
    ...getTypographyStyle('c1Caption', 'bold'),
  },
  stepSubtitle: {
    ...getTypographyStyle('c1Caption', 'regular'),
    color: '#64748B',
  },
  statusWrap: {
    minWidth: 60,
    alignItems: 'flex-end',
  },
  statusTextDone: {
    color: '#22C55E',
    ...getTypographyStyle('c1Caption', 'bold'),
  },
  statusTextRunning: {
    ...getTypographyStyle('c1Caption', 'bold'),
  },
});