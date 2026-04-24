import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import {
    SafeAreaView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';

export interface ProcessingStep {
  id: string;
  label: string;
  detail: string;
}

interface ProcessingScreenProps {
  title: string;
  subtitle: string;
  accentColor: string;
  steps: ProcessingStep[];
  onComplete: () => void;
  totalDurationMs?: number;
}

const RING_SIZE = 210;
const RING_STROKE = 12;
const RADIUS = (RING_SIZE - RING_STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export default function ProcessingScreen({
  title,
  subtitle,
  accentColor,
  steps,
  onComplete,
  totalDurationMs = 7500,
}: ProcessingScreenProps) {
  const [progress, setProgress] = useState(0);
  const [isCompleteFired, setIsCompleteFired] = useState(false);

  const stepProgressWidth = 100 / steps.length;
  const activeStepIndex = Math.min(
    steps.length - 1,
    Math.floor(progress / stepProgressWidth),
  );

  const dashOffset = useMemo(
    () => CIRCUMFERENCE - (CIRCUMFERENCE * progress) / 100,
    [progress],
  );

  useEffect(() => {
    const tickMs = Math.max(Math.round(totalDurationMs / 100), 30);
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      setProgress((current) => {
        const next = Math.min(current + 1, 100);
        return next;
      });

      timeoutId = setTimeout(tick, tickMs);
    };

    timeoutId = setTimeout(tick, tickMs);

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [totalDurationMs]);

  useEffect(() => {
    if (progress < 100 || isCompleteFired) {
      return;
    }

    const doneTimer = setTimeout(() => {
      setIsCompleteFired(true);
      onComplete();
    }, 480);

    return () => clearTimeout(doneTimer);
  }, [isCompleteFired, onComplete, progress]);

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.headerBlock}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>

      <View style={styles.ringWrap}>
        <Svg width={RING_SIZE} height={RING_SIZE}>
          <Circle
            stroke="#E2E8F0"
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
          <Text style={styles.progressText}>{progress}%</Text>
          <Text style={styles.progressLabel}>Running AI pipeline</Text>
        </View>
      </View>

      <View style={styles.stepsCard}>
        {steps.map((step, index) => {
          const isActive = index === activeStepIndex;
          const isDone = index < activeStepIndex || progress === 100;

          return (
            <View key={step.id} style={styles.stepRow}>
              <View
                style={[
                  styles.stepIcon,
                  isDone && { backgroundColor: accentColor },
                  isActive && !isDone && { borderColor: accentColor },
                ]}
              >
                {isDone ? (
                  <Ionicons name="checkmark" size={13} color="#FFFFFF" />
                ) : (
                  <Text style={styles.stepIndexText}>{index + 1}</Text>
                )}
              </View>

              <View style={styles.stepTextWrap}>
                <Text style={[styles.stepLabel, isActive && { color: '#0F172A' }]}>{step.label}</Text>
                <Text style={styles.stepDetail}>{step.detail}</Text>
              </View>
            </View>
          );
        })}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FBFF',
    paddingHorizontal: 18,
  },
  headerBlock: {
    marginTop: 14,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
    textAlign: 'center',
  },
  subtitle: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 13,
    textAlign: 'center',
  },
  ringWrap: {
    marginTop: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringCenter: {
    position: 'absolute',
    alignItems: 'center',
  },
  progressText: {
    fontSize: 34,
    fontWeight: '900',
    color: '#0F172A',
    letterSpacing: -0.8,
  },
  progressLabel: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
  stepsCard: {
    marginTop: 24,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    padding: 14,
    gap: 12,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  stepIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.2,
    borderColor: '#C8D3E0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  stepIndexText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  stepTextWrap: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '700',
  },
  stepDetail: {
    marginTop: 2,
    fontSize: 12,
    color: '#64748B',
  },
});
