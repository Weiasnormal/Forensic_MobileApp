import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { jwtDecode } from 'jwt-decode';
import * as authApi from '@/services/authApi';

interface DecodedAveraToken {
  nameid?: string;                                   // ClaimTypes.NameIdentifier -> UserId
  'http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid'?: string; // ClaimTypes.GroupSid -> TenantId
  email?: string;
  role?: string | string[];
  SecurityStamp?: string;
  exp: number;
  iss: string;
  aud: string;
}

interface AuthUser {
  userId: string;
  tenantId: string;
  email: string;
  roles: string[];
}

interface AuthState {
  accessToken: string | null;
  expiresAt: string | null;
  user: AuthUser | null;
  isAuthenticating: boolean;
  authError: string | null;
  hasHydrated: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: 'User' | 'Admin',
  ) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  clearAuthError: () => void;
  isTokenExpired: () => boolean;
  setHasHydrated: (value: boolean) => void;
}

function decodeToken(token: string): AuthUser {
  const decoded = jwtDecode<Record<string, any>>(token);

  const userId =
    decoded.nameid ??
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ??
    decoded.sub ?? '';

  const tenantId =
    decoded.groupsid ??
    decoded['http://schemas.microsoft.com/ws/2008/06/identity/claims/groupsid'] ?? '';

  const email =
    decoded.email ??
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? '';

  const rawRole =
    decoded.role ??
    decoded['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role'];

  const roles = Array.isArray(rawRole) ? rawRole : rawRole ? [rawRole] : [];

  return { userId, tenantId, email, roles };
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      expiresAt: null,
      user: null,
      isAuthenticating: false,
      authError: null,
      hasHydrated: false,

      login: async (email, password) => {
        set({ isAuthenticating: true, authError: null });
        try {
          const { accessToken, expiresAt } = await authApi.login({ email, password });
          set({
            accessToken,
            expiresAt,
            user: decodeToken(accessToken),
            isAuthenticating: false,
          });
            console.log(JSON.stringify(jwtDecode(accessToken), null, 2));
        } catch (error) {
          set({
            isAuthenticating: false,
            authError: error instanceof Error ? error.message : 'Unable to sign in.',
          });
          throw error;
        }
      },

      register: async (firstName, lastName, email, password, role) => {
        set({ isAuthenticating: true, authError: null });
        try {
          await authApi.register({ firstName, lastName, email, password, role });
          set({ isAuthenticating: false });
        } catch (error) {
          set({
            isAuthenticating: false,
            authError: error instanceof Error ? error.message : 'Unable to register.',
          });
          throw error;
        }
      },

      logout: async () => {
        const token = get().accessToken;
        if (token) {
          try {
            await authApi.logout(token);
          } catch {
            // Best-effort — clear local state regardless so the user isn't stuck
          }
        }
        set({ accessToken: null, expiresAt: null, user: null });
      },

      changePassword: async (currentPassword, newPassword) => {
        const token = get().accessToken;
        if (!token) throw new Error('Not authenticated.');
        await authApi.changePassword(token, { currentPassword, newPassword });
      },

      clearAuthError: () => set({ authError: null }),

      isTokenExpired: () => {
        const expiresAt = get().expiresAt;
        if (!expiresAt) return true;
        return new Date(expiresAt).getTime() <= Date.now();
      },
     setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'avera_auth_store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        user: state.user,
      }),
      onRehydrateStorage: () => (state) => {   
        state?.setHasHydrated(true);
      },
    },
  ),
);

/** Convenience for other stores/fetches that need the bearer token. */
export function getAuthHeader(): Record<string, string> {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function handleUnauthorizedResponse(response: Response): Promise<boolean> {
  if (response.status === 401 || response.status === 403) {
    await useAuthStore.getState().logout();
    return true;
  }
  return false;
}