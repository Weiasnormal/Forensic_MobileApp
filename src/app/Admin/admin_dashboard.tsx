import AdminNavbar, { type AdminTabKey } from "@/_components/admin/AdminNavbar";
import EmptyStateCard from "@/_components/common/EmptyStateCard";
import ListSectionHeader from "@/_components/common/ListSectionHeader";
import { ScreenStatusBar } from "@/_components/common/ScreenStatusBar";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import {
  getNotificationsEnabledPreference,
  setNotificationsEnabledPreference,
} from "@/services/processingNotifications";
import {
  formatRelativeTime,
  getTeamSummary,
  useAdminStore,
} from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import {
  getCaseSummary,
  useCaseStore,
  type SavedCase,
} from "@/store/caseStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { useUser } from "@/store/userStore";
import { limitDashboardName } from "@/utils/validation";
import { Ionicons } from "@expo/vector-icons";
import * as NavigationBar from "expo-navigation-bar";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import AdminCasesScreen from "./admin_cases";
import AdminStatsScreen from "./admin_stats";
import AdminTeamScreen from "./admin_team";
import {
  MemberRequestCard,
  PendingReviewCard,
  type MemberRequestData,
  type PendingReview,
} from "./cards";
import ProfileScreen from "./ProfileScreen";

const TAB_KEYS: AdminTabKey[] = ["home", "cases", "team", "stats", "profile"];

function resolveTabValue(value: string | string[] | undefined): AdminTabKey {
  const candidate = Array.isArray(value) ? value[0] : value;
  if (candidate && TAB_KEYS.includes(candidate as AdminTabKey)) {
    return candidate as AdminTabKey;
  }
  return "home";
}

function getInitials(first = "", last = "") {
  return ((first[0] || "") + (last[0] || "")).toUpperCase();
}

