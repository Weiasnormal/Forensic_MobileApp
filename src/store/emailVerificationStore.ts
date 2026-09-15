import { API_ENDPOINTS, API_KEY, buildApiUrl } from '@/constants/api';
import type { AppRole } from '@/constants/roles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getAuthHeader } from './authStore';

interface EmailVerificationState {
  pendingEmail: string | null;
  pendingRole: AppRole | null;
  isVerified: boolean;
  verifiedAt: string | null;
  lastError: string | null;
  hasHydrated: boolean;
  setPendingVerification: (email: string, role: AppRole) => void;
  markVerified: (email?: string) => void;
  markFailed: (reason: string) => void;
  clearError: () => void;
  reset: () => void;
  setHasHydrated: (value: boolean) => void;

}

let pendingSignupCredentials: { email: string; password: string } | null = null;

export function setPendingSignupCredentials(email: string, password: string) {
  pendingSignupCredentials = { email: email.trim().toLowerCase(), password };
}

export function getPendingSignupCredentials() {
  return pendingSignupCredentials;
}

export function clearPendingSignupCredentials() {
  pendingSignupCredentials = null;
}

export const useEmailVerificationStore = create<EmailVerificationState>()(
  persist(
    (set, get) => ({
      pendingEmail: null,
      pendingRole: null,
      isVerified: false,
      verifiedAt: null,
      lastError: null,
      hasHydrated: false,

      // Called right after signup, before navigating to the instruction page.
      setPendingVerification: (email, role) =>
        set({
          pendingEmail: email.trim().toLowerCase(),
          pendingRole: role,
          isVerified: false,
          verifiedAt: null,
          lastError: null,
        }),

      // Called by the deep link handler on a successful backend response.
      markVerified: (email) => {
        const { pendingEmail } = get();
        if (email && pendingEmail && email.trim().toLowerCase() !== pendingEmail) {
          set({ lastError: 'This verification link is for a different email address.' });
          return;
        }
        set({ isVerified: true, verifiedAt: new Date().toISOString(), lastError: null });
      },

      markFailed: (reason) => set({ lastError: reason }),
      clearError: () => set({ lastError: null }),

      reset: () =>
        set({ pendingEmail: null, pendingRole: null, isVerified: false, verifiedAt: null, lastError: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'avera_email_verification_store',
      storage: createJSONStorage(() => AsyncStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

export async function verifyEmailToken(userId: string, token: string): Promise<{ ok: boolean }> {
  try {
    const res = await fetch(buildApiUrl(API_ENDPOINTS.auth.verifySignupCode), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Api-Key': API_KEY || '',
        ...getAuthHeader(),
      },
      body: JSON.stringify({ userId, token }),
    });
    return { ok: res.ok };
  } catch {
    return { ok: false };
  }
}