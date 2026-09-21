import Avatar from "@/_components/common/Avatar";
import Divider from "@/_components/common/Divider";
import GroupedCard from "@/_components/common/GroupedCard";
import { ScreenStatusBar } from "@/_components/common/ScreenStatusBar";
import SectionLabel from "@/_components/common/SectionLabel";
import SettingsRow from "@/_components/common/SettingsRow";
import SignOutButton from "@/_components/common/SignOutButton";
import TertiaryButton from "@/_components/common/TertiaryButton";
import ToggleRow from "@/_components/common/ToggleRow";
import DefaultResultViewModal from "@/_components/modals/default_result_view";
import DeleteAccountModal from "@/_components/modals/delete_account";
import ErrorModal from "@/_components/modals/error_modal";
import LogoutModal from "@/_components/modals/logout";
import TypeToConfirmModal from "@/_components/modals/type_to_confirm";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import {
  getNotificationsEnabledPreference,
  setNotificationsEnabledPreference,
} from "@/services/processingNotifications";
import { useAuthStore } from "@/store/authStore";
import { getCaseSummary, useCaseStore } from "@/store/caseStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { useUser } from "@/store/userStore";
import { normalizePersonDisplay } from "@/utils/validation";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { Bell, FileText, Grid, Info, Lock, User } from "lucide-react-native";
import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type DeleteStep = "closed" | "confirm" | "type";

