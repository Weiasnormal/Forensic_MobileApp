import InfoRow from "@/_components/admin/InfoRow";
import ScreenHeader from "@/_components/common/ScreenHeader";
import SecondaryButton from "@/_components/common/SecondaryButton";
import TertiaryButton from "@/_components/common/TertiaryButton";
import MemberLimitModal from "@/_components/modals/member_limit";
import Toast from "@/_components/toast";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { getTeamSummary, useAdminStore } from "@/store/adminStore";
import { useUser } from "@/store/userStore";
import * as Clipboard from "expo-clipboard";
import { ChevronRight, Copy, X } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface OrganizationScreenProps {
  organizationName?: string;
  organizationCode?: string;
  memberCount?: number;
  createdDate?: string;
  onBackPress?: () => void;
  onCopyCodePress?: () => void;
  onMembersPress?: () => void;
}

type UsageLevel = "ok" | "warn" | "full";

const WARN_RATIO = 0.8;

function getUsageLevel(used: number, limit: number): UsageLevel {
  if (limit <= 0 || used >= limit) return "full";
  return used / limit >= WARN_RATIO ? "warn" : "ok";
}

interface MemberUsageProps {
  used: number;
  limit: number;
  onRaiseLimit: () => void;
}

// Progress bar plus one inline status line. The warning and full states use a
// fill only (no border), and the "Raise limit" action only appears when needed.
const MemberUsage: React.FC<MemberUsageProps> = ({
  used,
  limit,
  onRaiseLimit,
}) => {
  const level = getUsageLevel(used, limit);
  const seatsLeft = Math.max(limit - used, 0);
  const fillRatio = limit > 0 ? Math.min(used / limit, 1) : 1;

  // FLAG: suspectAccent is the amber token added for the suspect signature.
  // It is an exact match for the design's warning amber, so it is reused here.
  // Rename it to a neutral warning token if you want it shared.
  const fillColor =
    level === "full"
      ? colors.danger
      : level === "warn"
        ? colors.suspectAccent
        : colors.primary;

  const statusText =
    seatsLeft === 0
      ? "No seats left, approvals paused"
      : `${seatsLeft} ${seatsLeft === 1 ? "seat" : "seats"} left`;

  return (
    <View>
      <View style={styles.usageTrack}>
        <View
          style={[
            styles.usageFill,
            { width: `${fillRatio * 100}%`, backgroundColor: fillColor },
          ]}
        />
      </View>

      <View
        style={[
          styles.usageStatus,
          level === "warn" && styles.usageStatusWarn,
          level === "full" && styles.usageStatusFull,
        ]}
      >
        <Text
          style={[
            styles.usageStatusText,
            level !== "ok" && styles.usageStatusTextAlert,
          ]}
        >
          {statusText}
        </Text>

        {level !== "ok" ? (
          <TertiaryButton
            label="Raise limit"
            onPress={onRaiseLimit}
            size="small"
            textVariant="b3Button"
            textColor={colors.textPrimary}
            textStyle={styles.usageActionText}
            style={styles.usageAction}
          />
        ) : null}
      </View>
    </View>
  );
};

