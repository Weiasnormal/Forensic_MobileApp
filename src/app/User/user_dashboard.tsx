import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function UserDashboardScreen() {
  const router = useRouter();

  const goTo = (screenId: string) => {
    // Navigate to the next screen. Assuming id is standard route for now.
    console.log(`Navigate to ${screenId}`);
    // example: router.push(`/${screenId}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <Text style={styles.portalTag}>Investigator Portal</Text>
        <Text style={styles.pageTitle}>Verification Scanner</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        {/* Subscription / Status Card */}
        <View style={styles.subCard}>
          <View>
            <Text style={styles.premiumTag}>PREMIUM ACTIVE</Text>
            <Text style={styles.scansRemaining}>42 scans remaining this cycle</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeGreenText}>Active</Text>
            </View>
            <Text style={styles.renewsText}>Renews Jun 1</Text>
          </View>
        </View>

        {/* CTA Card */}
        <TouchableOpacity style={styles.ctaCard} onPress={() => goTo('s9')} activeOpacity={0.8}>
          <View style={styles.ctaIconContainer}>
            <Feather name="search" size={24} color="#3D8EF0" />
          </View>
          <View style={styles.ctaTextContainer}>
            <Text style={styles.ctaTitle}>Start New Document Scan</Text>
            <Text style={styles.ctaSubtitle}>Select subject → Capture → Analyze</Text>
          </View>
        </TouchableOpacity>

        {/* Recent Logs Section */}
        <Text style={styles.sectionTitle}>Recent Verification Logs</Text>
        
        <View style={styles.sectionCard}>
          {/* Forged Item */}
          <TouchableOpacity style={styles.listItem} onPress={() => goTo('s12')} activeOpacity={0.7}>
            <View style={[styles.avatar, styles.avatarRed]}>
              <Text style={styles.avatarRedText}>!</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Contract_Draft_v2.pdf</Text>
              <Text style={styles.listSub}>Juan Dela Cruz · 18% match · 2h ago</Text>
            </View>
            <View style={[styles.badge, styles.badgeRed]}>
              <Text style={styles.badgeRedText}>FORGED</Text>
            </View>
          </TouchableOpacity>

          {/* Genuine Item */}
          <View style={styles.listItem}>
            <View style={[styles.avatar, styles.avatarGreen]}>
              <Text style={styles.avatarGreenText}>✓</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Invoice_0823.pdf</Text>
              <Text style={styles.listSub}>Maria Reyes · 94% match · 1d ago</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeGreenText}>GENUINE</Text>
            </View>
          </View>

          {/* Review Item */}
          <View style={[styles.listItem, { borderBottomWidth: 0 }]}>
            <View style={[styles.avatar, styles.avatarOrange]}>
              <Text style={styles.avatarOrangeText}>?</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Memo_Final.pdf</Text>
              <Text style={styles.listSub}>Alonzo Lim · 61% match · 2d ago</Text>
            </View>
            <View style={[styles.badge, styles.badgeOrange]}>
              <Text style={styles.badgeOrangeText}>REVIEW</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Deep dark theme for premium feel
  },
  header: {
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 20,
    paddingBottom: 4,
    flexShrink: 0,
    backgroundColor: '#0A0A0A',
  },
  portalTag: {
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    fontSize: 10,
    color: '#888888',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  scrollArea: {
    paddingTop: 16,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  subCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#222222',
  },
  premiumTag: {
    fontSize: 11,
    color: '#3D8EF0', // Accent blue
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    letterSpacing: 0.5,
    fontWeight: '600',
    marginBottom: 6,
  },
  scansRemaining: {
    fontSize: 13,
    color: '#A0A0A0',
  },
  renewsText: {
    fontSize: 10,
    color: '#666666',
    marginTop: 6,
    fontWeight: '500',
  },
  ctaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: '#333333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  ctaIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(61, 142, 240, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(61, 142, 240, 0.3)',
  },
  ctaTextContainer: {
    flex: 1,
  },
  ctaTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontSize: 13,
    color: '#8A8A8A',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EEEEEE',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222222',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  listTextContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  listName: {
    fontSize: 15,
    fontWeight: '500',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  listSub: {
    fontSize: 12,
    color: '#888888',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    marginLeft: 8,
  },
  badgeGreen: {
    backgroundColor: 'rgba(40, 200, 64, 0.1)',
    borderColor: 'rgba(40, 200, 64, 0.3)',
  },
  badgeGreenText: {
    color: '#34D399', // bright green
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeRed: {
    backgroundColor: 'rgba(255, 60, 60, 0.1)',
    borderColor: 'rgba(255, 60, 60, 0.3)',
  },
  badgeRedText: {
    color: '#F87171', // bright red
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  badgeOrange: {
    backgroundColor: 'rgba(212, 136, 26, 0.1)',
    borderColor: 'rgba(212, 136, 26, 0.3)',
  },
  badgeOrangeText: {
    color: '#FBBF24', // bright orange
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  avatarGreen: {
    backgroundColor: 'rgba(40, 200, 64, 0.1)',
    borderColor: 'rgba(40, 200, 64, 0.3)',
  },
  avatarGreenText: {
    color: '#34D399',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarRed: {
    backgroundColor: 'rgba(255, 60, 60, 0.1)',
    borderColor: 'rgba(255, 60, 60, 0.3)',
  },
  avatarRedText: {
    color: '#F87171',
    fontWeight: 'bold',
    fontSize: 16,
  },
  avatarOrange: {
    backgroundColor: 'rgba(212, 136, 26, 0.1)',
    borderColor: 'rgba(212, 136, 26, 0.3)',
  },
  avatarOrangeText: {
    color: '#FBBF24',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
