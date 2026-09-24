import DangerRow from "@/_components/admin/DangerRow";
import Avatar from "@/_components/common/Avatar";
import Divider from "@/_components/common/Divider";
import ScreenHeader from "@/_components/common/ScreenHeader";
import SectionLabel from "@/_components/common/SectionLabel";
import SettingsRow from "@/_components/common/SettingsRow";
import ConfirmActionModal from "@/_components/modals/confirm_action";
import TypeToConfirmModal from "@/_components/modals/type_to_confirm";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { useAdminStore } from "@/store/adminStore";
import { useCaseStore } from "@/store/caseStore";
import { normalizePersonDisplay } from "@/utils/validation";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
  Folder,
  Gauge,
  Minus,
  MinusCircle,
  Plus,
  UserX,
} from "lucide-react-native";
import React, { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const MemberDetailsScreen: React.FC = () => {
  const { memberId } = useLocalSearchParams<{ memberId?: string }>();
  const router = useRouter();
  const fetchMemberById = useAdminStore((state) => state.fetchMemberById);
  const suspendTeamMember = useAdminStore((state) => state.suspendTeamMember);
  const unsuspendTeamMember = useAdminStore(
    (state) => state.unsuspendTeamMember,
  );
  const removeTeamMember = useAdminStore((state) => state.removeTeamMember);
  const setUserDailyCaseLimit = useAdminStore(
    (state) => state.setUserDailyCaseLimit,
  );
  const memberDetail = useAdminStore((state) => state.memberDetail);
  const isLoadingMemberDetail = useAdminStore(
    (state) => state.isLoadingMemberDetail,
  );
  const memberDetailError = useAdminStore((state) => state.memberDetailError);
  const [limitDraft, setLimitDraft] = useState<number | null>(null);
  const [pendingLimitChange, setPendingLimitChange] = useState<number | null>(
    null,
  );
  const [isDailyLimitModalVisible, setIsDailyLimitModalVisible] =
    useState(false);
  const [isUpdatingDailyLimit, setIsUpdatingDailyLimit] = useState(false);
  const dailyCaseLimit = memberDetail?.dailyCaseLimit ?? null;
  const memberCaseCount = useCaseStore(
    (state) =>
      state.cases.filter(
        (item) =>
          Boolean(item.ownerUserId) &&
          String(item.ownerUserId).trim().toLowerCase() ===
            String(memberId ?? "")
              .trim()
              .toLowerCase(),
      ).length,
  );
  const isProtectedMember = /admin/i.test(memberDetail?.role ?? "");
  const isSuspended = memberDetail?.isSuspended ?? false;

  const [confirmationVisible, setConfirmationVisible] = React.useState(false);
  const [isUpdatingAccess, setIsUpdatingAccess] = React.useState(false);
  const [removeConfirmationVisible, setRemoveConfirmationVisible] =
    React.useState(false);
  const [removeTypeVisible, setRemoveTypeVisible] = React.useState(false);
  const [isRemovingMember, setIsRemovingMember] = React.useState(false);
  useEffect(() => {
    if (memberId) {
      void fetchMemberById(memberId);
    }
  }, [fetchMemberById, memberId]);

  useEffect(() => {
    setLimitDraft(dailyCaseLimit);
  }, [dailyCaseLimit]);

  const limitSummary = useMemo(() => {
    if (limitDraft === null) return "Unlimited";
    return `${limitDraft} / day`;
  }, [limitDraft]);

  const openDailyLimitModal = () => {
    setPendingLimitChange(limitDraft ?? 0);
    setIsDailyLimitModalVisible(true);
  };

  const handleLimitStepper = (direction: "increase" | "decrease") => {
    const currentValue = pendingLimitChange ?? 0;
    const nextValue =
      direction === "increase"
        ? currentValue + 1
        : Math.max(0, currentValue - 1);

    setPendingLimitChange(nextValue);
  };

  const closeDailyLimitModal = () => {
    setIsDailyLimitModalVisible(false);
    setPendingLimitChange(limitDraft);
  };

  const confirmLimitChange = async () => {
    if (!memberId || pendingLimitChange === null) {
      return;
    }

    setIsUpdatingDailyLimit(true);
    try {
      const success = await setUserDailyCaseLimit(memberId, pendingLimitChange);
      if (success) {
        setLimitDraft(pendingLimitChange);
        setIsDailyLimitModalVisible(false);
        setPendingLimitChange(null);
      }
    } finally {
      setIsUpdatingDailyLimit(false);
    }
  };

  if (
    !memberId ||
    isLoadingMemberDetail ||
    !memberDetail ||
    memberDetail.id !== memberId
  ) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="Member Details"
          onBackPress={() => router.back()}
        />
        <View style={styles.centeredState}>
          <ActivityIndicator color={colors.primary} />
          <Text allowFontScaling={false} style={styles.stateText}>
            {memberDetailError ?? "Loading member details..."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isProtectedMember) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScreenHeader
          title="Member Details"
          onBackPress={() => router.back()}
        />
        <View style={styles.centeredState}>
          <Text allowFontScaling={false} style={styles.stateText}>
            Organization administrators do not have analyst member details.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const memberName = normalizePersonDisplay(
    `${memberDetail.firstName} ${memberDetail.lastName}`,
  );
  const memberInitials =
    `${memberName.split(" ")[0]?.[0] ?? ""}${memberName.split(" ").slice(1).join(" ")[0] ?? ""}`.toUpperCase();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScreenHeader title="Member Details" onBackPress={() => router.back()} />

      <ScrollView contentContainerStyle={styles.content}>
        <Avatar initials={memberInitials} size={80} variant="light" />
        <Text allowFontScaling={false} style={styles.name}>
          {memberName}
        </Text>
        <Text allowFontScaling={false} style={styles.role}>
          {memberDetail.role}
        </Text>

        <SectionLabel label="Case Management" style={styles.sectionSpacing} />
        <SettingsRow
          icon={Folder}
          title="View Case History"
          subtitle={
            memberCaseCount > 0
              ? `${memberCaseCount} case${memberCaseCount === 1 ? "" : "s"} created by this analyst`
              : "No cases created by this analyst"
          }
          onPress={() =>
            router.push({
              pathname: "/Admin/admin_dashboard",
              params: {
                tab: "cases",
                memberId,
                memberName: memberName,
              },
            })
          }
        />
        <Divider />

        <SettingsRow
          icon={Gauge}
          title="Daily Case Limit"
          subtitle={
            limitDraft === null
              ? "No limit currently configured"
              : `Current limit: ${limitDraft} case${limitDraft === 1 ? "" : "s"} per day`
          }
          rightText={limitSummary}
          onPress={openDailyLimitModal}
        />
        <Divider />

        <SectionLabel label="Access Controls" style={styles.sectionSpacing} />
        <DangerRow
          icon={MinusCircle}
          title={isSuspended ? "Unsuspend Analyst" : "Suspend Analyst"}
          color={isSuspended ? colors.textPrimary : colors.danger}
          subtitle={
            isSuspended
              ? "Restore the analyst's organization access"
              : "Temporarily disable access"
          }
          onPress={() => {
            setConfirmationVisible(true);
          }}
        />
        {!isProtectedMember ? (
          <DangerRow
            icon={UserX}
            title="Remove from Organization"
            subtitle="Permanently remove access"
            onPress={() => setRemoveConfirmationVisible(true)}
          />
        ) : null}
      </ScrollView>

      <ConfirmActionModal
        visible={confirmationVisible}
        title={isSuspended ? "Unsuspend analyst?" : "Suspend analyst?"}
        message={
          isSuspended
            ? "This will restore the analyst's organization access. Continue?"
            : "This will temporarily disable the analyst's access. Continue?"
        }
        confirmLabel={isSuspended ? "Unsuspend" : "Suspend"}
        variant={isSuspended ? "success" : "danger"}
        isLoading={isUpdatingAccess}
        onCancel={() => setConfirmationVisible(false)}
        onConfirm={async () => {
          setIsUpdatingAccess(true);
          try {
            if (isSuspended) {
              await unsuspendTeamMember(memberId);
            } else {
              await suspendTeamMember(memberId);
            }
            setConfirmationVisible(false);
          } finally {
            setIsUpdatingAccess(false);
          }
        }}
      />

      <ConfirmActionModal
        visible={removeConfirmationVisible}
        title={`Remove ${memberName} from the organization?`}
        message="This action cannot be undone. All access will be permanently revoked."
        confirmLabel="Remove"
        onCancel={() => setRemoveConfirmationVisible(false)}
        onConfirm={() => {
          setRemoveConfirmationVisible(false);
          setRemoveTypeVisible(true);
        }}
      />

      <TypeToConfirmModal
        visible={removeTypeVisible}
        title="Type REMOVE to continue"
        message="This confirms you want to permanently remove this member."
        confirmWord="REMOVE"
        confirmLabel="Remove"
        isLoading={isRemovingMember}
        onCancel={() => setRemoveTypeVisible(false)}
        onConfirm={async () => {
          setIsRemovingMember(true);
          try {
            await removeTeamMember(memberId);
            setRemoveTypeVisible(false);
            router.back();
          } finally {
            setIsRemovingMember(false);
          }
        }}
      />

      <Modal
        transparent
        animationType="fade"
        visible={isDailyLimitModalVisible}
        onRequestClose={closeDailyLimitModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.limitModalCard}>
            <Text allowFontScaling={false} style={styles.limitModalTitle}>
              Daily case limit
            </Text>
            <Text allowFontScaling={false} style={styles.limitModalSubtitle}>
              {`Set ${memberName}'s daily limit`}
            </Text>

            <View style={styles.limitModalControls}>
              <TouchableOpacity
                style={styles.stepButton}
                activeOpacity={0.8}
                onPress={() => handleLimitStepper("decrease")}
              >
                <Minus size={22} color={colors.primary} />
              </TouchableOpacity>

              <Text allowFontScaling={false} style={styles.limitModalValue}>
                {pendingLimitChange === null
                  ? "Unlimited"
                  : `${pendingLimitChange}`}
              </Text>

              <TouchableOpacity
                style={styles.stepButton}
                activeOpacity={0.8}
                onPress={() => handleLimitStepper("increase")}
              >
                <Plus size={22} color={colors.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity
                style={[styles.modalSecondaryButton, styles.modalActionButton]}
                onPress={closeDailyLimitModal}
                activeOpacity={0.8}
              >
                <Text
                  allowFontScaling={false}
                  style={styles.modalSecondaryText}
                >
                  Cancel
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalPrimaryButton, styles.modalActionButton]}
                onPress={async () => {
                  await confirmLimitChange();
                }}
                disabled={isUpdatingDailyLimit}
                activeOpacity={0.8}
              >
                <Text allowFontScaling={false} style={styles.modalPrimaryText}>
                  {isUpdatingDailyLimit ? "Saving..." : "Confirm"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: 16,
  },
  centeredState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  stateText: {
    ...getTypographyStyle("body", "regular"),
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
  },
  name: {
    ...getTypographyStyle("t3Title"),
    textAlign: "center",
    color: colors.textPrimary,
    marginTop: 14,
  },
  role: {
    ...getTypographyStyle("headline", "regular"),
    textAlign: "center",
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 8,
  },
  sectionSpacing: {
    marginTop: 24,
  },
  limitRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  limitTextWrapper: {
    flex: 1,
  },
  limitTitle: {
    ...getTypographyStyle("body", "semiBold"),
    color: colors.textPrimary,
  },
  limitSubtitle: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    marginTop: 2,
  },
  limitControlWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  limitValueText: {
    ...getTypographyStyle("c1Caption", "semiBold"),
    color: colors.primary,
    minWidth: 60,
    textAlign: "center",
  },
  unavailableText: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textTertiary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(15, 23, 42, 0.48)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  limitModalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: colors.background2,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 22,
  },
  limitModalTitle: {
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
    textAlign: "center",
  },
  limitModalSubtitle: {
    ...getTypographyStyle("headline", "regular"),
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
    marginBottom: 20,
  },
  limitModalControls: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  limitModalValue: {
    ...getTypographyStyle("t3Title"),
    color: colors.primary,
    minWidth: 90,
    textAlign: "center",
  },
  modalActionRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 22,
    gap: 12,
  },
  modalActionButton: {
    flex: 1,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalSecondaryButton: {
    backgroundColor: colors.background,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalPrimaryButton: {
    backgroundColor: colors.primary,
  },
  modalSecondaryText: {
    ...getTypographyStyle("body", "semiBold"),
    color: colors.textPrimary,
  },
  modalPrimaryText: {
    ...getTypographyStyle("body", "semiBold"),
    color: colors.primaryText,
  },
});

export default MemberDetailsScreen;
