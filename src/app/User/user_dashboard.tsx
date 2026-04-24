import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    Platform,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';

  import NewAnalysisModal from '../../_components/modals/new_analysis';
import Navbar, { type TabKey } from '../_navbar/nav_bar';
import CasesScreen from './user_cases';
import ProfileScreen from './user_profile';
import StatsScreen from './user_stats';
type TintKey = 'red' | 'green' | 'amber';

interface CaseItem {
  title: string;
  subtitle: string;
  status: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint: TintKey;
}

const caseRows: CaseItem[] = [
  {
    title: 'Contract_Draft_v2.pdf',
    subtitle: 'Juan Dela Cruz · 18% match · 2h ago',
    status: 'FORGED',
    icon: 'alert-circle',
    tint: 'red',
  },
  {
    title: 'Invoice_0823.pdf',
    subtitle: 'Maria Reyes · 94% match · 1d ago',
    status: 'GENUINE',
    icon: 'checkmark-circle',
    tint: 'green',
  },
  {
    title: 'Memo_Final.pdf',
    subtitle: 'Alonzo Lim · 61% match · 2d ago',
    status: 'REVIEW',
    icon: 'help-circle',
    tint: 'amber',
  },
];

const dashboardRecentCases = [
  {
    id: 'CASE-2025-0048',
    type: 'SIG',
    subtitle: 'Juan dela Cruz · Signature · 94.3%',
    status: 'FORGED',
    tint: 'red' as const,
    icon: 'location-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'CASE-2025-0047',
    type: 'HW',
    subtitle: 'Maria Santos · Statement · 97.1%',
    status: 'GENUINE',
    tint: 'green' as const,
    icon: 'brush-outline' as keyof typeof Ionicons.glyphMap,
  },
  {
    id: 'CASE-2025-0046',
    type: 'DOC',
    subtitle: 'Pedro Reyes · Will · 3 anomalies',
    status: 'SUSPECT',
    tint: 'amber' as const,
    icon: 'document-text-outline' as keyof typeof Ionicons.glyphMap,
  },
];

const statsBars = [
  { label: 'Mon', genuine: 44, forged: 34 },
  { label: 'Tue', genuine: 52, forged: 28 },
  { label: 'Wed', genuine: 38, forged: 41 },
  { label: 'Thu', genuine: 61, forged: 22 },
  { label: 'Fri', genuine: 68, forged: 19 },
  { label: 'Sat', genuine: 49, forged: 29 },
  { label: 'Sun', genuine: 57, forged: 24 },
];

export default function UserDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [isNewAnalysisVisible, setIsNewAnalysisVisible] = useState(false);

  return (
    <SafeAreaView style={styles.screen}>
      {activeTab === 'home' ? (
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderTop}>
            <View>
              <Text style={styles.homeGreeting}>Good morning,</Text>
              <Text style={styles.homeAnalystName}>Analyst Cruz</Text>
            </View>
            <View style={styles.homeAvatarCircle}>
              <Text style={styles.homeAvatarText}>MC</Text>
            </View>
          </View>

          <View style={styles.homeOrgChip}>
            <View style={styles.homeOrgDot} />
            <Text style={styles.homeOrgText}>PNP Crime Laboratory</Text>
          </View>
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {activeTab === 'home' && <HomeTab />}
        {activeTab === 'cases' && <CasesScreen />}
        {activeTab === 'stats' && <StatsScreen />}
        {activeTab === 'profile' && <ProfileScreen />}
      </ScrollView>

      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewPress={() => setIsNewAnalysisVisible(true)}
      />

      <NewAnalysisModal
        visible={isNewAnalysisVisible}
        onClose={() => setIsNewAnalysisVisible(false)}
      />
    </SafeAreaView>
  );
}

