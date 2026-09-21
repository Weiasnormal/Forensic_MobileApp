import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { Flag } from "lucide-react-native";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type CaseStatus = "Suspected" | "Genuine" | "Processing";

interface CaseCardProps {
  caseCode: string;
  type: string;
  name: string;
  status: CaseStatus;
  priority: string;
  createdAt: string;
  variant?: "user" | "admin";
  examiner?: string;
  confidence?: number;
  adminStatus?: string;
  isFlaggedForInternalReview?: boolean;
  onPress?: () => void;
}

const priorityColors: Record<string, string> = {
  Urgent: colors.priorityUrgent,
  High: colors.priorityHigh,
  Medium: colors.priorityMedium,
  Low: colors.priorityLow,
};

const statusStyles: Record<
  CaseStatus,
  {
    borderColor: string;
    badgeColor: string;
    badgeText: string;
    badgeBgColor: string;
  }
> = {
  Suspected: {
    borderColor: colors.statusSuspected,
    badgeColor: colors.statusSuspected,
    badgeText: "Suspected",
    badgeBgColor: colors.statusSuspectedBg,
  },
  Genuine: {
    borderColor: colors.statusGenuine,
    badgeColor: colors.statusGenuine,
    badgeText: "Genuine",
    badgeBgColor: colors.statusGenuineBg,
  },
  Processing: {
    borderColor: colors.statusProcessing,
    badgeColor: colors.statusProcessing,
    badgeText: "Processing",
    badgeBgColor: colors.statusProcessingBg,
  },
};

export default function CaseCard({
  caseCode,
  type,
  name,
  status,
  priority,
  createdAt,
  variant = "user",
  examiner,
  confidence,
  adminStatus,
  isFlaggedForInternalReview = false,
  onPress,
}: CaseCardProps) {
  const style = statusStyles[status] ?? statusStyles.Processing;
  const isAdminCard = variant === "admin";
  const adminBadgeStyle = getAdminBadgeStyle(adminStatus);

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.75}
      onPress={onPress}
    >
      <View
        style={[styles.accentLine, { backgroundColor: style.borderColor }]}
      />
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text allowFontScaling={false} style={styles.id}>
            {formatCaseCode(caseCode)}
          </Text>
          {isAdminCard ? (
            <Text allowFontScaling={false} style={styles.typeLabel}>
              {examiner || "Unknown"} · {formatDate(createdAt)}
            </Text>
          ) : (
            <Text allowFontScaling={false} style={styles.typeLabel}>
              {type}
              {priority && (
                <Text
                  style={{
                    color: priorityColors[priority] || colors.textSecondary,
                  }}
                >
                  {""} {priority}
                </Text>
              )}
            </Text>
          )}
        </View>
        <View style={styles.badgeGroup}>
          {isAdminCard && isFlaggedForInternalReview ? (
            <View style={styles.flaggedBadge}>
              <Flag size={12} color={colors.suspectSubtext} strokeWidth={2.5} />
              <Text allowFontScaling={false} style={styles.flaggedText}>
                Flagged
              </Text>
            </View>
          ) : (
          <View
            style={[
              styles.badge,
              {
                backgroundColor: isAdminCard
                  ? adminBadgeStyle.backgroundColor
                  : style.badgeBgColor,
              },
            ]}
          >
            <Text
              allowFontScaling={false}
              style={[
                styles.badgeText,
                {
                  color: isAdminCard ? adminBadgeStyle.color : style.badgeColor,
                },
              ]}
            >
                {isAdminCard ? adminStatus || "Review" : style.badgeText}
            </Text>
          </View>
          )}
        </View>
      </View>
      {isAdminCard ? (
        <Text allowFontScaling={false} style={styles.nameLabel}>
          {status} · {`${(confidence ?? 0).toFixed(1)}%`}
        </Text>
      ) : (
        <Text allowFontScaling={false} style={styles.nameLabel}>
          {name}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    paddingLeft: 24,
    minHeight: 72,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  accentLine: {
    position: "absolute",
    left: 13,
    top: 12,
    bottom: 12,
    width: 3,
    borderRadius: 999,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  badgeGroup: {
    alignItems: "flex-end",
    gap: 4,
  },
  id: {
    ...getTypographyStyle("headline"),
    color: colors.textPrimary,
    marginBottom: 2,
    left: 6,
  },
  typeLabel: {
    ...getTypographyStyle("c2Caption", "regular"),
    color: colors.textSecondary,
    left: 6,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    alignSelf: "center",
    right: 4,
    top: 8,
  },
  badgeText: {
    ...getTypographyStyle("l2List"),
  },
  flaggedBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.suspectBackground,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  flaggedText: {
    ...getTypographyStyle("c2Caption", "bold"),
    color: colors.suspectSubtext,
  },
  nameLabel: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    left: 6,
  },
});

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

function formatCaseCode(value: string) {
  const withoutPrefix = value
    .replace(/^case(?:\s*[-_:#]\s*|\s+|(?=\d))/i, "")
    .trim();
  const compact = withoutPrefix.replace(/\D/g, "");

  if (/^\d{11}$/.test(compact)) {
    return `${compact.slice(0, 2)}-${compact.slice(2, 4)}-${compact.slice(4, 8)}-${compact.slice(8)}`;
  }

  return withoutPrefix;
}

function getAdminBadgeStyle(status?: string) {
  if (status === "Suspected") {
    return {
      color: colors.statusSuspected,
      backgroundColor: colors.statusSuspectedBg,
    };
  }

  if (status === "Genuine") {
    return {
      color: colors.statusGenuine,
      backgroundColor: colors.statusGenuineBg,
    };
  }

  return {
    color: colors.statusProcessing,
    backgroundColor: colors.statusProcessingBg,
  };
}