export default function AdminDashboard() {
  const params = useLocalSearchParams<{
    tab?: string | string[];
    memberId?: string | string[];
    memberName?: string | string[];
  }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState<AdminTabKey>(
    resolveTabValue(params.tab),
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const { user, load, setUser } = useUser();
  const authUser = useAuthStore((state) => state.user);
  const cases = useCaseStore((state) => state.cases);
  const refreshCasesFromBackend = useCaseStore(
    (state) => state.refreshCasesFromBackend,
  );
  const loadAllCases = useCaseStore((state) => state.loadAllCases);

  const fetchTenantProfile = useAdminStore((state) => state.fetchTenantProfile);
  const tenantProfile = useAdminStore((state) => state.tenantProfile);
  const teamMembers = useAdminStore((state) => state.teamMembers);
  const pendingApprovals = useAdminStore((state) => state.pendingApprovals);
  const fetchTeamMembers = useAdminStore((state) => state.fetchTeamMembers);
  const startMemberRequestNotifications = useAdminStore(
    (state) => state.startMemberRequestNotifications,
  );
  const stopMemberRequestNotifications = useAdminStore(
    (state) => state.stopMemberRequestNotifications,
  );
  const approveTeamMember = useAdminStore((state) => state.approveTeamMember);
  const rejectTeamMember = useAdminStore((state) => state.rejectTeamMember);
  const isAdmin =
    authUser?.roles.some((role) => role.toLowerCase().includes("admin")) ??
    false;
  const hasTenant = Boolean(authUser?.tenantId?.trim());

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/User/user_dashboard");
      return;
    }
    if (!hasTenant) {
      router.replace("/_login/_signup/OrganizationCreate");
    }
  }, [hasTenant, isAdmin, router]);

  useEffect(() => {
    if (!isAdmin || !hasTenant) return;
    setActiveTab(resolveTabValue(params.tab));
  }, [hasTenant, isAdmin, params.tab]);

  useEffect(() => {
    if (!isAdmin || !hasTenant) return;
    load();
    void (async () => {
      if (await refreshCasesFromBackend()) await loadAllCases();
    })();
    fetchTenantProfile();
    fetchTeamMembers();
    void startMemberRequestNotifications();
    return () => {
      void stopMemberRequestNotifications();
    };
  }, [
    fetchTeamMembers,
    fetchTenantProfile,
    hasTenant,
    isAdmin,
    load,
    loadAllCases,
    refreshCasesFromBackend,
    startMemberRequestNotifications,
    stopMemberRequestNotifications,
  ]);

  useEffect(() => {
    if (!isAdmin || !hasTenant) return;
    if (tenantProfile?.name && tenantProfile.name !== user.organization) {
      setUser({ organization: tenantProfile.name });
    }
  }, [hasTenant, isAdmin, setUser, tenantProfile?.name, user.organization]);

  useEffect(() => {
    if (!isAdmin || !hasTenant) return;
    if (Platform.OS !== "android") return;
    NavigationBar.setButtonStyleAsync("dark").catch(() => {});
  }, [activeTab, hasTenant, isAdmin]);

  const { totalCases, suspectCount } = getCaseSummary(cases);
  const { activeCount } = getTeamSummary(teamMembers);

  const handleTabChange = (tab: AdminTabKey) => {
    setActiveTab(tab);
    if (params.memberId && tab !== "cases") {
      router.replace({
        pathname: "/Admin/admin_dashboard",
        params: { tab },
      });
    }
  };

  const memberRequests: MemberRequestData[] = useMemo(
    () =>
      pendingApprovals.map((member) => ({
        id: member.id,
        firstName: member.firstName,
        lastName: member.lastName,
        timeAgo: formatRelativeTime(member.joinedAt),
      })),
    [pendingApprovals],
  );

  useEffect(() => {
    if (!isAdmin || !hasTenant) return;
    getNotificationsEnabledPreference().then(setNotificationsEnabled);
  }, [hasTenant, isAdmin]);

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

  if (!isAdmin || !hasTenant) return null;

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.screen}>
      <ScreenStatusBar variant="onLight" />

      {activeTab === "home" ? (
        <View style={[styles.homeHeader, { paddingTop: insets.top + 18 }]}>
          <View style={styles.homeHeaderTop}>
            <View>
              <Text style={styles.homeOrgText}>
                {tenantProfile?.name ||
                  user?.organization ||
                  "Organization unavailable"}
              </Text>
              <Text
                allowFontScaling={false}
                style={styles.homeGreeting}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
              >
                Hello, Admin {limitDashboardName(user?.lastName || "")}
              </Text>
            </View>
            <View style={styles.homeHeaderActions}>
              <View style={styles.homeAvatarCircle}>
                {user && user.avatarUri ? (
                  <Image
                    source={{ uri: user.avatarUri }}
                    style={styles.homeAvatarImage}
                  />
                ) : (
                  <Text allowFontScaling={false} style={styles.homeAvatarText}>
                    {getInitials(user?.firstName || "", user?.lastName || "")}
                  </Text>
                )}
              </View>
            </View>
          </View>
        </View>
      ) : null}

      {activeTab === "home" ? (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[styles.scrollArea, styles.homeScrollArea]}
          showsVerticalScrollIndicator={false}
        >
          <AdminHomeTab
            totalCases={totalCases}
            suspectCount={suspectCount}
            cases={cases}
            activeAnalysts={activeCount}
            memberRequests={memberRequests}
            onApproveRequest={approveTeamMember}
            onRejectRequest={rejectTeamMember}
            onViewTeam={() => handleTabChange("team")}
            onViewAllCases={() => handleTabChange("cases")}
            onViewCase={(caseId) =>
              router.push({
                pathname: "/Admin/CaseResultAdmin",
                params: { caseId },
              })
            }
          />
        </ScrollView>
      ) : activeTab === "cases" ? (
        <AdminCasesScreen
          memberId={
            Array.isArray(params.memberId)
              ? params.memberId[0]
              : params.memberId
          }
          memberName={
            Array.isArray(params.memberName)
              ? params.memberName[0]
              : params.memberName
          }
        />
      ) : activeTab === "team" ? (
        <AdminTeamScreen />
      ) : activeTab === "stats" ? (
        <AdminStatsScreen />
      ) : (
        <ProfileScreen
          initials={getInitials(user?.firstName || "", user?.lastName || "")}
          avatarUri={user?.avatarUri}
          name={
            `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Admin"
          }
          role="Admin"
          organization={
            tenantProfile?.name ||
            user?.organization ||
            "Organization unavailable"
          }
          appVersion="v1.0.0"
          notificationsEnabled={notificationsEnabled}
          onEditProfilePress={() =>
            router.push("/Admin/profileScreens/EditProfileScreen")
          }
          onChangePasswordPress={() =>
            router.push("/Admin/profileScreens/ChangePasswordScreen")
          }
          onOrganizationPress={() =>
            router.push("/Admin/profileScreens/OrganizationScreen")
          }
          onOrgInviteCodePress={() =>
            router.push("/Admin/profileScreens/OrgInviteCodeScreen")
          }
          onManageTeamPress={() => handleTabChange("team")}
          onOrganizationStatsPress={() => handleTabChange("stats")}
          onToggleNotifications={handleToggleNotifications}
          onHelpSupportPress={() =>
            router.push("/Admin/profileScreens/HelpSupportScreen")
          }
          onSignOutPress={async () => {
            await useAuthStore.getState().logout();
            router.replace("/_login/SignInPage");
          }}
        />
      )}

      <AdminNavbar activeTab={activeTab} onTabChange={handleTabChange} />
    </SafeAreaView>
  );
}

function AdminHomeTab({
  totalCases,
  suspectCount,
  cases,
  activeAnalysts,
  memberRequests,
  onApproveRequest,
  onRejectRequest,
  onViewTeam,
  onViewAllCases,
  onViewCase,
}: {
  totalCases: number;
  suspectCount: number;
  cases: SavedCase[];
  activeAnalysts: number;
  memberRequests: MemberRequestData[];
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onViewTeam: () => void;
  onViewAllCases: () => void;
  onViewCase: (caseId: string) => void;
}) {
  const pendingReviews: PendingReview[] = cases
    .filter((item) => item.workflowStatus === "PendingReview")
    .sort((left, right) => {
      const urgentOrder =
        Number(right.priority === "Urgent") -
        Number(left.priority === "Urgent");
      if (urgentOrder !== 0) return urgentOrder;

      return (
        new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      );
    })
    .map((item) => ({
      id: item.caseId,
      caseCode: item.caseCode ?? item.caseId,
      examiner: item.examiner,
      dateLabel: new Date(item.createdAt).toLocaleDateString(),
      verdictLabel:
        item.status === "Suspected"
          ? "Suspected"
          : item.status === "Genuine"
            ? "Genuine"
            : "Awaiting verdict",
      confidence: item.confidence ?? item.Confidence ?? 0,
      priority: item.priority,
    }));

  return (
    <View style={styles.paddedSection}>
      <View style={styles.statsGrid}>
        <View style={styles.statsGridRow}>
          <StatCard
            label="Active Analysts"
            value={String(activeAnalysts)}
            icon="people-outline"
            tint={colors.primary}
          />
          <StatCard
            label="Total Cases"
            value={String(totalCases)}
            icon="folder-open-outline"
            tint={colors.primary}
          />
        </View>
        <View style={styles.statsGridRow}>
          <StatCard
            label="Pending Review"
            value={String(pendingReviews.length)}
            icon="shield-checkmark-outline"
            tint="#D97706"
          />
          <StatCard
            label="Suspected Cases"
            value={String(suspectCount)}
            icon="reader-outline"
            tint="#E24B4A"
          />
        </View>
      </View>

      <ListSectionHeader
        title="Member Requests"
        actionLabel="View all"
        onActionPress={onViewTeam}
      />

      {memberRequests.length > 0 ? (
        <View style={styles.listGroup}>
          {memberRequests.map((member) => (
            <MemberRequestCard
              key={member.id}
              request={member}
              onApprove={onApproveRequest}
              onReject={onRejectRequest}
            />
          ))}
        </View>
      ) : (
        <EmptyStateCard
          title="No pending requests"
          icon={require("../../../assets/images/member_request.png")}
        />
      )}

      <ListSectionHeader
        title="Pending Reviews"
        actionLabel="Manage"
        onActionPress={onViewAllCases}
      />

      {pendingReviews.length > 0 ? (
        <View style={styles.listGroup}>
          {pendingReviews.map((review) => (
            <PendingReviewCard
              key={review.id}
              review={review}
              onReview={(selectedReview) => onViewCase(selectedReview.id)}
            />
          ))}
        </View>
      ) : (
        <EmptyStateCard
          title="No pending reviews"
          subtitle="No pending reviews"
          icon={require("../../../assets/images/pending_request.png")}
        />
      )}
    </View>
  );
}

function StatCard({
  label,
  value,
  icon,
  tint = colors.primary,
}: {
  label: string;
  value: string;
  icon: keyof typeof Ionicons.glyphMap;
  tint?: string;
}) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconWrap, { backgroundColor: `${tint}1A` }]}>
        <Ionicons name={icon} size={24} color={tint} />
      </View>
      <Text allowFontScaling={false} style={styles.statValue}>
        {value}
      </Text>
      <Text allowFontScaling={false} style={styles.statLabel}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  homeHeader: {
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  homeHeaderTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  homeHeaderActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  homeGreeting: {
    ...getTypographyStyle("t3Title"),
    color: colors.textPrimary,
    letterSpacing: -0.5,
    flexShrink: 1,
    marginRight: 8,
  },
  homeAvatarCircle: {
    width: 40,
    height: 40,
    borderRadius: 22,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  homeAvatarImage: {
    width: 40,
    height: 40,
    borderRadius: 22,
  },
  homeAvatarText: {
    ...getTypographyStyle("headline", "bold"),
    color: colors.primaryText,
  },
  homeOrgText: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollArea: {
    paddingHorizontal: 0,
    paddingTop: 0,
    paddingBottom: 18,
    backgroundColor: colors.background,
  },
  homeScrollArea: {
    paddingTop: 14,
  },
  paddedSection: {
    paddingHorizontal: 16,
  },
  statsGrid: {
    gap: 10,
    marginBottom: 18,
  },
  statsGridRow: {
    flexDirection: "row",
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 14,
    width: 175,
    height: 137,
  },
  statIconWrap: {
    width: 45,
    height: 45,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  statValue: {
    ...getTypographyStyle("t2Title"),
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  statLabel: {
    ...getTypographyStyle("l2List"),
    color: colors.label,
    marginTop: 2,
  },
  listGroup: {
    gap: 10,
    marginBottom: 18,
  },
});
