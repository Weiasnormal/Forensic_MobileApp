import { ADMIN_API_ENDPOINTS } from "@/constants/adminApi";
import { API_KEY, buildApiUrl } from "@/constants/api";
import { createNotificationConnection } from "@/services/notificationHub";
import { getServerErrorMessage } from "@/utils/networkError";
import { normalizeInviteCode, normalizePersonName } from "@/utils/validation";

import { HubConnection, HubConnectionState } from "@microsoft/signalr";
import { create } from "zustand";
import { getAuthHeader, useAuthStore } from "./authStore";
import { useFeedbackStore } from "./feedbackStore";

let memberRequestConnection: HubConnection | null = null;

const adminLog = {
  info: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${tag} | ${message}`, data ? data : "");
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${tag} | ⚠️  ${message}`, data ? data : "");
  },
};

export type TeamMemberRole = "Analyst" | "Org Admin";
export type TeamMemberStatus = "active" | "pending" | "suspended";

export interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: TeamMemberRole;
  status: TeamMemberStatus;
  casesHandled: number;
  joinedAt: string | null;
}

export interface TenantMemberDetail {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  isSuspended: boolean;
  dailyCaseLimit: number | null;
}

interface AdminStore {
  teamMembers: TeamMember[];
  pendingApprovals: TeamMember[];
  isLoadingTeam: boolean;
  teamLoadError: string | null;
  isUsingMockTeam: boolean;

  isGeneratingInvite: boolean;

  inviteCode: string | null;
  isUsingMockInvite: boolean;
  fetchOrGenerateInviteCode: () => Promise<string>;

  fetchTeamMembers: () => Promise<void>;
  startMemberRequestNotifications: () => Promise<void>;
  stopMemberRequestNotifications: () => Promise<void>;
  approveTeamMember: (id: string) => Promise<void>;
  rejectTeamMember: (id: string) => Promise<void>;
  suspendTeamMember: (id: string) => Promise<void>;
  unsuspendTeamMember: (id: string) => Promise<void>;
  removeTeamMember: (id: string) => Promise<void>;

  memberDetail: TenantMemberDetail | null;
  isLoadingMemberDetail: boolean;
  memberDetailError: string | null;
  fetchMemberById: (userId: string) => Promise<TenantMemberDetail | null>;
  setUserDailyCaseLimit: (
    userId: string,
    dailyLimit: number | null,
  ) => Promise<boolean>;
  setMemberCountLimit: (memberLimit: number) => Promise<boolean>;

  isCreatingTenant: boolean;
  createTenantError: string | null;
  createTenant: (name: string) => Promise<string | null>;
  renameTenant: (newName: string) => Promise<boolean>;

  tenantProfile: {
    name: string;
    inviteCode: string;
    memberCount: number;
    memberCountLimit: number;
    createdAt: string;
  } | null;
  isLoadingTenantProfile: boolean;
  fetchTenantProfile: () => Promise<void>;
  clearAdminState: () => void;
}

function normalizeTenantMemberDetail(record: any): TenantMemberDetail | null {
  const id = record?.id?.toString().trim();
  if (!id) return null;

  const rawDailyLimit =
    record?.dailyCaseLimit ??
    record?.DailyCaseLimit ??
    record?.daily_limit ??
    record?.Daily_Limit ??
    record?.dailyLimit ??
    record?.DailyLimit ??
    null;

  const parsedDailyLimit =
    rawDailyLimit === null || rawDailyLimit === undefined
      ? null
      : Number(rawDailyLimit);

  return {
    id,
    firstName: normalizePersonName(record.firstName?.trim() || ""),
    lastName: normalizePersonName(record.lastName?.trim() || ""),
    email: record.email?.trim() || "",
    role: record.role?.trim() || "Analyst",
    isSuspended: Boolean(record.isSuspended ?? record.IsSuspended),
    dailyCaseLimit:
      parsedDailyLimit !== null && Number.isFinite(parsedDailyLimit)
        ? Math.max(0, Math.trunc(parsedDailyLimit))
        : null,
  };
}

function isProtectedMemberRole(role: string | undefined): boolean {
  const normalizedRole = role?.trim().toLowerCase() ?? "";
  return normalizedRole.includes("owner") || normalizedRole.includes("admin");
}

