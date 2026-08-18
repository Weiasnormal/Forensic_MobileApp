import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export default function DevScanSelectionPage() {
  const router = useRouter();
  const nav = router as any;

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.topBarWrapper}>
        <View style={styles.topBar}>
          <Pressable onPress={() => nav.back()} style={styles.backButton}>
            <View style={styles.backButtonBox}>
              <Ionicons name="chevron-back" size={20} color={colors.textPrimary} />
            </View>
          </Pressable>
          <Text style={styles.topBarTitle}>Dev Scan Tools</Text>
          <View style={{ width: 36 }} />
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.devBanner}>
          <Ionicons name="construct-outline" size={16} color="#D97706" />
          <Text style={styles.devBannerText}>
            Development only. Scans stay on this device and are never sent to the API,
            backend, or cloud storage.
          </Text>
        </View>

        <Text style={styles.sectionHeading}>Choose scan type</Text>

        <Pressable style={styles.optionCard} onPress={() => nav.push('/_devscan/whole-page')}>
          <View style={[styles.optionIconWrap, { backgroundColor: colors.primary }]}>
            <Ionicons name="document-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Whole Page</Text>
            <Text style={styles.optionSubtitle}>Scan an entire sheet of paper and export it as one PNG.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>

        <Pressable style={styles.optionCard} onPress={() => nav.push('/_devscan/per-signature')}>
          <View style={[styles.optionIconWrap, { backgroundColor: colors.suspectAccent }]}>
            <Ionicons name="brush-outline" size={22} color="#FFFFFF" />
          </View>
          <View style={styles.optionTextWrap}>
            <Text style={styles.optionTitle}>Per Signature</Text>
            <Text style={styles.optionSubtitle}>Scan individual genuine or forged signature crops for a dataset.</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textTertiary} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background2 },
  topBarWrapper: { backgroundColor: colors.background2, borderBottomWidth: 1, borderBottomColor: colors.border },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 12, paddingVertical: 12 },
  backButton: { padding: 4 },
  backButtonBox: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  topBarTitle: { flex: 1, ...getTypographyStyle('t3Title'), color: colors.textPrimary, textAlign: 'center' },
  content: { padding: 16, gap: 14 },
  devBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 4,
  },
  devBannerText: { flex: 1, ...getTypographyStyle('c2Caption', 'regular'), color: '#92400E', lineHeight: 16 },
  sectionHeading: { ...getTypographyStyle('t3Title'), color: colors.textPrimary, marginTop: 4 },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
  },
  optionIconWrap: { width: 44, height: 44, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  optionTextWrap: { flex: 1 },
  optionTitle: { ...getTypographyStyle('headline'), color: colors.textPrimary },
  optionSubtitle: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary, marginTop: 2 },
});