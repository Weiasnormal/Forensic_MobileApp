// Admin-specific endpoints, kept separate from constants/api.ts so we don't
// touch the existing analyst-facing endpoint map.
//
// NOTE: None of these routes exist yet on the backend (Avera.WebApi/Endpoints/Admin/
// is currently an empty folder). The store built against these endpoints will
// fail gracefully (empty state) until the corresponding IEndpoint handlers are
// added server-side. Suggested shape for the backend team:
//
//   GET    /admin/team                 -> list of { id, firstName, lastName, email, role, status, casesHandled, createdAt }
//   POST   /admin/team/{id}/approve    -> approve a pending analyst signup
//   POST   /admin/team/{id}/reject     -> deny a pending analyst signup
//   POST   /admin/team/{id}/suspend    -> suspend/deactivate a team member
//   POST   /admin/team/invite          -> generate a new invite code, returns { code }
//   GET    /admin/organization         -> org profile/settings
//   PUT    /admin/organization         -> update org profile/settings

export const ADMIN_API_ENDPOINTS = {
  team: {
    list: '/admin/team',
    approve: (id: string) => `/admin/team/${id}/approve`,
    reject: (id: string) => `/admin/team/${id}/reject`,
    suspend: (id: string) => `/admin/team/${id}/suspend`,
    invite: '/admin/team/invite',
  },
  organization: {
    get: '/admin/organization',
    update: '/admin/organization',
  },
  tenant: {
    getMemberById: (id: string) => `/tenant/member/${id}`,
    getAllMembers: '/tenant/member',
    create: '/tenants',
  },
} as const;