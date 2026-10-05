import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { limitDashboardName, normalizePersonDisplay } from "@/utils/validation";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface TeamOverviewData {
  id: string;
  firstName: string;
  lastName: string;
  casesHandled: number;
  status: "active" | "suspended";
}

interface TeamOverviewCardProps {
  member: TeamOverviewData;
  onPress?: () => void;
  showDivider?: boolean;
}

function getInitials(first = "", last = "") {
  return ((first[0] || "") + (last[0] || "")).toUpperCase();
}

export default function TeamOverviewCard({
  member,
  onPress,
  showDivider = true,
}: TeamOverviewCardProps) {
  const normalizedName = normalizePersonDisplay(
    `${member.firstName} ${member.lastName}`,
  );

  return (
    <TouchableOpacity
      style={[
        styles.row,
        member.status === "suspended" && styles.mutedRow,
        showDivider && styles.rowDivider,
      ]}
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      disabled={!onPress}
    >
      <View
        style={[
          styles.avatar,
          member.status === "suspended" && styles.mutedAvatar,
        ]}
      >
        <Text allowFontScaling={false} style={styles.avatarText}>
          {getInitials(
            normalizedName.split(" ")[0],
            normalizedName.split(" ").slice(1).join(" "),
          )}
        </Text>
      </View>

      <Text allowFontScaling={false} style={styles.name} numberOfLines={1}>
        {limitDashboardName(normalizedName, 20)}
      </Text>

      <View style={styles.metaColumn}>
        <Text
          allowFontScaling={false}
          style={[
            styles.countLine,
            member.status === "suspended" && styles.mutedText,
          ]}
        >
          <Text
            style={[
              styles.countValue,
              member.status === "suspended" && styles.mutedText,
            ]}
          >
            {member.casesHandled}
          </Text>{" "}
          cases
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  mutedRow: {
    backgroundColor: colors.disabledBackground,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.dividerLight,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.badgeBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  mutedAvatar: {
    backgroundColor: colors.border,
    borderWidth: 1,
    borderColor: colors.danger,
  },
  avatarText: {
    ...getTypographyStyle("l1List"),
    color: colors.primary,
  },
  name: {
    ...getTypographyStyle("headline"),
    color: colors.textPrimary,
    flex: 1,
  },
  countLine: {
    ...getTypographyStyle("c1Caption"),
    color: colors.textSecondary,
  },
  metaColumn: {
    alignItems: "flex-end",
    gap: 2,
  },
  mutedText: {
    color: colors.textTertiary,
  },
  countValue: {
    ...getTypographyStyle("headline"),
    color: colors.primary,
  },
});