function normalizeTeamMemberRole(role: unknown): TeamMemberRole {
  const normalizedRole = String(role ?? "")
    .trim()
    .toLowerCase();
  return normalizedRole.includes("admin") || normalizedRole.includes("owner")
    ? "Org Admin"
    : "Analyst";
}

function getRecordTenantId(record: any): string | null {
  const value =
    record?.tenantId ??
    record?.TenantId ??
    record?.organizationId ??
    record?.OrganizationId;
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function belongsToCurrentTenant(record: any): boolean {
  const currentTenantId = useAuthStore.getState().user?.tenantId?.trim();
  const recordTenantId = getRecordTenantId(record);
  return (
    Boolean(currentTenantId) &&
    (!recordTenantId || recordTenantId === currentTenantId)
  );
}

//"3 days ago" / "2 months ago" style label from an ISO date string.
export function formatRelativeTime(dateIso: string | null): string {
  if (!dateIso) return "Recently";

  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return "Recently";

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? "s" : ""} ago`;
}

export const useAdminStore = create<AdminStore>((set, get) => ({
  teamMembers: [],
  pendingApprovals: [],
  isLoadingTeam: false,
  teamLoadError: null,
  isUsingMockTeam: false,
  isGeneratingInvite: false,

  inviteCode: null,
  isUsingMockInvite: false,

  memberDetail: null,
  isLoadingMemberDetail: false,
  memberDetailError: null,

  isCreatingTenant: false,
  createTenantError: null,

  tenantProfile: null,
  isLoadingTenantProfile: false,

  clearAdminState: () => {
    void get().stopMemberRequestNotifications();
    set({
      teamMembers: [],
      pendingApprovals: [],
      isLoadingTeam: false,
      teamLoadError: null,
      isUsingMockTeam: false,
      isGeneratingInvite: false,
      inviteCode: null,
      isUsingMockInvite: false,
      memberDetail: null,
      isLoadingMemberDetail: false,
      memberDetailError: null,
      isCreatingTenant: false,
      createTenantError: null,
      tenantProfile: null,
      isLoadingTenantProfile: false,
    });
  },

  createTenant: async (name: string) => {
    adminLog.info("AdminStore:Tenant", `Creating tenant "${name}"`);
    set({ isCreatingTenant: true, createTenantError: null });

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.create),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ Name: name }),
        },
      );

      if (!response.ok) {
        throw new Error(getServerErrorMessage(response.status));
      }

      const tokenResponse = (await response.json()) as {
        accessToken?: string;
        AccessToken?: string;
        expireAt?: string;
        ExpireAt?: string;
      };
      const newAccessToken =
        tokenResponse.accessToken ?? tokenResponse.AccessToken;

      if (!newAccessToken) {
        throw new Error(
          "Create tenant response did not include an access token",
        );
      }

      const { useAuthStore } = await import("./authStore");
      useAuthStore
        .getState()
        .applyNewAccessToken(
          newAccessToken,
          tokenResponse.expireAt ?? tokenResponse.ExpireAt,
        );

      const tenantId = useAuthStore.getState().user?.tenantId ?? null;

      set({ isCreatingTenant: false });
      adminLog.info("AdminStore:Tenant", `✓ Tenant created, session upgraded`, {
        tenantId,
      });
      return tenantId;
    } catch (error) {
      adminLog.warn("AdminStore:Tenant", "Unable to create tenant", error);
      set({
        isCreatingTenant: false,
        createTenantError:
          error instanceof Error
            ? error.message
            : "Unable to create organization",
      });
      return null;
    }
  },

  renameTenant: async (newName: string) => {
    const normalizedName = newName.trim();
    if (!normalizedName) return false;

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.rename),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
          body: JSON.stringify({ newName: normalizedName }),
        },
      );

      if (!response.ok) {
        throw new Error(getServerErrorMessage(response.status));
      }

      await get().fetchTenantProfile();
      return true;
    } catch (error) {
      adminLog.warn("AdminStore:Tenant", "Unable to rename tenant", error);
      return false;
    }
  },

  setMemberCountLimit: async (memberLimit: number) => {
    const normalizedLimit = Math.max(0, Math.trunc(memberLimit));

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.setMemberCountLimit),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
          body: JSON.stringify(normalizedLimit),
        },
      );

      if (!response.ok) {
        throw new Error(`Set member limit failed (${response.status})`);
      }

      set((state) => ({
        tenantProfile: state.tenantProfile
          ? { ...state.tenantProfile, memberCountLimit: normalizedLimit }
          : state.tenantProfile,
      }));
      useFeedbackStore
        .getState()
        .showToast(`Member limit set to ${normalizedLimit}`, "success");
      return true;
    } catch (error) {
      adminLog.warn(
        "AdminStore:Tenant",
        "Unable to update member count limit",
        error,
      );
      useFeedbackStore
        .getState()
        .showToast("Unable to update member limit. Try again.", "error");
      return false;
    }
  },

  fetchTenantProfile: async () => {
    set({ isLoadingTenantProfile: true });
    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.profile),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        },
      );
      if (!response.ok) throw new Error(getServerErrorMessage(response.status));

      const json = await response.json();
      set({
        tenantProfile: {
          name: json.name ?? json.Name ?? "",
          inviteCode: json.inviteCode ?? json.InviteCode ?? "",
          memberCount: Number(json.memberCount ?? json.MemberCount ?? 0),
          memberCountLimit: Number(
            json.memberCountLimit ?? json.MemberCountLimit ?? 0,
          ),
          createdAt: json.createdAt ?? json.CreatedAt ?? "",
        },
        inviteCode: json.inviteCode ?? json.InviteCode ?? get().inviteCode,
        isUsingMockInvite: false,
        isLoadingTenantProfile: false,
      });
    } catch (error) {
      adminLog.warn(
        "AdminStore:Profile",
        "Unable to fetch tenant profile",
        error,
      );
      set({ isLoadingTenantProfile: false });
    }
  },

  fetchMemberById: async (userId: string) => {
    adminLog.info("AdminStore:MemberDetail", `Fetching member ${userId}`);
    if (!get().teamMembers.some((member) => member.id === userId)) {
      set({
        isLoadingMemberDetail: false,
        memberDetailError: "This member is not part of your organization.",
      });
      return null;
    }
    set({ isLoadingMemberDetail: true, memberDetailError: null });

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.getMemberById(userId)),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error(`Unable to load member (${response.status})`);
      }

      const json = await response.json();
      if (!belongsToCurrentTenant(json)) {
        throw new Error("This member is not part of your organization.");
      }
      const detail = normalizeTenantMemberDetail(json);

      if (!detail) {
        throw new Error("Backend returned malformed member data");
      }

      set({ memberDetail: detail, isLoadingMemberDetail: false });
      return detail;
    } catch (error) {
      adminLog.warn(
        "AdminStore:MemberDetail",
        "Unable to fetch member by id",
        error,
      );
      set({
        isLoadingMemberDetail: false,
        memberDetailError:
          error instanceof Error ? error.message : "Unable to load member",
      });
      return null;
    }
  },

  setUserDailyCaseLimit: async (userId: string, dailyLimit: number | null) => {
    try {
      const normalizedLimit =
        dailyLimit === null ? null : Math.max(0, Math.trunc(dailyLimit));

      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.setDailyLimit),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
          body: JSON.stringify({
            UserId: userId,
            DailyLimit: normalizedLimit,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`Set daily limit failed (${response.status})`);
      }

      set((state) => ({
        memberDetail:
          state.memberDetail?.id === userId
            ? { ...state.memberDetail, dailyCaseLimit: normalizedLimit }
            : state.memberDetail,
      }));

      useFeedbackStore
        .getState()
        .showToast(
          normalizedLimit === null
            ? "Daily case limit cleared"
            : `Daily case limit set to ${normalizedLimit}`,
          "success",
        );
      return true;
    } catch (error) {
      adminLog.warn(
        "AdminStore:MemberDetail",
        `Unable to update daily limit for ${userId}`,
        error,
      );
      useFeedbackStore
        .getState()
        .showToast("Unable to update daily case limit. Try again.", "error");
      return false;
    }
  },

  fetchTeamMembers: async () => {
    set({ isLoadingTeam: true, teamLoadError: null });

    try {
      const [membersRes, pendingRes] = await Promise.all([
        fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.list), {
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        }),
        fetch(buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.pending), {
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        }),
      ]);

      if (!membersRes.ok)
        throw new Error(`Unable to load team (${membersRes.status})`);

      const membersJson = await membersRes.json();
      const activeMembers: TeamMember[] = (
        Array.isArray(membersJson) ? membersJson : []
      )
        .filter((m: any) => belongsToCurrentTenant(m))
        .map((m: any) => ({
          id: m.id,
          firstName: normalizePersonName(m.firstName || "Unknown"),
          lastName: normalizePersonName(m.lastName || ""),
          email: m.email || "—",
          role: normalizeTeamMemberRole(m.role ?? m.Role ?? m.roles ?? m.Roles),
          status:
            (m.isSuspended ?? m.IsSuspended)
              ? ("suspended" as const)
              : ("active" as const),
          casesHandled: Number(m.casesHandled ?? m.CasesHandled ?? 0),
          joinedAt: null, // backend TenantMemberDto has no join date field — genuinely unavailable
        }))
        .filter((member) => member.role === "Analyst");

      let pendingMembers: TeamMember[] = [];
      if (pendingRes.ok) {
        const pendingJson = await pendingRes.json();
        pendingMembers = (Array.isArray(pendingJson) ? pendingJson : [])
          .filter((r: any) => belongsToCurrentTenant(r))
          .map((r: any) => {
            const [firstName, ...rest] = String(r.name ?? "")
              .trim()
              .split(/\s+/);
            return {
              id: r.requestId, // approve/reject use the REQUEST id, not a user id
              firstName: normalizePersonName(firstName || "Unknown"),
              lastName: normalizePersonName(rest.join(" ")),
              email: "—",
              role: "Analyst" as const,
              status: "pending" as const,
              casesHandled: 0,
              joinedAt: r.requestedAt ?? null,
            };
          });
      }

      set({
        teamMembers: [...activeMembers, ...pendingMembers],
        pendingApprovals: pendingMembers,
        isLoadingTeam: false,
        isUsingMockTeam: false,
      });
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        "Unable to load team from backend",
        error,
      );
      set({
        teamMembers: [],
        pendingApprovals: [],
        isLoadingTeam: false,
        teamLoadError:
          error instanceof Error
            ? error.message
            : "Unable to load team members",
        isUsingMockTeam: false,
      });
    }
  },

  startMemberRequestNotifications: async () => {
    if (
      memberRequestConnection?.state === HubConnectionState.Connected ||
      memberRequestConnection?.state === HubConnectionState.Connecting ||
      memberRequestConnection?.state === HubConnectionState.Reconnecting
    ) {
      return;
    }

    const connection = createNotificationConnection();
    memberRequestConnection = connection;

    connection.on("MemberRequestCreated", () => {
      void get().fetchTeamMembers();
    });

    connection.on("UserDeleted", () => {
      void get().fetchTeamMembers();
      void get().fetchTenantProfile();
    });

    connection.on("TenantRenamed", () => {
      void get().fetchTenantProfile();
      void get().fetchTeamMembers();
    });

    connection.on("NewCaseResult", () => {
      void get().fetchTeamMembers();
      void get().fetchTenantProfile();
    });

    connection.onreconnected(() => {
      void get().fetchTeamMembers();
    });

    connection.onclose((error) => {
      if (error) {
        adminLog.warn(
          "AdminStore:SignalR",
          "Member request notifications disconnected",
          error,
        );
        useFeedbackStore
          .getState()
          .showToast(
            "Live member requests are temporarily unavailable. We will try to reconnect.",
            "infoLight",
          );
      }
    });

    try {
      await connection.start();
      adminLog.info(
        "AdminStore:SignalR",
        "Member request notifications connected",
      );
    } catch (error) {
      adminLog.warn(
        "AdminStore:SignalR",
        "Unable to connect member request notifications",
        error,
      );
      if (connection.state !== HubConnectionState.Disconnected) {
        await connection.stop().catch(() => {});
      }
      if (memberRequestConnection === connection)
        memberRequestConnection = null;
    }
  },

  stopMemberRequestNotifications: async () => {
    const connection = memberRequestConnection;
    memberRequestConnection = null;
    if (!connection || connection.state === HubConnectionState.Disconnected)
      return;
    await connection.stop().catch(() => {});
  },

  approveTeamMember: async (requestId) => {
    const member = get().pendingApprovals.find((item) => item.id === requestId);
    if (!member) {
      useFeedbackStore
        .getState()
        .showToast("Member request is outside your organization", "infoLight");
      return;
    }
    const previousTeamMembers = get().teamMembers;
    const previousPendingApprovals = get().pendingApprovals;

    set((state) => ({
      teamMembers: state.teamMembers.map((m) =>
        m.id === requestId ? { ...m, status: "active" } : m,
      ),
      pendingApprovals: state.pendingApprovals.filter(
        (m) => m.id !== requestId,
      ),
    }));
    if (get().isUsingMockTeam) {
      useFeedbackStore
        .getState()
        .showToast("Member request approved", "success");
      return;
    }

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.approve(requestId)),
        {
          method: "POST",
          headers: { "X-Api-Key": API_KEY || "", ...getAuthHeader() },
        },
      );
      if (!response.ok) throw new Error(getServerErrorMessage(response.status));
      useFeedbackStore
        .getState()
        .showToast("Member request approved", "success");
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        `Unable to approve request ${requestId}`,
        error,
      );
      set({
        teamMembers: previousTeamMembers,
        pendingApprovals: previousPendingApprovals,
      });
      useFeedbackStore
        .getState()
        .showToast("Unable to approve member request. Try again.", "error");
    }
  },

  rejectTeamMember: async (requestId) => {
    const member = get().pendingApprovals.find((item) => item.id === requestId);
    if (!member) {
      useFeedbackStore
        .getState()
        .showToast("Member request is outside your organization", "infoLight");
      return;
    }
    const previousTeamMembers = get().teamMembers;
    const previousPendingApprovals = get().pendingApprovals;

    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== requestId),
      pendingApprovals: state.pendingApprovals.filter(
        (m) => m.id !== requestId,
      ),
    }));
    if (get().isUsingMockTeam) {
      useFeedbackStore
        .getState()
        .showToast("Member request declined", "success");
      return;
    }

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.reject(requestId)),
        {
          method: "POST",
          headers: { "X-Api-Key": API_KEY || "", ...getAuthHeader() },
        },
      );
      if (!response.ok) throw new Error(getServerErrorMessage(response.status));
      useFeedbackStore
        .getState()
        .showToast("Member request declined", "success");
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        `Unable to reject request ${requestId}`,
        error,
      );
      set({
        teamMembers: previousTeamMembers,
        pendingApprovals: previousPendingApprovals,
      });
      useFeedbackStore
        .getState()
        .showToast("Unable to decline member request. Try again.", "error");
    }
  },

  suspendTeamMember: async (id) => {
    if (!get().teamMembers.some((member) => member.id === id)) {
      useFeedbackStore
        .getState()
        .showToast("Member is outside your organization", "infoLight");
      return;
    }
    const previousTeamMembers = get().teamMembers;
    const previousMemberDetail = get().memberDetail;
    set((state) => ({
      teamMembers: state.teamMembers.map((member) =>
        member.id === id ? { ...member, status: "suspended" } : member,
      ),
      memberDetail:
        state.memberDetail?.id === id
          ? { ...state.memberDetail, isSuspended: true }
          : state.memberDetail,
    }));

    if (get().isUsingMockTeam) {
      useFeedbackStore.getState().showToast("Member suspended", "success");
      return;
    }

    try {
      const response = await fetch(
        buildApiUrl(`${ADMIN_API_ENDPOINTS.tenant.suspendUser}?UserId=${id}`),
        {
          method: "POST",
          headers: {
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        },
      );
      if (!response.ok) throw new Error(getServerErrorMessage(response.status));
      useFeedbackStore.getState().showToast("Member suspended", "success");
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        `Unable to suspend member ${id} on the backend`,
        error,
      );
      set({
        teamMembers: previousTeamMembers,
        memberDetail: previousMemberDetail,
      });
      useFeedbackStore
        .getState()
        .showToast("Unable to suspend member. Try again.", "error");
    }
  },

  unsuspendTeamMember: async (id) => {
    const targetMember = get().teamMembers.find((member) => member.id === id);
    if (!targetMember || targetMember.status !== "suspended") {
      useFeedbackStore
        .getState()
        .showToast("This member is not currently suspended.", "infoLight");
      return;
    }

    const previousTeamMembers = get().teamMembers;
    const previousMemberDetail = get().memberDetail;
    set((state) => ({
      teamMembers: state.teamMembers.map((member) =>
        member.id === id ? { ...member, status: "active" } : member,
      ),
      memberDetail:
        state.memberDetail?.id === id
          ? { ...state.memberDetail, isSuspended: false }
          : state.memberDetail,
    }));

    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.unsuspendUser),
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
          body: JSON.stringify(id),
        },
      );
      if (!response.ok) {
        throw new Error(`Unsuspend failed (${response.status})`);
      }
      useFeedbackStore.getState().showToast("Member unsuspended", "success");
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        `Unable to unsuspend member ${id} on the backend`,
        error,
      );
      set({
        teamMembers: previousTeamMembers,
        memberDetail: previousMemberDetail,
      });
      useFeedbackStore
        .getState()
        .showToast("Unable to unsuspend member. Try again.", "error");
    }
  },

  removeTeamMember: async (userId: string) => {
    const currentUser = useAuthStore.getState().user;
    const targetMember = get().teamMembers.find(
      (member) => member.id === userId,
    );
    if (!targetMember) {
      useFeedbackStore
        .getState()
        .showToast("Member is outside your organization", "infoLight");
      return;
    }
    if (
      currentUser?.userId === userId ||
      isProtectedMemberRole(targetMember?.role)
    ) {
      useFeedbackStore
        .getState()
        .showToast("Admins cannot be removed", "infoLight");
      return;
    }

    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== userId),
    }));
    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.team.remove(userId)),
        {
          method: "DELETE",
          headers: { "X-Api-Key": API_KEY || "", ...getAuthHeader() },
        },
      );
      if (!response.ok) throw new Error(getServerErrorMessage(response.status));
    } catch (error) {
      adminLog.warn(
        "AdminStore:Team",
        `Unable to remove member ${userId}`,
        error,
      );
    }
  },

  fetchOrGenerateInviteCode: async () => {
    const existing = get().inviteCode;
    if (existing) return existing;

    set({ isGeneratingInvite: true });
    try {
      const response = await fetch(
        buildApiUrl(ADMIN_API_ENDPOINTS.tenant.inviteCode),
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "X-Api-Key": API_KEY || "",
            ...getAuthHeader(),
          },
        },
      );

      if (!response.ok) {
        throw new Error(getServerErrorMessage(response.status));
      }

      const responseText = await response.text();
      let responseValue: unknown = responseText;
      try {
        responseValue = JSON.parse(responseText);
      } catch {
        // The endpoint may return either a plain code or a JSON payload.
      }

      const responseObject =
        typeof responseValue === "object" && responseValue !== null
          ? (responseValue as Record<string, unknown>)
          : null;
      const rawCode =
        typeof responseValue === "string"
          ? responseValue
          : (responseObject?.inviteCode ??
            responseObject?.InviteCode ??
            responseObject?.code ??
            responseObject?.Code);
      const code =
        typeof rawCode === "string" ? normalizeInviteCode(rawCode) : null;
      if (!code) throw new Error("Backend returned no invite code");

      set({
        inviteCode: code,
        isUsingMockInvite: false,
        isGeneratingInvite: false,
      });
      return code;
    } catch (error) {
      adminLog.warn(
        "AdminStore:Invite",
        "Unable to fetch invite code from the backend",
        error,
      );
      set({
        inviteCode: null,
        isUsingMockInvite: false,
        isGeneratingInvite: false,
      });
      return "";
    }
  },
}));

export function getTeamSummary(members: TeamMember[]) {
  const analysts = members.filter((member) => member.role === "Analyst");
  const totalAnalysts = analysts.filter(
    (member) => member.status !== "pending",
  ).length;
  const activeCount = analysts.filter(
    (member) => member.status === "active",
  ).length;
  const pendingCount = analysts.filter(
    (member) => member.status === "pending",
  ).length;
  const suspendedCount = analysts.filter(
    (member) => member.status === "suspended",
  ).length;

  return { totalAnalysts, activeCount, pendingCount, suspendedCount };
}
