import PrimaryButton from "@/_components/common/PrimaryButton";
import { useBottomSheetTransition } from "@/_components/transition";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { Check, X } from "lucide-react-native";
import React from "react";
import {
    Animated,
    Modal,
    Pressable,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Svg, { Line, Path, Rect } from "react-native-svg";

interface CropGuideModalProps {
  visible: boolean;
  showAgain: boolean;
  onShowAgainChange: (value: boolean) => void;
  onDismiss: () => void;
}

export default function CropGuideModal({
  visible,
  showAgain,
  onShowAgainChange,
  onDismiss,
}: CropGuideModalProps) {
  const insets = useSafeAreaInsets();
  const {
    isMounted,
    sheetY,
    backdropOpacity,
    dragHandlePanHandlers,
    onSheetLayout,
  } = useBottomSheetTransition({ visible, onClose: onDismiss });

  if (!isMounted) return null;

  return (
    <Modal
      visible={isMounted}
      transparent
      onRequestClose={onDismiss}
      statusBarTranslucent
    >
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onDismiss}>
          <Animated.View
            pointerEvents="none"
            style={[styles.backdrop, { opacity: backdropOpacity }]}
          />
        </Pressable>

        <Animated.View
          style={[
            styles.sheet,
            {
              paddingBottom: Math.max(28, insets.bottom + 16),
              transform: [{ translateY: sheetY }],
            },
          ]}
          onLayout={onSheetLayout}
        >
          <View style={styles.handle} {...dragHandlePanHandlers} />
          <Text style={styles.title} allowFontScaling={false}>
            Crop to the signature only
          </Text>
          <Text style={styles.description} allowFontScaling={false}>
            Drag the frame tight around the signature. Leave out paper edges
            and lines.
          </Text>

          <View style={styles.compareRow}>
            <View style={styles.compareCard}>
              <View style={styles.diagram}>
                <Svg width="100%" height="100%" viewBox="0 0 140 92">
                  <Path
                    d="M38 58 C 44 40, 52 40, 56 52 C 60 62, 66 62, 70 48 C 74 36, 80 36, 84 50 C 87 58, 92 56, 96 46"
                    fill="none"
                    stroke={colors.textPrimary}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                  />
                  <Rect
                    x={30}
                    y={30}
                    width={72}
                    height={34}
                    fill="none"
                    stroke={colors.primary}
                    strokeWidth={2}
                  />
                </Svg>
              </View>
              <View style={styles.compareLabelRow}>
                <Check size={14} color={colors.textPrimary} strokeWidth={3} />
                <Text style={styles.compareLabelGood} allowFontScaling={false}>
                  Correct
                </Text>
              </View>
              <Text style={styles.compareNote} allowFontScaling={false}>
                Follows the signature edges.
              </Text>
            </View>

            <View style={styles.compareCard}>
              <View style={styles.diagram}>
                <Svg width="100%" height="100%" viewBox="0 0 140 92">
                  <Line x1={14} y1={24} x2={126} y2={24} stroke={colors.border} strokeWidth={1} />
                  <Line x1={14} y1={70} x2={126} y2={70} stroke={colors.border} strokeWidth={1} />
                  <Path
                    d="M52 52 C 56 44, 61 44, 63 50 C 65 56, 69 56, 71 48 C 73 42, 77 42, 79 49"
                    fill="none"
                    stroke={colors.textPrimary}
                    strokeWidth={2}
                    strokeLinecap="round"
                  />
                  <Rect
                    x={14}
                    y={14}
                    width={112}
                    height={64}
                    fill="none"
                    stroke={colors.textTertiary}
                    strokeWidth={2}
                  />
                </Svg>
              </View>
              <View style={styles.compareLabelRow}>
                <X size={14} color={colors.textSecondary} strokeWidth={3} />
                <Text style={styles.compareLabelBad} allowFontScaling={false}>
                  Too loose
                </Text>
              </View>
              <Text style={styles.compareNote} allowFontScaling={false}>
                Includes paper edges and lines.
              </Text>
            </View>
          </View>

          <View style={styles.whyRow}>
            <Text style={styles.whyText} allowFontScaling={false}>
              Keeps the background out for a more accurate match.
            </Text>
          </View>

          <View style={styles.preferenceRow}>
            <Text style={styles.preferenceText} allowFontScaling={false}>
              Show again next time
            </Text>
            <Switch
              value={showAgain}
              onValueChange={onShowAgainChange}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.primaryText}
            />
          </View>

          <PrimaryButton label="Got it" onPress={onDismiss} size="medium" />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, justifyContent: "flex-end" },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.overlay,
  },
  sheet: {
    backgroundColor: colors.background2,
    borderTopWidth: 1,
    borderTopColor: colors.sheetBorder,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 10,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 999,
    backgroundColor: colors.sheetHandle,
    alignSelf: "center",
    marginBottom: 18,
  },
  title: {
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
    marginBottom: 8,
  },
  description: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  compareRow: { flexDirection: "row", gap: 14, marginBottom: 18 },
  compareCard: { flex: 1, gap: 8 },
  diagram: {
    height: 92,
    backgroundColor: colors.cardBackground,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    overflow: "hidden",
  },
  compareLabelRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  compareLabelGood: {
    ...getTypographyStyle("c1Caption", "bold"),
    color: colors.textPrimary,
  },
  compareLabelBad: {
    ...getTypographyStyle("c1Caption"),
    color: colors.textSecondary,
  },
  compareNote: {
    ...getTypographyStyle("c3Caption", "regular"),
    color: colors.textTertiary,
  },
  whyRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 14,
    marginBottom: 18,
  },
  whyText: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    lineHeight: 18,
  },
  preferenceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 18,
  },
  preferenceText: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textPrimary,
    flex: 1,
  },
});