export default function UserProfileScreen() {
  const router = useRouter();
  const { user, load, setUser } = useUser();
  const logout = useAuthStore((state) => state.logout);
  const cases = useCaseStore((state) => state.cases);
  const { totalCases, genuineCount, suspectCount } = getCaseSummary(cases);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load]),
  );
  const [deleteStep, setDeleteStep] = useState<DeleteStep>("closed");
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  const [showDefaultResultViewModal, setShowDefaultResultViewModal] =
    useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [logoutModalVisible, setLogoutModalVisible] = useState(false);

  const initials = getInitials(user.firstName, user.lastName);

  const [deleteError, setDeleteError] = useState(false);

  useEffect(() => {
    getNotificationsEnabledPreference().then(setNotificationsEnabled);
  }, []);

  const handleToggleNotifications = async (value: boolean) => {
    setNotificationsEnabled(value);
    const granted = await setNotificationsEnabledPreference(value);

    if (value && !granted) {
      useFeedbackStore
        .getState()
        .showToast(
          "Enable notifications in your device settings to receive alerts",
          "infoLight",
        );
      return;
    }

    useFeedbackStore
      .getState()
      .showToast(
        value ? "Notifications enabled" : "Notifications disabled",
        "successLight",
      );
  };

  const handleConfirmSignOut = async () => {
    setLogoutModalVisible(false);
    await logout();
    router.replace("/_login/SignInPage");
  };

  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await useAuthStore.getState().deleteAccount();
      setDeleteStep("closed");
      useFeedbackStore
        .getState()
        .showToast("Account deleted successfully", "success");
      router.replace("/_login/SignInPage");
    } catch {
      setDeleteStep("closed");
      setDeleteError(true);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.safeArea}>
      <ScreenStatusBar variant="onBrand" />

      <View style={styles.header}>
        <View style={styles.headerGlow} />

        <View style={styles.headerTopRow}>
          <Avatar
            initials={initials}
            imageUri={user.avatarUri}
            size={64}
            variant="onDark"
          />
          <View style={styles.headerCopy}>
            <Text allowFontScaling={false} style={styles.name}>
              {normalizePersonDisplay(`${user.firstName} ${user.lastName}`)}
            </Text>
            <Text
              allowFontScaling={false}
              style={styles.subtitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {user.role} • {user.organization}
            </Text>
          </View>
        </View>

        <View style={styles.heroStats}>
          <HeroStat value={String(totalCases)} label="CASES" />
          <HeroStat value={String(genuineCount)} label="GENUINE" />
          <HeroStat value={String(suspectCount)} label="SUSPECTED" last />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollArea}
      >
        <SectionLabel label="Account" />
        <GroupedCard>
          <SettingsRow
            icon={User}
            title="Edit Profile"
            onPress={() => router.push("/User/pages/setupAccount")}
          />
          <Divider />
          <SettingsRow
            icon={Lock}
            title="Change Password"
            onPress={() => router.push("/User/pages/ChangePasswordScreen")}
          />
        </GroupedCard>

        <SectionLabel label="Preferences" />
        <GroupedCard>
          <ToggleRow
            icon={Bell}
            title="Notifications"
            value={notificationsEnabled}
            onValueChange={handleToggleNotifications}
          />
          <Divider />
          <SettingsRow
            icon={Grid}
            title="Default Result View"
            rightText={
              user.defaultResultView === "Bounding Box"
                ? "Bounding Box"
                : user.defaultResultView === "Stroke Diff"
                  ? "Stroke Diff"
                  : "Heatmap"
            }
            onPress={() => setShowDefaultResultViewModal(true)}
          />
        </GroupedCard>

        <SectionLabel label="About" />
        <GroupedCard>
          <SettingsRow
            icon={Info}
            title="Help & Support"
            onPress={() => router.push("/User/pages/HelpSupportScreen")}
          />
          <Divider />
          <SettingsRow
            icon={FileText}
            title="App Version"
            rightText="v1.0.0"
            showChevron={false}
          />
        </GroupedCard>

        <SignOutButton
          style={styles.signOutSpacing}
          onPress={() => setLogoutModalVisible(true)}
        />
        <TertiaryButton
          label="Delete Account"
          onPress={() => setDeleteStep("confirm")}
          textColor={colors.danger}
          size="medium"
          style={styles.deleteSpacing}
        />

        <LogoutModal
          visible={logoutModalVisible}
          onCancel={() => setLogoutModalVisible(false)}
          onLogout={handleConfirmSignOut}
        />
        <DeleteAccountModal
          visible={deleteStep === "confirm"}
          variant="user"
          onCancel={() => setDeleteStep("closed")}
          onConfirm={() => setDeleteStep("type")}
        />
        <TypeToConfirmModal
          visible={deleteStep === "type"}
          title="Type DELETE to continue"
          message="This confirms you want to permanently delete your account and all associated data."
          confirmWord="DELETE"
          confirmLabel={isDeletingAccount ? "Deleting..." : "Delete Account"}
          isLoading={isDeletingAccount}
          onCancel={() => setDeleteStep("closed")}
          onConfirm={handleDeleteAccount}
        />
        <ErrorModal
          visible={deleteError}
          title="Error"
          message="Unable to delete account. Please try again."
          onPrimaryPress={() => setDeleteError(false)}
        />
        <DefaultResultViewModal
          visible={showDefaultResultViewModal}
          currentValue={user.defaultResultView ?? "Heatmap"}
          onClose={() => setShowDefaultResultViewModal(false)}
          onSave={async (value) => {
            await setUser({ defaultResultView: value });
            useFeedbackStore
              .getState()
              .showToast("Default result view updated", "successLight");
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

function getInitials(first = "", last = "") {
  return ((first[0] || "") + (last[0] || "")).toUpperCase();
}

function HeroStat({
  value,
  label,
  last,
}: {
  value: string;
  label: string;
  last?: boolean;
}) {
  return (
    <View style={[styles.heroStat, last && styles.heroStatLast]}>
      <Text allowFontScaling={false} style={styles.heroStatValue}>
        {value}
      </Text>
      <Text allowFontScaling={false} style={styles.heroStatLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    position: "relative",
    backgroundColor: colors.primary,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    overflow: "hidden",
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 40,
  },
  headerGlow: {
    position: "absolute",
    right: -100,
    bottom: -170,
    width: 232,
    height: 232,
    borderRadius: 116,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },
  headerTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerCopy: {
    marginLeft: 18,
    flex: 1,
  },
  name: {
    ...getTypographyStyle("t2Title", "bold"),
    color: colors.primaryText,
  },
  subtitle: {
    ...getTypographyStyle("c1Caption"),
    color: "rgba(255, 255, 255, 0.8)",
    marginTop: 2,
  },
  heroStats: {
    flexDirection: "row",
    marginTop: 18,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  heroStat: {
    flex: 1,
    paddingVertical: 14,
    alignItems: "center",
    borderRightWidth: 1,
    borderRightColor: "rgba(255,255,255,0.16)",
  },
  heroStatLast: {
    borderRightWidth: 0,
  },
  heroStatValue: {
    ...getTypographyStyle("t3Title", "bold"),
    fontSize: 19,
    color: colors.primaryText,
    letterSpacing: -0.3,
  },
  heroStatLabel: {
    ...getTypographyStyle("c3Caption", "bold"),
    marginTop: 3,
    color: "rgba(255,255,255,0.64)",
    letterSpacing: 0.5,
  },
  scrollArea: {
    paddingHorizontal: 16,
    paddingTop: 25,
    paddingBottom: 18,
    backgroundColor: colors.background,
  },
  signOutSpacing: {
    marginTop: 12,
  },
  deleteSpacing: {
    marginTop: 8,
  },
});
