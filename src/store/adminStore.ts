import { create } from 'zustand';
import { buildApiUrl } from '@/constants/api';
import { ADMIN_API_ENDPOINTS } from '@/constants/adminApi';

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

interface AdminStore {
  teamMembers: TeamMember[];
  pendingApprovals: TeamMember[];
  isLoadingTeam: boolean;
  teamLoadError: string | null;

  isGeneratingInvite: boolean;

  fetchTeamMembers: () => Promise<void>;
  approveTeamMember: (id: string) => Promise<void>;
  suspendTeamMember: (id: string) => Promise<void>;
  generateInviteCode: () => Promise<string | null>;
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

export const useAdminStore = create<AdminStore>((set, get) => ({
  teamMembers: [],
  pendingApprovals: [],
  isLoadingTeam: false,
  teamLoadError: null,
  isGeneratingInvite: false,

  fetchTeamMembers: async () => {
    adminLog.info('AdminStore:Team', 'Fetching team members');
    set({ isLoadingTeam: true, teamLoadError: null });

    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.list), {
        method: 'GET',
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) {
        throw new Error(`Unable to load team (${response.status})`);
      }

      const rawText = await response.text();
      const payload = rawText.trim() ? JSON.parse(rawText) : [];

      const records: any[] = Array.isArray(payload)
        ? payload
        : isRecord(payload) && Array.isArray((payload as any).members)
          ? (payload as any).members
          : [];

      const members = records
        .map(normalizeTeamMember)
        .filter((item): item is TeamMember => Boolean(item));

      set({
        teamMembers: members,
        pendingApprovals: members.filter((member) => member.status === 'pending'),
        isLoadingTeam: false,
      });

      adminLog.info('AdminStore:Team', `✓ Loaded ${members.length} team member(s)`);
    } catch (error) {
      // The /admin/team endpoint likely doesn't exist on the backend yet.
      // We surface this as an explicit error state instead of showing fake data.
      adminLog.warn('AdminStore:Team', 'Failed to load team members', error);
      set({
        isLoadingTeam: false,
        teamLoadError: error instanceof Error ? error.message : 'Unable to load team members',
      });
    }
  },

  approveTeamMember: async (id) => {
    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.approve(id)), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Approve failed (${response.status})`);
      }

      set((state) => ({
        teamMembers: state.teamMembers.map((member) =>
          member.id === id ? { ...member, status: 'active' } : member,
        ),
        pendingApprovals: state.pendingApprovals.filter((member) => member.id !== id),
      }));
    } catch (error) {
      adminLog.warn('AdminStore:Team', `Unable to approve member ${id}`, error);
    }
  },

  suspendTeamMember: async (id) => {
    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.suspend(id)), {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error(`Suspend failed (${response.status})`);
      }

      set((state) => ({
        teamMembers: state.teamMembers.map((member) =>
          member.id === id ? { ...member, status: 'suspended' } : member,
        ),
      }));
    } catch (error) {
      adminLog.warn('AdminStore:Team', `Unable to suspend member ${id}`, error);
    }
  },

  generateInviteCode: async () => {
    set({ isGeneratingInvite: true });
    try {
      const response = await fetch(buildApiUrl(ADMIN_API_ENDPOINTS.team.invite), {
        method: 'POST',
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
}));

export function getTeamSummary(members: TeamMember[]) {
  const totalAnalysts = members.filter((member) => member.role === 'Analyst').length;
  const activeCount = members.filter((member) => member.status === 'active').length;
  const pendingCount = members.filter((member) => member.status === 'pending').length;
  const suspendedCount = members.filter((member) => member.status === 'suspended').length;

  return { totalAnalysts, activeCount, pendingCount, suspendedCount };
}
