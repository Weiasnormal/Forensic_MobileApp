import CasesScreen from '@/app/User/user_cases';
import StatsScreen from '@/app/User/user_stats';
import { useUser } from '@/store/userStore';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useState } from 'react';
import { Image, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import CaseCard from '../../_components/caseCards';
import PendingCard from '../../_components/pendingCards';
import { useAnalysisFlowStore } from '../../store/analysisFlowStore';
import Navbar, { type TabKey } from '../_navbar/nav_bar';
import ProfileScreen from './user_profile';
const signattureIcon = require('../../../assets/expo.icon/Assets/signature_icon.webp');
const pendingCases = [
  {
    id: '0429-2026-001',
    name: 'Juan dela Cruz - Bank Cheque',
    status: 'result-ready' as const,
  },
  {
    id: '0429-2026-001',
    name: 'Juan dela Cruz - Bank Cheque',
    status: 'processing' as const,
  },
  {
    id: '0429-2026-001',
    name: 'Juan dela Cruz - Bank Cheque',
    status: 'draft' as const,
  },
];

const recentCases = [
  {
    id: '0429-2026-001',
    type: 'Signature • Urgent',
    name: 'Juan dela Cruz - Bank Cheque',
    status: 'suspect' as const,
  },
  {
    id: '0429-2026-002',
    type: 'Signature',
    name: 'Juan dela Cruz - Property Contract',
    status: 'genuine' as const,
  },
  {
    id: '0429-2026-003',
    type: 'Handwriting • Urgent',
    name: 'Juan dela Cruz - Bank Cheque',
    status: 'processing' as const,
  },
];

export default function UserDashboardScreen() {
  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const router = useRouter();
  const nav = router as any;
  const initializeFlow = useAnalysisFlowStore((state) => state.initializeFlow);
  const { user, load } = useUser();

  React.useEffect(() => {
    load();
  }, [load]);

  const handleNewAnalysisPress = () => {
    initializeFlow('signature');
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
          <HomeTab onStartAnalysis={handleNewAnalysisPress} />
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

function HomeTab({ onStartAnalysis }: { onStartAnalysis: () => void }) {
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


      <View style={styles.pendingList}>
        {pendingCases.map((item) => (
          <PendingCard key={`${item.status}-${item.id}`} id={item.id} name={item.name} status={item.status} />
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent Cases</Text>
        <Text style={styles.sectionLink}>View all</Text>
      </View>

      <View style={styles.recentList}>
        {recentCases.map((item) => (
          <CaseCard
            key={item.id}
            id={item.id}
            type={item.type}
            name={item.name}
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