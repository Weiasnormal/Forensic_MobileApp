import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Platform, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

export default function AdminDashboard() {
  const router = useRouter();

  const goTo = (route: string) => {
    try {
      // @ts-ignore
      router.push(route);
    } catch (e) {
      console.warn("Navigation failed:", e);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.screen}>
        <View style={styles.header}>
          <Text style={styles.headerSubtitle}>ADMIN CONSOLE</Text>
          <Text style={styles.pageTitle}>Command Center</Text>
        </View>
        
        <ScrollView style={styles.scrollArea} contentContainerStyle={styles.scrollContent}>
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Enrolled</Text>
              <Text style={styles.statValue}>2,847</Text>
            </View>
            <View style={styles.statCard}>
              <View style={styles.statLabelContainer}>
                <View style={styles.statDot} />
                <Text style={styles.statLabel}>System</Text>
              </View>
              <Text style={[styles.statValue, { fontSize: 16, color: '#10B981', paddingTop: 6 }]}>NOMINAL</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Recently Added</Text>
          <View style={styles.sectionCard}>
            <TouchableOpacity style={styles.listItem} onPress={() => goTo('/s4')} activeOpacity={0.7}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>JD</Text>
              </View>
              <View style={styles.listText}>
                <Text style={styles.listName}>Juan Dela Cruz</Text>
                <Text style={styles.listSub}>ID #20240341 · Finance Dept</Text>
              </View>
              <Text style={styles.listArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>MR</Text>
              </View>
              <View style={styles.listText}>
                <Text style={styles.listName}>Maria Reyes</Text>
                <Text style={styles.listSub}>ID #20240340 · Legal</Text>
              </View>
              <Text style={styles.listArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            
            <TouchableOpacity style={styles.listItem} activeOpacity={0.7}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>AL</Text>
              </View>
              <View style={styles.listText}>
                <Text style={styles.listName}>Alonzo Lim</Text>
                <Text style={styles.listSub}>ID #20240339 · Compliance</Text>
              </View>
              <Text style={styles.listArrow}>›</Text>
            </TouchableOpacity>
          </View>

          <Text style={[styles.sectionTitle, { marginTop: 12 }]}>Storage Usage</Text>
          <View style={styles.card}>
            <View style={styles.storageHeader}>
              <Text style={styles.storageLabel}>Baseline Images</Text>
              <Text style={styles.storageValue}>18.4 GB / 50 GB</Text>
            </View>
            <View style={styles.scoreBar}>
              <View style={[styles.scoreFill, { width: '37%' }]} />
            </View>
          </View>
        </ScrollView>

        <TouchableOpacity style={styles.fab} onPress={() => goTo('/s4')} activeOpacity={0.8}>
          <Text style={styles.fabIcon}>+</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  screen: {
    flex: 1,
    backgroundColor: '#0B0E14',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 10 : 32,
    paddingHorizontal: 20,
    flexShrink: 0,
    paddingBottom: 4,
  },
  headerSubtitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 10,
    color: '#3b4b60',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  pageTitle: {
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  scrollArea: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: 24,
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
    gap: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#131823',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1d2433',
  },
  statLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  statLabel: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 11,
    color: '#8b9bb4',
    textTransform: 'uppercase',
  },
  statValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#ffffff',
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#131823',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#1d2433',
    marginBottom: 32,
    overflow: 'hidden',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#1d2433',
    marginLeft: 68,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1E2330',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#3A82F6',
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Courier-Bold' : 'monospace',
  },
  listText: {
    flex: 1,
  },
  listName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#ffffff',
    marginBottom: 4,
  },
  listSub: {
    fontSize: 13,
    color: '#8b9bb4',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  listArrow: {
    fontSize: 20,
    color: '#3b4b60',
    marginLeft: 8,
  },
  card: {
    backgroundColor: '#131823',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1d2433',
  },
  storageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  storageLabel: {
    fontSize: 13,
    color: '#8b9bb4',
  },
  storageValue: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
    color: '#ffffff',
  },
  scoreBar: {
    height: 6,
    backgroundColor: '#1d2433',
    borderRadius: 3,
    overflow: 'hidden',
  },
  scoreFill: {
    height: '100%',
    backgroundColor: '#3A82F6',
    borderRadius: 3,
  },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#3A82F6',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#3A82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  fabIcon: {
    fontSize: 28,
    color: '#ffffff',
  },
});
