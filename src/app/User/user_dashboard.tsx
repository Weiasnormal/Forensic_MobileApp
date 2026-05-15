import CasesScreen from '@/app/User/user_cases';
import StatsScreen from '@/app/User/user_stats';
import { useUser } from '@/store/userStore';
import { Image as ExpoImage } from 'expo-image';
import * as NavigationBar from 'expo-navigation-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CaseCard from '../../_components/caseCards';
import { formatAnalysisTypeLabel, type SavedCase, useCaseStore } from '../../store/caseStore';
import Navbar, { type TabKey } from '../_navbar/nav_bar';
import ProfileScreen from './user_profile';
const signattureIcon = require('../../../assets/expo.icon/Assets/signature_icon.webp');

const TAB_KEYS: TabKey[] = ['home', 'cases', 'stats', 'profile'];

function resolveTabValue(value: string | string[] | undefined): TabKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && TAB_KEYS.includes(candidate as TabKey)) {
    return candidate as TabKey;
  }

  return 'home';
}

export default function UserDashboardScreen() {
  const params = useLocalSearchParams<{ tab?: string | string[] }>();
  const [activeTab, setActiveTab] = useState<TabKey>(resolveTabValue(params.tab));
  const router = useRouter();
  const nav = router as any;
  const cases = useCaseStore((state) => state.cases);
  const startNewSignatureDraft = useCaseStore((state) => state.startNewSignatureDraft);
  const { user, load } = useUser();

  React.useEffect(() => {
    setActiveTab(resolveTabValue(params.tab));
  }, [params.tab]);

  React.useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    NavigationBar.setBackgroundColorAsync('#FFFFFF').catch(() => {});
    NavigationBar.setButtonStyleAsync('dark').catch(() => {});
  }, [activeTab]);

  const handleNewAnalysisPress = () => {
    startNewSignatureDraft();
    nav.push('/analysis/signature/step1');
  };

  return (
    <SafeAreaView style={styles.screen}>
      <StatusBar style="dark" backgroundColor="#ffffff" />

      {activeTab === 'home' ? (
        <View style={styles.homeHeader}>
          <View style={styles.homeHeaderTop}>
            <View>
              <Text style={styles.homeOrgText}>{user?.organization || 'PNP Crime Laboratory'}</Text>
              <Text style={styles.homeGreeting}>Hello, Analyst {user?.lastName}</Text>
            </View>
            <View style={styles.homeAvatarCircle}>
              {user && user.avatarUri ? (
                <Image source={{ uri: user.avatarUri }} style={{ width: 44, height: 44, borderRadius: 22 }} />
              ) : (
                <Text style={styles.homeAvatarText}>{getInitials(user?.firstName || '', user?.lastName || '')}</Text>
              )}
            </View>
          </View>
        </View>
      ) : null}

      {activeTab === 'home' ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollArea, styles.homeScrollArea]}
          showsVerticalScrollIndicator={false}
        >
          <HomeTab onStartAnalysis={handleNewAnalysisPress} cases={cases} onViewAllPress={() => setActiveTab('cases')} />
        </ScrollView>
      ) : activeTab === 'cases' ? (
        <CasesScreen />
      ) : activeTab === 'stats' ? (
        <StatsScreen />
      ) : (
        <ProfileScreen />
      )}

      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onNewPress={handleNewAnalysisPress}
      />
    </SafeAreaView>
  );
}

function HomeTab({ onStartAnalysis, cases, onViewAllPress }: { onStartAnalysis: () => void; cases: SavedCase[]; onViewAllPress: () => void }) {
  const latestCases = [...cases]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 5);

  return (
    <>
      <TouchableOpacity style={styles.analysisBanner} activeOpacity={0.9} onPress={onStartAnalysis}>
        <View>
          <Text style={styles.analysisBannerLabel}>START ANALYSIS</Text>
          <Text style={styles.analysisBannerTitle}>Signature</Text>
        </View>
        <View style={styles.analysisBannerIcon}>
          <ExpoImage source={signattureIcon} style={styles.icon} resizeMode="contain" />
        </View>
      </TouchableOpacity>

      <View style={styles.sectionDivider} />

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Cases</Text>
        <TouchableOpacity onPress={onViewAllPress}>
          <Text style={styles.sectionLink}>View all</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.recentList}>
        {latestCases.map((item) => (
          <CaseCard
            key={item.caseId}
            id={item.caseId}
            createdAt={item.createdAt}
            type={`${formatAnalysisTypeLabel(item.analysisType)} • ${item.priority}`}
            name={`${item.subjectName} · ${item.documentType}`}
            status={item.status}
          />
        ))}
      </View>
    </>
  );
}

function getInitials(first = '', last = '') {
  return ((first[0] || '') + (last[0] || '')).toUpperCase();
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  homeHeader: {
    backgroundColor: '#ffffff',
    paddingTop: Platform.OS === 'android' ? 18 : 20,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  homeHeaderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  homeGreeting: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  homeAvatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2D72D1',
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
    color: '#64748B',
    fontSize: 13,
    fontWeight: '700',
  },
  scrollArea: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 18,
    backgroundColor: '#F8FAFC',
  },
  scrollView: {
    flex: 1,
  },
  homeScrollArea: {
    paddingTop: 10,
  },
  analysisBanner: {
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 14,
    backgroundColor: '#2D72D1',
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#2D72D1',
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  analysisBannerLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.7,
    marginBottom: 2,
  },
  analysisBannerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  analysisBannerIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    marginBottom: 14,
  },
  pendingList: {
    marginBottom: 10,
  },
  recentList: {
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    marginHorizontal: 16,
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
  icon: {
    width: 24,
    height: 24,
  },
});