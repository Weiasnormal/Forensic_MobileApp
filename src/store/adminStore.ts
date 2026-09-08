import { create } from 'zustand';
import { API_KEY, buildApiUrl } from '@/constants/api';
import { ADMIN_API_ENDPOINTS } from '@/constants/adminApi';
import { MOCK_TEAM_MEMBERS } from '@/constants/adminMockData';
import { getAuthHeader } from './authStore';
import { useFeedbackStore } from './feedbackStore';

const adminLog = {
  info: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${tag} | ${message}`, data ? data : '');
  },
  warn: (tag: string, message: string, data?: any) => {
    const timestamp = new Date().toISOString();
    console.warn(`[${timestamp}] ${tag} | ⚠️  ${message}`, data ? data : '');
  },
};

export type TeamMemberRole = 'Analyst' | 'Org Admin';
export type TeamMemberStatus = 'active' | 'pending' | 'suspended';

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
  approveTeamMember: (id: string) => Promise<void>;
  rejectTeamMember: (id: string) => Promise<void>;
  suspendTeamMember: (id: string) => Promise<void>;
  generateInviteCode: () => Promise<string | null>;

  memberDetail: TenantMemberDetail | null;
  isLoadingMemberDetail: boolean;
  memberDetailError: string | null;
  fetchMemberById: (userId: string) => Promise<TenantMemberDetail | null>;

  isCreatingTenant: boolean;
  createTenantError: string | null;
  createTenant: (name: string) => Promise<string | null>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function normalizeRole(value: unknown): TeamMemberRole {
  if (value === 'Admin' || value === 'OrgAdmin' || value === 'Org Admin' || value === 1) {
    return 'Org Admin';
  }
  return 'Analyst';
}

function normalizeStatus(value: unknown): TeamMemberStatus {
  if (value === 'pending' || value === 'Pending') return 'pending';
  if (value === 'suspended' || value === 'Suspended') return 'suspended';
  return 'active';
}

function normalizeTeamMember(record: any): TeamMember | null {
  const id = record?.id?.toString().trim();
  if (!id) return null;

  return {
    id,
    firstName: record.firstName?.trim() || record.givenName?.trim() || 'Unknown',
    lastName: record.lastName?.trim() || record.familyName?.trim() || '',
    email: record.email?.trim() || '—',
    role: normalizeRole(record.role),
    status: normalizeStatus(record.status),
    casesHandled: Number(record.casesHandled ?? 0),
    joinedAt: record.joinedAt ?? record.createdAt ?? null,
  };
}

function normalizeTenantMemberDetail(record: any): TenantMemberDetail | null {
  const id = record?.id?.toString().trim();
  if (!id) return null;
  return {
    id,
    firstName: record.firstName?.trim() || '',
    lastName: record.lastName?.trim() || '',
    email: record.email?.trim() || '',
  };
}

//"3 days ago" / "2 months ago" style label from an ISO date string. 
export function formatRelativeTime(dateIso: string | null): string {
  if (!dateIso) return 'Recently';

  const date = new Date(dateIso);
  if (Number.isNaN(date.getTime())) return 'Recently';

  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) return 'Today';
  if (diffDays === 1) return '1 day ago';
  if (diffDays < 30) return `${diffDays} days ago`;

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears > 1 ? 's' : ''} ago`;
}

