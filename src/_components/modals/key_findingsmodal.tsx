import React from 'react';
import { Animated, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useBottomSheetTransition } from '../transition';
import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';

export interface MeasuredData {
  label: string;
  values: { label: string; value: string | number }[];
}

interface KeyFindingsModalProps {
  visible: boolean;
  onClose: () => void;
  title: string; // e.g., 'General Information'
  badgeLabel?: string; // e.g., 'Simulated Writing'
  observation?: string;
  measuredStandard?: MeasuredData; // left (green)
  measuredQuestioned?: MeasuredData; // right (red)
  isSuspected?: boolean; // affects accent color
}

export default function KeyFindingsModal({
  visible,
  onClose,
  title,
  badgeLabel,
  observation,
  measuredStandard,
  measuredQuestioned,
  isSuspected = false,
}: KeyFindingsModalProps) {
  const { isMounted, sheetY, backdropOpacity, dragHandlePanHandlers, onSheetLayout } = useBottomSheetTransition({
    visible,
    onClose,
  });

  if (!isMounted) return null;

  const accentColor = isSuspected ? colors.danger : colors.statusGenuine;
  const accentBg = isSuspected ? colors.dangerLight : colors.statusGenuineBg;

  return (
    <Modal visible={isMounted} transparent onRequestClose={onClose} statusBarTranslucent>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View pointerEvents="none" style={[styles.backdrop, { opacity: backdropOpacity }]} />
        </Pressable>

        <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetY }] }]} onLayout={onSheetLayout}>
          <View style={styles.dragHandleWrap} {...dragHandlePanHandlers}>
            <View style={styles.dragHandle} />
          </View>

          <View style={styles.headerRow}>
            <Text allowFontScaling={false} style={styles.title}>{title}</Text>
            {badgeLabel ? (
              <View style={[styles.badge, { backgroundColor: accentBg, borderColor: accentColor }]}> 
                <Text style={[styles.badgeText, { color: accentColor }]}>{badgeLabel}</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.sep} />

          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {observation ? (
              <View>
                <Text style={styles.sectionLabel}>OBSERVATION</Text>
                <Text style={styles.observationText}>{observation}</Text>
              </View>
            ) : null}

            {measuredStandard || measuredQuestioned ? (
              <View style={{ marginTop: 12 }}>
                <Text style={styles.sectionLabel}>MEASURED DATA</Text>

                <View style={styles.measuredRow}>
                  <View style={[styles.measuredCard, { backgroundColor: colors.statusGenuineBg }]}> 
                    <Text style={[styles.measuredCardLabel, { color: colors.statusGenuine }]}>STANDARD</Text>
                    {measuredStandard?.values.map((v) => (
                      <View key={v.label} style={styles.measuredRowItem}>
                        <Text style={styles.measuredKey}>{v.label}</Text>
                        <Text style={styles.measuredVal}>{String(v.value)}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.measuredCard, { backgroundColor: colors.dangerLight, borderWidth: 1, borderColor: colors.dangerBorder }]}> 
                    <Text style={[styles.measuredCardLabel, { color: colors.danger }]}>QUESTIONED</Text>
                    {measuredQuestioned?.values.map((v) => (
                      <View key={v.label} style={styles.measuredRowItem}>
                        <Text style={styles.measuredKey}>{v.label}</Text>
                        <Text style={[styles.measuredVal, { color: colors.danger }]}>{String(v.value)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </View>
            ) : null}

          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background2,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 22,
    borderWidth: 1,
    borderColor: colors.sheetBorder,
    maxHeight: '80%',
  },
  dragHandleWrap: { alignItems: 'center', paddingBottom: 8 },
  dragHandle: { width: 44, height: 5, borderRadius: 999, backgroundColor: colors.sheetHandle, marginBottom: 6 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  title: { ...getTypographyStyle('t2Title'), color: colors.textPrimary, flex: 1 },
  badge: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, borderWidth: 1 },
  badgeText: { ...getTypographyStyle('c2Caption', 'bold') },
  sep: { height: 1, backgroundColor: colors.dividerLight, marginVertical: 12 },
  content: { paddingBottom: 18 },
  sectionLabel: { ...getTypographyStyle('c2Caption', 'bold'), fontSize: 12, color: colors.label, marginBottom: 8 },
  observationText: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.textSecondary, lineHeight: 20 },

  measuredRow: { flexDirection: 'row', gap: 12 },
  measuredCard: { flex: 1, borderRadius: 10, padding: 12 },
  measuredCardLabel: { ...getTypographyStyle('b3Button'), marginBottom: 8, color: colors.textPrimary },
  measuredRowItem: { marginBottom: 8 },
  measuredKey: { ...getTypographyStyle('c2Caption', 'regular'), color: colors.label },
  measuredVal: { ...getTypographyStyle('l1List'), color: colors.textPrimary },
});
