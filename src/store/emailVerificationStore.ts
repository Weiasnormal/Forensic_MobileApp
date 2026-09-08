import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AppRole } from '@/constants/roles';

interface EmailVerificationState {
  pendingEmail: string | null;
  pendingRole: AppRole | null;
  isVerified: boolean;
  verifiedAt: string | null;
  lastError: string | null;
  setPendingVerification: (email: string, role: AppRole) => void;
  markVerified: (email?: string) => void;
  markFailed: (reason: string) => void;
  clearError: () => void;
  reset: () => void;
}

export const useEmailVerificationStore = create<EmailVerificationState>()(
  persist(
    (set, get) => ({
      pendingEmail: null,
      pendingRole: null,
      isVerified: false,
      verifiedAt: null,
      lastError: null,

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
    }),
    {
      name: 'avera_email_verification_store',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);