function HomeTab() {
  return (
    <>
      <View style={styles.quickActionRow}>
        <TouchableOpacity style={[styles.quickActionCard, styles.quickActionBlue]} activeOpacity={0.9}>
          <View style={styles.quickActionIconWrap}>
            <Ionicons name="brush-outline" size={18} color="#DCEBFF" />
          </View>
          <Text style={styles.quickActionTitle}>Signature</Text>
          <Text style={styles.quickActionSubtitle}>4 refs + 1 suspect</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.quickActionCard, styles.quickActionGreen]} activeOpacity={0.9}>
          <View style={styles.quickActionIconWrap}>
            <Ionicons name="create-outline" size={18} color="#D5F6DE" />
          </View>
          <Text style={styles.quickActionTitle}>Handwriting</Text>
          <Text style={styles.quickActionSubtitle}>CRAFT · heatmap</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.docAnalysisCard} activeOpacity={0.88}>
        <View style={styles.docAnalysisIconWrap}>
          <Ionicons name="document-text-outline" size={18} color="#E9A118" />
        </View>

        <View style={styles.docAnalysisTextBlock}>
          <Text style={styles.docAnalysisTitle}>Document Analysis</Text>
          <Text style={styles.docAnalysisSubtitle}>Full doc · word-level anomaly detection</Text>
        </View>

        <Ionicons name="chevron-forward" size={18} color="#A3B1C5" />
      </TouchableOpacity>

      <View style={styles.dashboardStatRow}>
        <View style={styles.dashboardStatCard}>
          <Text style={styles.dashboardStatValue}>48</Text>
          <Text style={styles.dashboardStatLabel}>Total cases</Text>
          <Text style={styles.dashboardStatDelta}>↑ 3 this week</Text>
        </View>
        <View style={styles.dashboardStatCard}>
          <Text style={styles.dashboardStatValue}>17</Text>
          <Text style={styles.dashboardStatLabel}>Forgeries</Text>
          <Text style={[styles.dashboardStatDelta, styles.dashboardStatDeltaAmber]}>35.4%</Text>
        </View>
        <View style={styles.dashboardStatCard}>
          <Text style={styles.dashboardStatValue}>96%</Text>
          <Text style={styles.dashboardStatLabel}>Accuracy</Text>
          <Text style={styles.dashboardStatDelta}>↑ 1.2%</Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent cases</Text>
        <Text style={styles.sectionLink}>View all</Text>
      </View>

      <View style={styles.listCardAlt}>
        {dashboardRecentCases.map((item, index) => (
          <TouchableOpacity key={item.id} style={[styles.caseRowAlt, index === dashboardRecentCases.length - 1 && styles.caseRowAltLast]} activeOpacity={0.82}>
            <View style={[styles.caseMarker, item.tint === 'red' && styles.caseMarkerRed, item.tint === 'green' && styles.caseMarkerGreen, item.tint === 'amber' && styles.caseMarkerAmber]}>
              <Ionicons
                name={item.icon}
                size={16}
                color={item.tint === 'green' ? '#16A34A' : item.tint === 'amber' ? '#D97706' : '#3B82F6'}
              />
            </View>

            <View style={styles.caseTextBlockAlt}>
              <View style={styles.caseTitleRowAlt}>
                <Text style={styles.caseIdText}>{item.id}</Text>
                <View style={styles.caseTypeChip}>
                  <Text style={styles.caseTypeChipText}>{item.type}</Text>
                </View>
              </View>
              <Text style={styles.caseSubtitleAlt}>{item.subtitle}</Text>
            </View>

            <View style={[
              styles.statusPillAlt,
              item.tint === 'red' && styles.statusPillRed,
              item.tint === 'green' && styles.statusPillGreen,
              item.tint === 'amber' && styles.statusPillAmber,
            ]}>
              <Text style={[
                styles.statusPillText,
                item.tint === 'red' && styles.statusPillTextRed,
                item.tint === 'green' && styles.statusPillTextGreen,
                item.tint === 'amber' && styles.statusPillTextAmber,
              ]}>
                {item.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </>
  );
}

function CasesTab() {
  return (
    <>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Cases</Text>
        <Text style={styles.sectionLink}>All records</Text>
      </View>

      <View style={styles.filterRow}>
        <FilterChip label="All" active />
        <FilterChip label="Forged" />
        <FilterChip label="Review" />
        <FilterChip label="Genuine" />
      </View>

      <ListCard />
    </>
  );
}

function StatsTab() {
  return (
    <>
      <View style={styles.statsHeroGrid}>
        <MetricCard value="128" label="Total scans" delta="+12% this week" />
        <MetricCard value="91%" label="Detection accuracy" delta="Stable trend" />
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Weekly verdict split</Text>
        <View style={styles.barChart}>
          {statsBars.map((bar) => (
            <View key={bar.label} style={styles.barWrap}>
              <View style={styles.barStack}>
                <View style={[styles.bar, styles.barForged, { height: `${bar.forged}%` }]} />
                <View style={[styles.bar, styles.barGenuine, { height: `${bar.genuine}%` }]} />
              </View>
              <Text style={styles.barLabel}>{bar.label}</Text>
            </View>
          ))}
        </View>

        <View style={styles.legendRow}>
          <LegendItem color="#16A34A" label="Genuine" />
          <LegendItem color="#E24B4A" label="Forged" />
        </View>
      </View>

      <View style={styles.chartCard}>
        <Text style={styles.cardTitle}>Recent accuracy</Text>
        <View style={styles.ringRow}>
          <View style={styles.ringOuter}>
            <View style={styles.ringInner}>
              <Text style={styles.ringValue}>94%</Text>
            </View>
          </View>
          <View style={styles.ringTextBlock}>
            <Text style={styles.ringTitle}>Strong confidence window</Text>
            <Text style={styles.ringSubtitle}>
              Your average result confidence remains high across the last 30 scans.
            </Text>
          </View>
        </View>
      </View>
    </>
  );
}

function ProfileTab() {
  return (
    <>
      <View style={styles.profileHero}>
        <View style={styles.avatarLarge}>
          <Text style={styles.avatarLargeText}>JD</Text>
        </View>
        <Text style={styles.profileName}>Juan Dela Cruz</Text>
        <Text style={styles.profileEmail}>juan.delacruz@pnp.gov.ph</Text>
        <View style={styles.roleChip}>
          <Ionicons name="shield-checkmark" size={12} color="#EAF3FF" />
          <Text style={styles.roleChipText}>Forensic Analyst</Text>
        </View>
      </View>

      <View style={styles.settingsCard}>
        <SettingRow icon="person-outline" iconColor="#185FA5" iconBg={styles.settingIconBlue} label="Edit profile" />
        <SettingRow icon="document-text-outline" iconColor="#16A34A" iconBg={styles.settingIconGreen} label="Scan history" />
        <SettingRow icon="notifications-outline" iconColor="#D97706" iconBg={styles.settingIconAmber} label="Notifications" />
        <SettingRow
          icon="log-out-outline"
          iconColor="#E24B4A"
          iconBg={styles.settingIconRed}
          label="Sign out"
          last
        />
      </View>
    </>
  );
}

function SettingRow({
  icon,
  iconColor,
  iconBg,
  label,
  last,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
  iconBg: object;
  label: string;
  last?: boolean;
}) {
  return (
    <TouchableOpacity style={[styles.settingRow, last && styles.settingRowLast]} activeOpacity={0.76}>
      <View style={[styles.settingIcon, iconBg]}>
        <Ionicons name={icon} size={18} color={iconColor} />
      </View>
      <Text style={styles.settingLabel}>{label}</Text>
      <Ionicons name="chevron-forward" size={18} color="#CBD5E1" />
    </TouchableOpacity>
  );
}

function MetricCard({ value, label, delta }: { value: string; label: string; delta: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricDelta}>{delta}</Text>
    </View>
  );
}

function FilterChip({ label, active = false }: { label: string; active?: boolean }) {
  return (
    <TouchableOpacity style={[styles.filterChip, active && styles.filterChipActive]} activeOpacity={0.85}>
      <Text style={[styles.filterChipText, active && styles.filterChipTextActive]}>{label}</Text>
    </TouchableOpacity>
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

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionLink}>{link}</Text>
    </View>
  );
}

