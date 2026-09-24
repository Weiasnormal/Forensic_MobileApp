// Admin and tenant routes are kept separate from the analyst-facing endpoint map.

export const ADMIN_API_ENDPOINTS = {
  team: {
    list: "/tenant/members",
    getById: (id: string) => `/tenant/members/${id}`,
    remove: (id: string) => `/tenant/members/${id}`,
  },
  memberRequests: {
    pending: "/tenants/member-requests/pending",
    approve: (requestId: string) =>
      `/tenants/member-requests/${requestId}/approve`,
    reject: (requestId: string) =>
      `/tenants/member-requests/${requestId}/reject`,
  },
  tenant: {
    getMemberById: (id: string) => `/tenant/members/${id}`,
    getAllMembers: "/tenant/members",
    create: "/tenants",
    rename: "/tenants/rename",
    suspendUser: "/admin/suspend-user",
    unsuspendUser: "/admin/unsuspend-user",
    setDailyLimit: "/admin/set-user-daily-limit",
    setMemberCountLimit: "/admin/set-member-count-limit",
    inviteCode: "/tenant/invite-code",
    profile: "/tenant/profile",
  },
} as const;
