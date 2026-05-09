import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const monthlyBars = [
  { month: 'Nov', genuine: 36, suspected: 18 },
  { month: 'Dec', genuine: 56, suspected: 12 },
  { month: 'Jan', genuine: 52, suspected: 11 },
  { month: 'Feb', genuine: 55, suspected: 13 },
  { month: 'Mar', genuine: 71, suspected: 16 },
  { month: 'Apr', genuine: 82, suspected: 24 },
];

const documentTypes = [
  { label: 'Bank Cheque', count: 18, width: 0.58 },
  { label: 'Property Deed', count: 13, width: 0.42 },
  { label: 'Affidavit', count: 8, width: 0.31 },
  { label: 'Will', count: 5, width: 0.22 },
  { label: 'Other', count: 3, width: 0.15 },
];

export default function UserStatsScreen() {
  return (
    <SafeAreaView style={styles.screen} edges={['left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={styles.title}>Statistics</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        <View style={styles.heroCard}>
          <View style={styles.heroLeft}>
            <Text style={styles.bigNumber}>48</Text>
            <Text style={styles.bigLabel}>TOTAL CASES</Text>

            <View style={styles.statPillGreen}>
              <Text style={styles.statPillGreenText}>32 genuine</Text>
            </View>
            <View style={styles.statPillRed}>
              <Text style={styles.statPillRedText}>16 suspected</Text>
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
                <Text style={styles.donutPercent}>67%</Text>
                <Text style={styles.donutCaption}>Genuine</Text>
              </View>
            </View>
          </View>
        </View>

        <Text style={styles.sectionHeader}>Monthly Trend</Text>

        <View style={styles.chartCard}>
          <View style={styles.chartHeaderRow}>
            <Text style={styles.cardTitle}>Cases over time</Text>
            <View style={styles.trendBadge}>
              <Text style={styles.trendBadgeText}>18% vs last month</Text>
            </View>
          </View>

          <View style={styles.barChartWrap}>
            {monthlyBars.map((bar) => (
              <View key={bar.month} style={styles.barColumn}>
                <View style={styles.barStack}>
                  <View style={[styles.barSegment, styles.barGenuine, { height: `${bar.genuine}%` }]} />
                  <View style={[styles.barSegment, styles.barSuspected, { height: `${bar.suspected}%` }]} />
                </View>
                <Text style={styles.barLabel}>{bar.month}</Text>
              </View>
            ))}
          </View>

          <View style={styles.legendRow}>
            <LegendItem color="#16A34A" label="Genuine" />
            <LegendItem color="#E24B4A" label="Suspected" />
          </View>
        </View>

        <Text style={styles.sectionHeader}>Document Types</Text>

        <View style={styles.chartCard}>
          {documentTypes.map((item) => (
            <View key={item.label} style={styles.docRow}>
              <Text style={styles.docLabel}>{item.label}</Text>
              <View style={styles.progressWrap}>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${item.width * 100}%` }]} />
                </View>
              </View>
              <Text style={styles.docCount}>{item.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F5F8FC',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 120,
  },
  title: {
    color: '#1E293B',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE6F2',
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
    color: '#111827',
    fontSize: 42,
    lineHeight: 42,
    fontWeight: '900',
    letterSpacing: -1.2,
  },
  bigLabel: {
    marginTop: 4,
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  statPillGreen: {
    alignSelf: 'flex-start',
    marginTop: 12,
    backgroundColor: '#ECFDF3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillGreenText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  statPillRed: {
    alignSelf: 'flex-start',
    marginTop: 8,
    backgroundColor: '#FFF1F1',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statPillRedText: {
    color: '#E24B4A',
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: '#FFFFFF',
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
    borderColor: '#16A34A',
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
    borderColor: '#E24B4A',
    borderLeftColor: 'transparent',
    borderBottomColor: 'transparent',
    transform: [{ rotate: '22deg' }],
  },
  donutCenter: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5EDF7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPercent: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
    letterSpacing: -0.4,
  },
  donutCaption: {
    marginTop: 1,
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
  },
  sectionHeader: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 10,
    marginTop: 2,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DDE6F2',
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
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '800',
  },
  trendBadge: {
    backgroundColor: '#ECFDF3',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  trendBadgeText: {
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '800',
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
    backgroundColor: '#BEE6C8',
  },
  barSuspected: {
    backgroundColor: '#F5C0C0',
  },
  barLabel: {
    marginTop: 6,
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
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
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  docLabel: {
    width: 112,
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  progressWrap: {
    flex: 1,
    paddingRight: 10,
  },
  progressTrack: {
    height: 5,
    borderRadius: 999,
    backgroundColor: '#E2E8F0',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: '#1D63D6',
  },
  docCount: {
    width: 20,
    textAlign: 'right',
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
});
