import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import type { AnalysisPriority } from "@/store/caseStore";
import { normalizePersonDisplay } from "@/utils/validation";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface PendingReview {
  id: string;
  caseCode: string;
  examiner: string;
  dateLabel: string;
  verdictLabel: string;
  confidence: number;
  priority: AnalysisPriority;
}

interface PendingReviewCardProps {
  review: PendingReview;
  onReview: (review: PendingReview) => void;
}

export default function PendingReviewCard({
  review,
  onReview,
}: PendingReviewCardProps) {
  const displayExaminer = normalizePersonDisplay(review.examiner);
  const trimmedExaminer =
    displayExaminer.length > 20
      ? `${displayExaminer.slice(0, 17)}...`
      : displayExaminer;

  return (
    <View style={styles.row}>
      <View style={styles.accent} />

      <View style={styles.info}>
        <Text allowFontScaling={false} style={styles.caseCode}>
          {review.caseCode}
        </Text>
        <Text
          allowFontScaling={false}
          style={styles.meta}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {trimmedExaminer} · {review.dateLabel}
        </Text>
        <Text allowFontScaling={false} style={styles.verdict}>
          {review.verdictLabel} · {review.confidence.toFixed(1)}%
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.button,
          review.priority === "Urgent" && styles.urgentButton,
        ]}
        onPress={() => onReview(review)}
        activeOpacity={0.85}
      >
        <Text
          allowFontScaling={false}
          style={[
            styles.buttonText,
            review.priority === "Urgent" && styles.urgentButtonText,
          ]}
        >
          {review.priority === "Urgent" ? "Urgent" : "Review"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted, // FLAG — was '#E3EAF3', unconfirmed exact match
    paddingVertical: 12,
    paddingHorizontal: 20,
    overflow: "hidden",
  },
  accent: {
    position: "absolute",
    left: 13,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 999,
    backgroundColor: colors.primary,
  },
  info: {
    flex: 1,
    paddingLeft: 6,
  },
  caseCode: {
    ...getTypographyStyle("headline"),
    color: colors.textPrimary,
  },
  meta: {
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.textSecondary,
    marginTop: 5,
  },
  verdict: {
    ...getTypographyStyle("l2List"),
    color: colors.primary,
    marginTop: 5,
  },
  button: {
    backgroundColor: colors.badgeBackground,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  buttonText: {
    ...getTypographyStyle("c2Caption", "bold"), // matches size (12) + weight (bold≈800) closely
    color: colors.primary,
  },
  urgentButton: {
    backgroundColor: colors.statusSuspectedBg,
  },
  urgentButtonText: {
    color: colors.statusSuspected,
  },
});
