import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, SafeAreaView, Platform, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function TargetUserScreen() {
  const router = useRouter();

  const goBack = () => {
    router.back();
  };

  const goTo = (screenId: string) => {
    // Navigate to the next screen. Assuming id is standard route for now.
    console.log(`Navigate to ${screenId}`);
    // example: router.push(`/${screenId}`);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navBack} onPress={goBack}>
          <Feather name="chevron-left" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>Select Subject</Text>
        <View style={{ width: 40 }} /> {/* Placeholder to balance the flex space */}
      </View>

      <ScrollView contentContainerStyle={styles.scrollArea} showsVerticalScrollIndicator={false}>
        <Text style={styles.pageTitle}>Who is signing?</Text>
        <Text style={styles.pageSub}>Search for the subject whose baseline we'll compare against.</Text>

        <View style={styles.searchBox}>
          <Feather name="search" size={20} color="#5A6A8A" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name or ID number..."
            placeholderTextColor="#8A8A8A"
          />
        </View>

        <Text style={styles.profileCount}>2,847 PROFILES · A–Z</Text>

        <View style={styles.sectionCard}>
          {/* User 1 */}
          <TouchableOpacity style={styles.listItem} onPress={() => goTo('s10')} activeOpacity={0.7}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>JD</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Juan Dela Cruz</Text>
              <Text style={styles.listSub}>ID #20240341 · Finance</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeGreenText}>Baseline ✓</Text>
            </View>
          </TouchableOpacity>

          {/* User 2 */}
          <View style={styles.listItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>MR</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Maria Reyes</Text>
              <Text style={styles.listSub}>ID #20240340 · Legal</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeGreenText}>Baseline ✓</Text>
            </View>
          </View>

          {/* User 3 */}
          <View style={styles.listItem}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>AL</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Alonzo Lim</Text>
              <Text style={styles.listSub}>ID #20240339 · Compliance</Text>
            </View>
            <View style={[styles.badge, styles.badgeGreen]}>
              <Text style={styles.badgeGreenText}>Baseline ✓</Text>
            </View>
          </View>

          {/* User 4 */}
          <View style={[styles.listItem, { borderBottomWidth: 0 }]}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>RP</Text>
            </View>
            <View style={styles.listTextContainer}>
              <Text style={styles.listName}>Rosa Padilla</Text>
              <Text style={styles.listSub}>ID #20240338 · Operations</Text>
            </View>
            <View style={[styles.badge, styles.badgeOrange]}>
              <Text style={styles.badgeOrangeText}>No Baseline</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoText}>Subject must have an enrolled baseline signature to proceed.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0A0A0A', // Deep dark theme matching UserDashboard
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: Platform.OS === 'android' ? 40 : 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#0A0A0A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A1A',
  },
  navBack: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  navTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scrollArea: {
    padding: 20,
    paddingBottom: 40,
  },
  pageTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 6,
  },
  pageSub: {
    fontSize: 14,
    color: '#8A8A8A',
    marginBottom: 24,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#141414',
    borderWidth: 1,
    borderColor: '#222222',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
    marginBottom: 24,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 15,
  },
  profileCount: {
    fontSize: 11,
    color: '#666666',
    fontFamily: Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' }),
    letterSpacing: 0.5,
    marginBottom: 10,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  sectionCard: {
    backgroundColor: '#141414',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#222222',
    overflow: 'hidden',
    marginBottom: 24,
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
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  avatarText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
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
  infoCard: {
    backgroundColor: '#141414',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#222222',
    padding: 16,
    alignItems: 'center',
  },
  infoText: {
    fontSize: 12,
    color: '#8A8A8A',
    textAlign: 'center',
  },
});