const OrganizationScreen: React.FC<OrganizationScreenProps> = ({
  organizationName,
  organizationCode,
  memberCount,
  createdDate,
  onBackPress,
  onCopyCodePress,
  onMembersPress,
}) => {
  const { user, setUser } = useUser();
  const tenantProfile = useAdminStore((state) => state.tenantProfile);
  const teamMembers = useAdminStore((state) => state.teamMembers);
  const fetchTenantProfile = useAdminStore((state) => state.fetchTenantProfile);
  const renameTenant = useAdminStore((state) => state.renameTenant);
  const setMemberCountLimit = useAdminStore(
    (state) => state.setMemberCountLimit,
  );

  useEffect(() => {
    fetchTenantProfile();
  }, [fetchTenantProfile]);

  const resolvedOrganizationName =
    tenantProfile?.name ||
    user?.organization ||
    organizationName ||
    "Organization unavailable";
  const resolvedOrganizationCode =
    tenantProfile?.inviteCode || organizationCode || "—";
  const { totalAnalysts } = getTeamSummary(teamMembers);
  const resolvedMemberCount = totalAnalysts;
  const resolvedMemberLimit = tenantProfile?.memberCountLimit ?? null;
  const resolvedCreatedDate = tenantProfile?.createdAt
    ? new Date(tenantProfile.createdAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : (createdDate ?? "—");

  const [draftOrganizationName, setDraftOrganizationName] = useState(
    resolvedOrganizationName,
  );
  const [isEditingOrganizationName, setIsEditingOrganizationName] =
    useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastVisible, setToastVisible] = useState(false);
  const [isMemberLimitModalVisible, setIsMemberLimitModalVisible] =
    useState(false);

  useEffect(() => {
    if (!isEditingOrganizationName) {
      setDraftOrganizationName(resolvedOrganizationName);
    }
  }, [resolvedOrganizationName, isEditingOrganizationName]);

  const trimmedOrganizationName = draftOrganizationName.trim();
  const canSaveOrganizationName =
    trimmedOrganizationName.length > 0 &&
    trimmedOrganizationName !== resolvedOrganizationName.trim();

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setToastVisible(true);
  }, []);

  const handleEditOrganizationName = useCallback(() => {
    setDraftOrganizationName(resolvedOrganizationName);
    setIsEditingOrganizationName(true);
  }, [resolvedOrganizationName]);

  const handleCancelOrganizationName = useCallback(() => {
    setDraftOrganizationName(resolvedOrganizationName);
    setIsEditingOrganizationName(false);
  }, [resolvedOrganizationName]);

  const handleSaveOrganizationName = useCallback(async () => {
    if (!canSaveOrganizationName) {
      setIsEditingOrganizationName(false);
      return;
    }

    const renamed = await renameTenant(trimmedOrganizationName);

    if (!renamed) {
      showToast("Network error. Please check your connection and try again.");
      return;
    }

    await setUser({ organization: trimmedOrganizationName });
    setIsEditingOrganizationName(false);
    showToast("Organization renamed");
  }, [
    canSaveOrganizationName,
    renameTenant,
    setUser,
    showToast,
    trimmedOrganizationName,
  ]);

  const handleCopyCode = useCallback(async () => {
    try {
      await Clipboard.setStringAsync(resolvedOrganizationCode);
      onCopyCodePress?.();
      showToast("Code copied");
    } catch {
      showToast("Unable to copy code");
    }
  }, [onCopyCodePress, resolvedOrganizationCode, showToast]);

  const openMemberLimitModal = useCallback(() => {
    setIsMemberLimitModalVisible(true);
  }, []);

  const closeMemberLimitModal = useCallback(() => {
    setIsMemberLimitModalVisible(false);
  }, []);

  // Returns whether the save worked so the modal can show its own inline
  // error. The modal is closed here on success.
  const handleSaveMemberLimit = useCallback(
    async (limit: number): Promise<boolean> => {
      let saved = false;
      try {
        saved = await setMemberCountLimit(limit);
      } catch {
        saved = false;
      }

      if (saved) {
        setIsMemberLimitModalVisible(false);
        showToast("Member limit updated");
      }
      return saved;
    },
    [setMemberCountLimit, showToast],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Organization" onBackPress={onBackPress} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <View style={styles.nameSection}>
          <TouchableOpacity
            activeOpacity={0.75}
            onPress={handleEditOrganizationName}
          >
            <View style={styles.nameRow}>
              <Text style={styles.sectionLabel}>Organization Name</Text>
              <Text style={styles.nameValue}>{resolvedOrganizationName}</Text>
            </View>
          </TouchableOpacity>

          {isEditingOrganizationName ? (
            <View style={styles.editorCard}>
              <View style={styles.inputShell}>
                <TextInput
                  value={draftOrganizationName}
                  onChangeText={setDraftOrganizationName}
                  placeholder="Organization name"
                  placeholderTextColor={colors.textTertiary}
                  style={styles.input}
                  autoFocus
                  returnKeyType="done"
                  onSubmitEditing={() => {
                    void handleSaveOrganizationName();
                  }}
                />

                {draftOrganizationName.length > 0 ? (
                  <Pressable
                    onPress={() => setDraftOrganizationName("")}
                    hitSlop={10}
                    style={styles.clearButton}
                  >
                    <View style={styles.clearIconCircle}>
                      <X
                        size={14}
                        color={colors.textSecondary}
                        strokeWidth={2.2}
                      />
                    </View>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleCancelOrganizationName}
                  activeOpacity={0.8}
                >
                  <Text style={styles.secondaryButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    !canSaveOrganizationName && styles.primaryButtonDisabled,
                  ]}
                  onPress={() => {
                    void handleSaveOrganizationName();
                  }}
                  activeOpacity={0.85}
                  disabled={!canSaveOrganizationName}
                >
                  <Text style={styles.primaryButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}
        </View>

        <InfoRow
          label="Organization Code"
          value={resolvedOrganizationCode}
          rightAccessory={
            <TouchableOpacity
              onPress={() => {
                void handleCopyCode();
              }}
              activeOpacity={0.7}
            >
              <Copy size={20} color={colors.textPrimary} strokeWidth={2.1} />
            </TouchableOpacity>
          }
        />

        <InfoRow
          label="Members"
          value={
            resolvedMemberLimit === null
              ? String(resolvedMemberCount)
              : `${resolvedMemberCount} of ${resolvedMemberLimit}`
          }
          onPress={onMembersPress}
          rightAccessory={
            <ChevronRight
              size={20}
              color={colors.textTertiary}
              strokeWidth={2.1}
            />
          }
          footer={
            resolvedMemberLimit === null ? undefined : (
              <MemberUsage
                used={resolvedMemberCount}
                limit={resolvedMemberLimit}
                onRaiseLimit={openMemberLimitModal}
              />
            )
          }
        />

        <InfoRow
          label="Member Limit"
          value={
            resolvedMemberLimit === null ? "—" : String(resolvedMemberLimit)
          }
          rightAccessory={
            <SecondaryButton
              label="Edit"
              onPress={openMemberLimitModal}
              size="small"
              style={styles.editLimitButton}
            />
          }
        />

        <InfoRow label="Created" value={resolvedCreatedDate} />
      </ScrollView>

      <MemberLimitModal
        visible={isMemberLimitModalVisible}
        currentLimit={resolvedMemberLimit}
        memberCount={resolvedMemberCount}
        onClose={closeMemberLimitModal}
        onSave={handleSaveMemberLimit}
      />

      <Toast
        visible={toastVisible}
        message={toastMessage}
        variant="success"
        onDismiss={() => setToastVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 34,
    paddingBottom: 24,
  },
  nameSection: {
    marginBottom: 6,
  },
  nameRow: {
    marginBottom: 10,
  },
  sectionLabel: {
    ...getTypographyStyle("c2Caption"),
    color: colors.textSecondary,
    marginBottom: 6,
  },
  nameValue: {
    ...getTypographyStyle("body", "semiBold"),
    color: colors.textPrimary,
  },
  editorCard: {
    paddingBottom: 8,
  },
  inputShell: {
    position: "relative",
    borderWidth: 1,
    borderColor: colors.inputBorder,
    backgroundColor: colors.inputBackground,
    borderRadius: 12,
    minHeight: 48,
    justifyContent: "center",
    paddingLeft: 14,
    paddingRight: 42,
  },
  input: {
    ...getTypographyStyle("body"),
    color: colors.textPrimary,
    paddingVertical: 11,
  },
  clearButton: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  clearIconCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#EDF3FA", // FLAG: no exact token (statsBackground is #F5F8FC), left as is
    alignItems: "center",
    justifyContent: "center",
  },
  actionRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 12,
    marginBottom: 2,
  },
  secondaryButton: {
    minWidth: 92,
    height: 36,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background2,
  },
  secondaryButtonText: {
    ...getTypographyStyle("b3Button"),
    color: colors.textSecondary, // was #64748B, exact match
  },
  primaryButton: {
    minWidth: 92,
    height: 36,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  primaryButtonDisabled: {
    backgroundColor: colors.primaryDisabled,
  },
  primaryButtonText: {
    ...getTypographyStyle("b3Button"),
    color: colors.primaryText,
  },
  editLimitButton: {
    minWidth: 92,
    height: 36,
    paddingVertical: 0,
    borderRadius: 12,
  },
  usageTrack: {
    height: 6,
    borderRadius: 999,
    backgroundColor: colors.disabledBorder,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 10,
  },
  usageFill: {
    height: "100%",
    borderRadius: 999,
  },
  usageStatus: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  usageStatusWarn: {
    backgroundColor: colors.suspectBackground,
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 8,
  },
  usageStatusFull: {
    backgroundColor: colors.dangerLight,
    borderRadius: 12,
    paddingVertical: 4,
    paddingLeft: 12,
    paddingRight: 8,
  },
  usageStatusText: {
    // FLAG: the prototype used 12px regular. There is no 12px caption token,
    // so this uses c1Caption (13) at regular weight, 1px larger.
    ...getTypographyStyle("c1Caption", "regular"),
    flex: 1,
    color: colors.textSecondary,
  },
  usageStatusTextAlert: {
    color: colors.textPrimary,
  },
  usageAction: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  usageActionText: {
    ...getTypographyStyle("b3Button", "semiBold"),
    textDecorationLine: "underline",
  },
});

export default OrganizationScreen;