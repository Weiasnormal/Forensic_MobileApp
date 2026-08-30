import { create } from 'zustand';
import type { ToastVariant } from '@/_components/toast';

interface FeedbackToast {
  message: string;
  variant: ToastVariant;
  key: number;
}

interface FeedbackStore {
  toast: FeedbackToast | null;
  showToast: (message: string, variant?: ToastVariant) => void;
  hideToast: () => void;
}

export const useFeedbackStore = create<FeedbackStore>((set) => ({
  toast: null,
  showToast: (message, variant = 'success') =>
    set({ toast: { message, variant, key: Date.now() } }),
  hideToast: () => set({ toast: null }),
}));
