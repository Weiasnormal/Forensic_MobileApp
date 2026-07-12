import { useCaseStore } from '@/store/caseStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

const monthlyBars = [
  { month: 'Nov', genuine: 36, suspected: 18 },
  { month: 'Dec', genuine: 56, suspected: 12 },
  { month: 'Jan', genuine: 52, suspected: 11 },
  { month: 'Feb', genuine: 55, suspected: 13 },
  { month: 'Mar', genuine: 71, suspected: 16 },
  { month: 'Apr', genuine: 82, suspected: 24 },
];

export default function UserStatsScreen() {
  const cases = useCaseStore((state) => state.cases);
  const skeletonOpacity = useRef(new Animated.Value(0.5)).current;

  const summary = useMemo(() => {
    const totals = cases.reduce(
      (accumulator, item) => {
        accumulator.total += 1;
        accumulator.genuine += item.status === 'Genuine' ? 1 : 0;
        accumulator.suspected += item.status === 'Suspected' ? 1 : 0;
        accumulator.processing += item.status === 'Processing' ? 1 : 0;
        accumulator.documentTypeCounts[item.documentType] =
          (accumulator.documentTypeCounts[item.documentType] || 0) + 1;
        return accumulator;
      },
      {
        total: 0,
        genuine: 0,
        suspected: 0,
        processing: 0,
        documentTypeCounts: {} as Record<string, number>,
      },
    );

    const largestDocumentCount = Math.max(...Object.values(totals.documentTypeCounts), 1);

    const documentTypes = Object.entries(totals.documentTypeCounts)
      .sort((left, right) => right[1] - left[1])
      .map(([label, count]) => ({
        label,
        count,
        width: Math.max(0.15, count / largestDocumentCount),
      }));

    return {
      ...totals,
      documentTypes,
      genuinePercent: totals.total > 0 ? Math.round((totals.genuine / totals.total) * 100) : 0,
    };
  }, [cases]);

  useEffect(() => {
    if (summary.total > 0) {
      skeletonOpacity.setValue(1);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(skeletonOpacity, {
          toValue: 0.35,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(skeletonOpacity, {
          toValue: 0.9,
          duration: 900,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();
    return () => animation.stop();
  }, [summary.total, skeletonOpacity]);

  if (summary.total === 0) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text allowFontScaling={false} style={styles.title}>Statistics</Text>
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.skeletonInfoCard}>
            <View>
              <Ionicons name="information-circle-outline" size={24} color={colors.statsTextMuted} />
            </View>
            <Text allowFontScaling={false} style={styles.skeletonInfoTextLabel}>
              Submit your first case to start seeing data here.
            </Text>
          </View>

          <View style={styles.skeletonCardLarge}>
            <Animated.View style={[styles.skeletonTitlePill, { opacity: skeletonOpacity }]} />
            <Animated.View style={[styles.skeletonLineMd, { opacity: skeletonOpacity }]} />
            <Animated.View style={[styles.skeletonLineLg, { opacity: skeletonOpacity }]} />
            <Animated.View style={[styles.skeletonLineLg, { opacity: skeletonOpacity }]} />
            <Animated.View style={[styles.skeletonDonut, { opacity: skeletonOpacity }]} />
          </View>

          <View style={styles.skeletonCardChart}>
            <View style={styles.skeletonChartHead}>
              <Animated.View style={[styles.skeletonLineSm, { opacity: skeletonOpacity }]} />
              <Animated.View style={[styles.skeletonHeaderPill, { opacity: skeletonOpacity }]} />
            </View>
            <View style={styles.skeletonBarsWrap}>
              {[0, 1, 2, 3, 4, 5].map((item) => (
                <View key={item} style={styles.skeletonBarColumn}>
                  <Animated.View style={[styles.skeletonBar, { opacity: skeletonOpacity }]} />
                  <Animated.View style={[styles.skeletonTick, { opacity: skeletonOpacity }]} />
                </View>
              ))}
            </View>
            <View style={styles.skeletonLegendRow}>
              <Animated.View style={[styles.skeletonLegendItem, { opacity: skeletonOpacity }]} />
              <Animated.View style={[styles.skeletonLegendItem, { opacity: skeletonOpacity }]} />
            </View>
          </View>

          <View style={styles.skeletonCardList}>
            {[0, 1, 2, 3, 4].map((item) => (
              <View key={item} style={styles.skeletonListRow}>
                <Animated.View style={[styles.skeletonListLine, { opacity: skeletonOpacity }]} />
                <Animated.View style={[styles.skeletonListDot, { opacity: skeletonOpacity }]} />
              </View>
            ))}
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Text allowFontScaling={false} style={styles.title}>Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text allowFontScaling={false} style={styles.bigNumber}>{summary.total}</Text>
            <Text allowFontScaling={false} style={styles.bigLabel}>TOTAL CASES</Text>

            <View style={styles.statPillGreen}>
              <Text allowFontScaling={false} style={styles.statPillGreenText}>{summary.genuine} genuine</Text>
            </View>
            <View style={styles.statPillRed}>
              <Text allowFontScaling={false} style={styles.statPillRedText}>{summary.suspected} suspected</Text>
            </View>
          </View>

          <View style={styles.donutArea}>
            <View style={styles.donutOuter}>
              <View style={styles.donutLeftHalf}>
                <View style={styles.donutLeftArc} />
              </View>
              <View style={styles.donutRightHalf}>
                <View style={styles.donutRightArc} />
              </View>
              <View style={styles.donutCenter}>
                <Text allowFontScaling={false} style={styles.donutPercent}>{summary.genuinePercent}%</Text>
                <Text allowFontScaling={false} style={styles.donutCaption}>Genuine</Text>
              </View>
            </View>
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.sectionHeader}>Monthly Trend</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text allowFontScaling={false} style={styles.cardTitle}>Cases over time</Text>
            <View style={styles.trendBadge}>
              <Text allowFontScaling={false} style={styles.trendBadgeText}>18% vs last month</Text>
            </View>
          </View>

          <View style={styles.barChartWrap}>
            {monthlyBars.map((bar) => (
              <View key={bar.month} style={styles.barColumn}>
                <View style={styles.barStack}>
                  <View style={[styles.barSegment, styles.barGenuine, { height: `${bar.genuine}%` }]} />
                  <View style={[styles.barSegment, styles.barSuspected, { height: `${bar.suspected}%` }]} />
                </View>
                <Text allowFontScaling={false} style={styles.barLabel}>{bar.month}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <LegendItem color={colors.labelsuccess} label="Genuine" />
            <LegendItem color={colors.danger} label="Suspected" />
          </View>
        </View>

        <Text allowFontScaling={false} style={styles.sectionHeader}>Document Types</Text>

        <View style={styles.chartCard}>
          {summary.documentTypes.length > 0 ? summary.documentTypes.map((item) => (
            <View key={item.label} style={styles.docRow}>
              <Text allowFontScaling={false} style={styles.docLabel}>{item.label}</Text>
              <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.width * 100}%` }]} />
                </View>
              </View>
              <Text allowFontScaling={false} style={styles.docCount}>{item.count}</Text>
            </View>
          )) : <Text allowFontScaling={false} style={styles.emptyState}>No cases yet</Text>}
        </View>
      </ScrollView>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text allowFontScaling={false} style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.statsBackground,
  },
  header: {
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.disabledBorder,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
  },
  title: {
    ...getTypographyStyle('t1Title'),
    fontSize: 26,
    color: colors.statsTextPrimary,
    letterSpacing: -0.8,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.background2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    padding: 16,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  heroLeft: {
    flex: 1,
    paddingRight: 12,
  },
  bigNumber: {
    ...getTypographyStyle('largeTitle'),
    fontSize: 42,
    lineHeight: 42,
    color: colors.statsTextDeep,
    letterSpacing: -1.2,
  },
  bigLabel: {
    ...getTypographyStyle('l1List'),
    marginTop: 4,
    color: colors.label,
    letterSpacing: 0.8,
  },
  statPillGreen: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillGreenText: {
    ...getTypographyStyle('c2Caption'),
    fontSize: 11,
    color: colors.labelsuccess,
  },
  statPillRed: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: colors.dangerBgAlt,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillRedText: {
    ...getTypographyStyle('c2Caption'),
    fontSize: 11,
    color: colors.danger,
  },
  donutArea: {
    width: 132,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background2,
  },
  donutLeftHalf: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 60,
    height: 120,
    overflow: 'hidden',
  },
  donutRightHalf: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 60,
    height: 120,
    overflow: 'hidden',
  },
  donutLeftArc: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: colors.labelsuccess,
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '-20deg' }],
  },
  donutRightArc: {
    position: 'absolute',
    left: -60,
    top: 0,
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 10,
    borderColor: colors.danger,
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '22deg' }],
  },
  donutCenter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: {
    ...getTypographyStyle('t3Title', 'bold'),
    fontSize: 18,
    color: colors.textPrimary,
    letterSpacing: -0.4,
  },
  donutCaption: {
    ...getTypographyStyle('c2Caption'),
    fontSize: 11,
    marginTop: 1,
    color: colors.labelsuccess,
  },
  sectionHeader: {
    ...getTypographyStyle('t3Title', 'bold'),
    fontSize: 16,
    color: colors.textPrimary,
    marginBottom: 10,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: colors.background2,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 1,
  },
  chartHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  cardTitle: {
    ...getTypographyStyle('headline'),
    color: colors.statsTextPrimary,
  },
  trendBadge: {
    backgroundColor: colors.successBg,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trendBadgeText: {
    ...getTypographyStyle('c2Caption'),
    fontSize: 11,
    color: colors.labelsuccess,
  },
  barChartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 130,
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barStack: {
    width: '100%',
    height: 106,
    justifyContent: 'flex-end',
    gap: 2,
  },
  barSegment: {
    width: '100%',
    borderRadius: 6,
  },
  barGenuine: {
    backgroundColor: colors.chartGenuineLight,
  },
  barSuspected: {
    backgroundColor: colors.chartSuspectedLight,
  },
  barLabel: {
    ...getTypographyStyle('c3Caption', 'regular'),
    fontSize: 11,
    marginTop: 6,
    color: colors.label,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 2,
  },
  legendText: {
    ...getTypographyStyle('c2Caption'),
    fontSize: 11,
    color: colors.textMuted,
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  docLabel: {
    ...getTypographyStyle('c1Caption'),
    width: 160,
    color: colors.statsTextPrimary,
  },
  progressWrap: {
    flex: 1,
    paddingRight: 10,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: colors.disabledBorder,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  docCount: {
    ...getTypographyStyle('c1Caption'),
    width: 20,
    textAlign: 'right',
    color: colors.statsTextPrimary,
  },
  emptyState: {
    ...getTypographyStyle('c1Caption'),
    color: colors.label,
    textAlign: 'center',
    paddingVertical: 10,
  },
  skeletonInfoCard: {
    minHeight: 62,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    backgroundColor: colors.background2,
    marginBottom: 16,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  skeletonInfoTextLabel: {
    ...getTypographyStyle('c1Caption'),
    flex: 1,
    color: colors.statsTextMuted,
  },
  skeletonCardLarge: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    backgroundColor: colors.background2,
    marginBottom: 16,
    minHeight: 168,
    padding: 16,
  },
  skeletonTitlePill: {
    width: 108,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.skeletonBase,
    marginBottom: 14,
  },
  skeletonLineMd: {
    width: 110,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.skeletonLight,
    marginBottom: 14,
  },
  skeletonLineLg: {
    width: 100,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.skeletonBase,
    marginBottom: 8,
  },
  skeletonDonut: {
    position: 'absolute',
    right: 20,
    top: 22,
    width: 126,
    height: 126,
    borderRadius: 63,
    borderWidth: 12,
    borderColor: colors.skeletonBase,
    backgroundColor: colors.statsBackground,
  },
  skeletonCardChart: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    backgroundColor: colors.background2,
    marginBottom: 16,
    padding: 16,
  },
  skeletonChartHead: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  skeletonLineSm: {
    width: 120,
    height: 7,
    borderRadius: 999,
    backgroundColor: colors.skeletonBase,
  },
  skeletonHeaderPill: {
    width: 126,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.skeletonBase,
  },
  skeletonBarsWrap: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  skeletonBarColumn: {
    width: 44,
    alignItems: 'center',
  },
  skeletonBar: {
    width: 44,
    height: 58,
    borderRadius: 8,
    backgroundColor: colors.skeletonLight,
  },
  skeletonTick: {
    width: 18,
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.skeletonBase,
    marginTop: 8,
  },
  skeletonLegendRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  skeletonLegendItem: {
    width: 74,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.skeletonLight,
  },
  skeletonCardList: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    backgroundColor: colors.background2,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  skeletonListRow: {
    minHeight: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  skeletonListLine: {
    width: '72%',
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.skeletonLight,
  },
  skeletonListDot: {
    width: 12,
    height: 8,
    borderRadius: 999,
    backgroundColor: colors.skeletonLight,
  },
});