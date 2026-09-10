import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';
import { verifyEmailToken } from '@/services/emailVerificationApi';
import { useFeedbackStore } from '@/store/feedbackStore';

export function useDeepLinkVerification() {
  const router = useRouter();
  const markVerified = useEmailVerificationStore((s) => s.markVerified);
  const markFailed = useEmailVerificationStore((s) => s.markFailed);
  const pendingRole = useEmailVerificationStore((s) => s.pendingRole);
  const hasHandledInitialUrl = useRef(false);

  useEffect(() => {
    async function handleUrl(url: string | null) {
      if (!url) return;
      const parsed = Linking.parse(url);

      const isVerifyLink = parsed.hostname === 'verify-email' || parsed.path === 'verify-email';
      if (!isVerifyLink) return;

      const token = parsed.queryParams?.token;
      const userId = parsed.queryParams?.userId;
      const email = parsed.queryParams?.email;

      if (typeof token !== 'string' || !token.trim() || typeof userId !== 'string' || !userId.trim()) {
        markFailed('This verification link is missing or malformed.');
      } else {
        const { ok } = await verifyEmailToken(userId, token);
        if (ok) {
          markVerified(typeof email === 'string' ? email : undefined);
          useFeedbackStore.getState().showToast('Email verified', 'success');
        } else {
          markFailed('This verification link has expired or is invalid. Request a new one.');
          useFeedbackStore.getState().showToast('Verification link expired', 'infoLight');
        }
      }

      router.push({
        pathname: '/_login/_signup/VerifyEmailInstruction',
        params: { role: pendingRole ?? 'user' },
      });
    }

    if (!hasHandledInitialUrl.current) {
      hasHandledInitialUrl.current = true;
      Linking.getInitialURL().then(handleUrl).catch(() => {});
    }

    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));
    return () => subscription.remove();
  }, [router, markVerified, markFailed, pendingRole]);
}