function generateMockInviteCode(): string {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const alphanumeric = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let prefix = '';
  let suffix = '';
  for (let i = 0; i < 3; i++) prefix += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 4; i++) suffix += alphanumeric[Math.floor(Math.random() * alphanumeric.length)];
  return `${prefix}-${suffix}`;
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

  createTenant: async (name: string) => {
    adminLog.info('AdminStore:Tenant', `Creating tenant "${name}"`);
    set({ isCreatingTenant: true, createTenantError: null });

    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.tenant.create), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ Name: name }),
      });

      if (!response.ok) {
        throw new Error(`Create tenant failed (${response.status})`);
      }

      // POST /tenants returns the raw NEW ACCESS TOKEN (string), regenerated
      // with the TenantId claim — NOT a tenant id. See CreateTenantCommandHandler.
      const newAccessToken: string = await response.json();

      const { useAuthStore } = await import('./authStore');
      useAuthStore.getState().applyNewAccessToken(newAccessToken);

      const tenantId = useAuthStore.getState().user?.tenantId ?? null;

      set({ isCreatingTenant: false });
      adminLog.info('AdminStore:Tenant', `✓ Tenant created, session upgraded`, { tenantId });
      return tenantId;
    } catch (error) {
      adminLog.warn('AdminStore:Tenant', 'Unable to create tenant', error);
      set({
        isCreatingTenant: false,
        createTenantError: error instanceof Error ? error.message : 'Unable to create organization',
      });
      return null;
    }
  },

  fetchMemberById: async (userId: string) => {
    adminLog.info('AdminStore:MemberDetail', `Fetching member ${userId}`);
    set({ isLoadingMemberDetail: true, memberDetailError: null });

    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.tenant.getMemberById(userId)), {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Unable to load member (${response.status})`);
      }

      const json = await response.json();
      const detail = normalizeTenantMemberDetail(json);

      if (!detail) {
        throw new Error('Backend returned malformed member data');
      }

      set({ memberDetail: detail, isLoadingMemberDetail: false });
      return detail;
    } catch (error) {
      adminLog.warn('AdminStore:MemberDetail', 'Unable to fetch member by id', error);
      set({
        isLoadingMemberDetail: false,
        memberDetailError: error instanceof Error ? error.message : 'Unable to load member',
      });
      return null;
    }
  },

  fetchTeamMembers: async () => {
    set({ isLoadingTeam: true, teamLoadError: null });

    try {
      const [membersRes, pendingRes] = await Promise.all([
        fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.list), {
          headers: { Accept: 'application/json', 'X-Api-Key': API_KEY || '', ...getAuthHeader() },
        }),
        fetch(buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.pending), {
          headers: { Accept: 'application/json', 'X-Api-Key': API_KEY || '', ...getAuthHeader() },
        }),
      ]);

      if (!membersRes.ok) throw new Error(`Unable to load team (${membersRes.status})`);

      const membersJson = await membersRes.json();
      const activeMembers: TeamMember[] = (Array.isArray(membersJson) ? membersJson : [])
        .map((m: any) => ({
          id: m.id,
          firstName: m.firstName || 'Unknown',
          lastName: m.lastName || '',
          email: m.email || '—',
          role: 'Analyst' as const,   // backend DTO has no role field yet
          status: 'active' as const, // /tenant/members only returns joined users
          casesHandled: 0,           // backend DTO has no casesHandled field yet
          joinedAt: null,
        }));

      let pendingMembers: TeamMember[] = [];
      if (pendingRes.ok) {
        const pendingJson = await pendingRes.json();
        pendingMembers = (Array.isArray(pendingJson) ? pendingJson : []).map((r: any) => {
          const [firstName, ...rest] = String(r.name ?? '').trim().split(/\s+/);
          return {
            id: r.requestId,               // approve/reject use the REQUEST id, not a user id
            firstName: firstName || 'Unknown',
            lastName: rest.join(' '),
            email: '—',
            role: 'Analyst' as const,
            status: 'pending' as const,
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
      adminLog.warn('AdminStore:Team', 'Falling back to mock roster', error);
      set({
        teamMembers: MOCK_TEAM_MEMBERS,
        pendingApprovals: MOCK_TEAM_MEMBERS.filter((m) => m.status === 'pending'),
        isLoadingTeam: false,
        teamLoadError: error instanceof Error ? error.message : 'Unable to load team members',
        isUsingMockTeam: true,
      });
    }
  },

  approveTeamMember: async (requestId) => {
    set((state) => ({
      teamMembers: state.teamMembers.map((m) => (m.id === requestId ? { ...m, status: 'active' } : m)),
      pendingApprovals: state.pendingApprovals.filter((m) => m.id !== requestId),
    }));
    useFeedbackStore.getState().showToast('Member request approved', 'success');
    if (get().isUsingMockTeam) return;

    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.approve(requestId)), {
        method: 'POST',
        headers: { 'X-Api-Key': API_KEY || '', ...getAuthHeader() },
      });
      if (!response.ok) throw new Error(`Approve failed (${response.status})`);
    } catch (error) {
      adminLog.warn('AdminStore:Team', `Unable to approve request ${requestId}`, error);
    }
  },

  rejectTeamMember: async (requestId) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter((m) => m.id !== requestId),
      pendingApprovals: state.pendingApprovals.filter((m) => m.id !== requestId),
    }));
    useFeedbackStore.getState().showToast('Member request declined', 'success');
    if (get().isUsingMockTeam) return;

    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.memberRequests.reject(requestId)), {
        method: 'POST',
        headers: { 'X-Api-Key': API_KEY || '', ...getAuthHeader() },
      });
      if (!response.ok) throw new Error(`Reject failed (${response.status})`);
    } catch (error) {
      adminLog.warn('AdminStore:Team', `Unable to reject request ${requestId}`, error);
    }
  },

  suspendTeamMember: async (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.map((member) =>
        member.id === id ? { ...member, status: 'suspended' } : member,
      ),
    }));

    if (get().isUsingMockTeam) return;

    try {
        const response = await fetch(
          buildApiUrl(`${ADMIN_API_ENDPOINTS.tenant.suspendUser}?UserId=${id}`),
          {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
          },
        );
      if (!response.ok) throw new Error(`Suspend failed (${response.status})`);
    } catch (error) {
      adminLog.warn('AdminStore:Team', `Unable to suspend member ${id} on the backend`, error);
    }
  },

  generateInviteCode: async () => {
    set({ isGeneratingInvite: true });
    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.invite), {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Invite generation failed (${response.status})`);
      }

      const json = await response.json();
      return json?.code ?? json?.inviteCode ?? null;
    } catch (error) {
      adminLog.warn('AdminStore:Team', 'Unable to generate invite code', error);
      return null;
    } finally {
      set({ isGeneratingInvite: false });
    }
  },

  fetchOrGenerateInviteCode: async () => {
    const existing = get().inviteCode;
    if (existing) return existing;

    set({ isGeneratingInvite: true });
    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.invite), {
        method: 'POST',
        headers: {
          'X-Api-Key': API_KEY || '',
          ...getAuthHeader(),
        },
      });

      if (!response.ok) {
        throw new Error(`Invite generation failed (${response.status})`);
      }

      const json = await response.json();
      const code = json?.code ?? json?.inviteCode ?? null;
      if (!code) throw new Error('Backend returned no invite code');

      set({ inviteCode: code, isUsingMockInvite: false, isGeneratingInvite: false });
      return code;
    } catch (error) {
      adminLog.warn('AdminStore:Invite', 'Falling back to local mock invite code', error);
      const mockCode = generateMockInviteCode();
      set({ inviteCode: mockCode, isUsingMockInvite: true, isGeneratingInvite: false });
      return mockCode;
    }
  },
}));

export function getTeamSummary(members: TeamMember[]) {
  const totalAnalysts = members.filter((member) => member.role === 'Analyst').length;
  const activeCount = members.filter((member) => member.status === 'active').length;
  const pendingCount = members.filter((member) => member.status === 'pending').length;
  const suspendedCount = members.filter((member) => member.status === 'suspended').length;

  return { totalAnalysts, activeCount, pendingCount, suspendedCount };
}