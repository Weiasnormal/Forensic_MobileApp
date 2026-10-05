import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { limitDashboardName } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export interface MemberRequestData {
  id: string;
  firstName: string;
  lastName: string;
  timeAgo: string;
}

function getInitials(first = "", last = "") {
  return ((first[0] || "") + (last[0] || "")).toUpperCase();
}

interface MemberRequestCardProps {
  request: MemberRequestData;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export default function MemberRequestCard({
  request,
  onApprove,
  onReject,
}: MemberRequestCardProps) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <Text allowFontScaling={false} style={styles.avatarText}>
          {getInitials(request.firstName, request.lastName)}
        </Text>
      </View>

      <View style={styles.info}>
        <Text allowFontScaling={false} style={styles.name}>
          {limitDashboardName(`${request.firstName} ${request.lastName}`, 20)}
        </Text>
        <Text allowFontScaling={false} style={styles.timeAgo}>
          {request.timeAgo}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonAccept]}
          onPress={() => onApprove(request.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="checkmark" size={18} color={colors.labelsuccess} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.iconButton, styles.iconButtonReject]}
          onPress={() => onReject(request.id)}
          activeOpacity={0.8}
        >
          <Ionicons name="close" size={18} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.cardBorderMuted,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.badgeBackground,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    ...getTypographyStyle("l1List"),
    color: colors.primary,
  },
  info: {
    flex: 1,
  },
  name: {
    ...getTypographyStyle("l1List"),
    color: colors.textPrimary,
  },
  timeAgo: {
    ...getTypographyStyle("c2Caption"),
    color: colors.textTertiary,
    marginTop: 1,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  iconButtonAccept: {
    backgroundColor: colors.successBg,
  },
  iconButtonReject: {
    backgroundColor: colors.dangerBgAlt,
  },
});
