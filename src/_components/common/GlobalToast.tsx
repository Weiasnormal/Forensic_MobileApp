import React from 'react';
import Toast from '@/_components/toast';
import { useFeedbackStore } from '@/store/feedbackStore';

export default function GlobalToast() {
  const toast = useFeedbackStore((state) => state.toast);
  const hideToast = useFeedbackStore((state) => state.hideToast);

  return (
    <Toast
      key={toast?.key}
      visible={!!toast}
      message={toast?.message ?? ''}
      variant={toast?.variant ?? 'success'}
      onDismiss={hideToast}
    />
  );
}