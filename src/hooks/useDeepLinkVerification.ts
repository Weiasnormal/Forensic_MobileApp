import { useEffect, useRef } from 'react';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';
import { verifyEmailToken } from '@/services/emailVerificationApi';
import { useFeedbackStore } from '@/store/feedbackStore';

/**
 * Handles avera://verify-email?token=...&email=... in all three app states:
 *  - fully closed, opened by the tap  (Linking.getInitialURL)
 *  - backgrounded                     (Linking 'url' event)
 *  - already open in the foreground   (Linking 'url' event)
 * No-ops on a normal, non-deep-link app launch.
 */
export function useDeepLinkVerification() {
  const router = useRouter();
  const markVerified = useEmailVerificationStore((s) => s.markVerified);
  const markFailed = useEmailVerificationStore((s) => s.markFailed);
  const pendingRole = useEmailVerificationStore((s) => s.pendingRole);
  const hasHandledInitialUrl = useRef(false);

  useEffect(() => {
    async function handleUrl(url: string | null) {
      if (!url) return;
      console.log('[DeepLink] received', url); // temporary
    const parsed = Linking.parse(url);
    console.log('[DeepLink] parsed', parsed); // temporary
    
      const isVerifyLink = parsed.hostname === 'verify-email' || parsed.path === 'verify-email';
      if (!isVerifyLink) return;

      const token = parsed.queryParams?.token;
      const email = parsed.queryParams?.email;

      if (typeof token !== 'string' || !token.trim()) {
        markFailed('This verification link is missing or malformed.');
      } else {
        const { ok } = await verifyEmailToken(token);
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