function ListCard() {
  return (
    <View style={styles.listCard}>
      {caseRows.map((item, index) => (
        <TouchableOpacity
          key={item.title}
          style={[styles.caseRow, index === caseRows.length - 1 && styles.caseRowLast]}
          activeOpacity={0.78}
        >
          <View
            style={[
              styles.caseIcon,
              item.tint === 'red' && styles.caseIconRed,
              item.tint === 'green' && styles.caseIconGreen,
              item.tint === 'amber' && styles.caseIconAmber,
            ]}
          >
            <Ionicons
              name={item.icon}
              size={18}
              color={item.tint === 'green' ? '#16A34A' : item.tint === 'amber' ? '#D97706' : '#E24B4A'}
            />
          </View>

          <View style={styles.caseTextBlock}>
            <Text style={styles.caseTitle}>{item.title}</Text>
            <Text style={styles.caseSubtitle}>{item.subtitle}</Text>
          </View>

          <View
            style={[
              styles.statusPill,
              item.tint === 'red' && styles.statusPillRed,
              item.tint === 'green' && styles.statusPillGreen,
              item.tint === 'amber' && styles.statusPillAmber,
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                item.tint === 'red' && styles.statusPillTextRed,
                item.tint === 'green' && styles.statusPillTextGreen,
                item.tint === 'amber' && styles.statusPillTextAmber,
              ]}
            >
              {item.status}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#0C447C',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 22,
    paddingBottom: 20,
  },
  homeHeader: {
    backgroundColor: '#164C86',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeGreeting: {
    color: 'rgba(223,236,255,0.75)',
    fontSize: 12,
    fontWeight: '600',
  },
  homeAnalystName: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '900',
    marginTop: 2,
    letterSpacing: -0.8,
  },
  homeAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  homeAvatarText: {
    color: '#E7F2FF',
    fontSize: 18,
    fontWeight: '800',
  },
  homeOrgChip: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(93,153,224,0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  homeOrgDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ADE80',
  },
  homeOrgText: {
    color: '#CFE6FF',
    fontSize: 12,
    fontWeight: '700',
  },
  portalTag: {
    color: 'rgba(255,255,255,0.45)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pageTitle: {
    color: '#FFFFFF',
    fontSize: 25,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerSub: {
    marginTop: 4,
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    fontWeight: '500',
  },
  scrollArea: {
    paddingHorizontal: 10,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: '#ffffff',
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 10,
  },
  quickActionCard: {
    flex: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 108,
    justifyContent: 'space-between',
  },
  quickActionBlue: {
    backgroundColor: '#2668AE',
  },
  quickActionGreen: {
    backgroundColor: '#1BA74B',
  },
  quickActionIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionTitle: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  quickActionSubtitle: {
    color: 'rgba(227,241,255,0.78)',
    fontSize: 12,
    fontWeight: '600',
  },
  docAnalysisCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D7DEE7',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  docAnalysisIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F5EED8',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  docAnalysisTextBlock: {
    flex: 1,
  },
  docAnalysisTitle: {
    color: '#1E293B',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  docAnalysisSubtitle: {
    color: '#8594A8',
    fontSize: 11,
    fontWeight: '600',
  },
  dashboardStatRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  dashboardStatCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#CDD6E0',
    padding: 10,
  },
  dashboardStatValue: {
    color: '#111827',
    fontSize: 18,
    fontWeight: '900',
  },
  dashboardStatLabel: {
    marginTop: 2,
    color: '#93A0B3',
    fontSize: 11,
    fontWeight: '700',
  },
  dashboardStatDelta: {
    marginTop: 4,
    color: '#16A34A',
    fontSize: 11,
    fontWeight: '700',
  },
  dashboardStatDeltaAmber: {
    color: '#D97706',
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    padding: 16,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  premiumTag: {
    color: '#185FA5',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  premiumSub: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '500',
  },
  statusStack: {
    alignItems: 'flex-end',
  },
  activePill: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  activePillText: {
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '800',
  },
  renewText: {
    marginTop: 6,
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
  },
  actionBanner: {
    backgroundColor: '#185FA5',
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    shadowColor: '#185FA5',
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionTextBlock: {
    flex: 1,
  },
  actionTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 2,
  },
  actionSubtitle: {
    color: 'rgba(255,255,255,0.68)',
    fontSize: 12,
    fontWeight: '500',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionLink: {
    fontSize: 12,
    color: '#185FA5',
    fontWeight: '700',
  },
  listCardAlt: {
    gap: 8,
  },
  caseRowAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4DBE5',
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  caseRowAltLast: {},
  caseMarker: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    backgroundColor: '#EEF2F8',
    borderColor: '#BFD0E2',
  },
  caseMarkerRed: {
    borderColor: '#BFD0E2',
  },
  caseMarkerGreen: {
    backgroundColor: '#EAF8EE',
    borderColor: '#B9EBC8',
  },
  caseMarkerAmber: {
    backgroundColor: '#FFF6E2',
    borderColor: '#F2D690',
  },
  caseTextBlockAlt: {
    flex: 1,
    minWidth: 0,
  },
  caseTitleRowAlt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  caseIdText: {
    color: '#1F2937',
    fontSize: 13,
    fontWeight: '900',
  },
  caseTypeChip: {
    backgroundColor: '#DCE8F7',
    borderWidth: 1,
    borderColor: '#BFD1EA',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 1,
  },
  caseTypeChipText: {
    color: '#4372B5',
    fontSize: 9,
    fontWeight: '800',
  },
  caseSubtitleAlt: {
    color: '#8A98AB',
    fontSize: 11,
    fontWeight: '600',
  },
  statusPillAlt: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 9,
    borderWidth: 1,
    marginLeft: 8,
  },
  filterRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    backgroundColor: '#FFFFFF',
  },
  filterChipActive: {
    backgroundColor: '#185FA5',
    borderColor: '#185FA5',
  },
  filterChipText: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
  },
  listCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    overflow: 'hidden',
    marginBottom: 16,
  },
  caseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  caseRowLast: {
    borderBottomWidth: 0,
  },
  caseIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    borderWidth: 1,
  },
  caseIconRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  caseIconGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  caseIconAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  caseTextBlock: {
    flex: 1,
    minWidth: 0,
  },
  caseTitle: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 2,
  },
  caseSubtitle: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
  statusPillRed: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  statusPillGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  statusPillAmber: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  statusPillText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusPillTextRed: {
    color: '#E24B4A',
  },
  statusPillTextGreen: {
    color: '#16A34A',
  },
  statusPillTextAmber: {
    color: '#D97706',
  },
  statsHeroGrid: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  metricCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    padding: 16,
  },
  metricValue: {
    color: '#0F172A',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: -0.8,
  },
  metricLabel: {
    marginTop: 3,
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  metricDelta: {
    marginTop: 6,
    color: '#16A34A',
    fontSize: 10,
    fontWeight: '700',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 14,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 7,
    height: 126,
  },
  barWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barStack: {
    width: '100%',
    height: 100,
    justifyContent: 'flex-end',
    gap: 3,
  },
  bar: {
    width: '100%',
    borderRadius: 8,
  },
  barForged: {
    backgroundColor: '#E24B4A',
  },
  barGenuine: {
    backgroundColor: '#16A34A',
  },
  barLabel: {
    marginTop: 6,
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '600',
  },
  legendRow: {
    flexDirection: 'row',
    gap: 14,
    marginTop: 10,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  ringOuter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 8,
    borderColor: '#185FA5',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  ringInner: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D9E3EF',
  },
  ringValue: {
    color: '#0F172A',
    fontSize: 20,
    fontWeight: '900',
  },
  ringTextBlock: {
    flex: 1,
  },
  ringTitle: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '800',
    marginBottom: 4,
  },
  ringSubtitle: {
    color: '#64748B',
    fontSize: 11,
    lineHeight: 17,
    fontWeight: '500',
  },
  profileHero: {
    backgroundColor: '#0C447C',
    borderRadius: 20,
    paddingVertical: 22,
    paddingHorizontal: 18,
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarLarge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  avatarLargeText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
  },
  profileName: {
    color: '#FFFFFF',
    fontSize: 19,
    fontWeight: '900',
    marginBottom: 3,
  },
  profileEmail: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 12,
    marginBottom: 10,
  },
  roleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  roleChipText: {
    color: '#EAF3FF',
    fontSize: 11,
    fontWeight: '800',
  },
  settingsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#D9E3EF',
    overflow: 'hidden',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    gap: 12,
  },
  settingRowLast: {
    borderBottomWidth: 0,
  },
  settingIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingIconBlue: {
    backgroundColor: '#EAF3FF',
  },
  settingIconGreen: {
    backgroundColor: '#F0FDF4',
  },
  settingIconAmber: {
    backgroundColor: '#FFFBEB',
  },
  settingIconRed: {
    backgroundColor: '#FEF2F2',
  },
  settingLabel: {
    flex: 1,
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
});