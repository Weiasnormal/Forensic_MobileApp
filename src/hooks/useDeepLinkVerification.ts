import { verifyEmailToken } from '@/services/emailVerificationApi';
import { useAuthStore } from '@/store/authStore';
import { useEmailVerificationStore } from '@/store/emailVerificationStore';
import { useFeedbackStore } from '@/store/feedbackStore';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { useEffect, useRef } from 'react';
import { AppState, type AppStateStatus } from 'react-native';

export function useDeepLinkVerification() {
  const router = useRouter();
  const markVerified = useEmailVerificationStore((s) => s.markVerified);
  const markFailed = useEmailVerificationStore((s) => s.markFailed);
  const pendingRole = useEmailVerificationStore((s) => s.pendingRole);
  const hasHydrated = useEmailVerificationStore((s) => s.hasHydrated);
  const authUser = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const hasHandledInitialUrl = useRef(false);
  const handledUrls = useRef(new Set<string>());

  useEffect(() => {
    async function handleUrl(url: string | null) {
      if (!url) return;
      if (handledUrls.current.has(url)) return;
      const parsed = Linking.parse(url);

      const isVerifyLink = parsed.hostname === 'verify-email' || parsed.path === 'verify-email';
      if (!isVerifyLink) return;
      handledUrls.current.add(url);

      const token = parsed.queryParams?.token;
      const userId = parsed.queryParams?.userId;
      const email = parsed.queryParams?.email;
      let verificationSucceeded = false;

      if (typeof token !== 'string' || !token.trim() || typeof userId !== 'string' || !userId.trim()) {
        markFailed('This verification link is missing or malformed.');
      } else {
        const result = await verifyEmailToken(userId, token);
        if (result.ok) {
          verificationSucceeded = true;
          // The userId/token pair was accepted by the backend, so the token result
          // is authoritative even when the link does not include the same email.
          markVerified();
          useFeedbackStore.getState().showToast('Email verified', 'success');

          const rawLinkedEmail: unknown = email;
          const linkedEmail =
            typeof rawLinkedEmail === 'string'
              ? rawLinkedEmail.trim().toLowerCase()
              : null;
          const isEmailChange = Boolean(
            authUser?.email &&
              linkedEmail &&
              authUser.email.trim().toLowerCase() !== linkedEmail,
          );

          if (isEmailChange) {
            await logout();
            router.replace('/_login/SignInPage');
            return;
          }
        } else {
          markFailed('This verification link has expired or is invalid. Request a new one.');
          useFeedbackStore.getState().showToast('Verification link expired', 'infoLight');
        }
      }

      router.replace(
        verificationSucceeded
          ? {
              pathname: '/_sucessPage/emailVerified',
              params: {
                role: pendingRole ?? 'user',
                email: typeof email === 'string' ? email : undefined,
              },
            }
          : {
              pathname: '/_login/_signup/VerifyEmailInstruction',
              params: {
                role: pendingRole ?? 'user',
                email: typeof email === 'string' ? email : undefined,
                verified: 'false',
              },
            },
      );
    }

    if (!hasHydrated) return;

    if (!hasHandledInitialUrl.current) {
      hasHandledInitialUrl.current = true;
      Linking.getInitialURL().then(handleUrl).catch(() => {});
    }

    const subscription = Linking.addEventListener('url', (event) => handleUrl(event.url));

    const appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
      if (state === 'active') {
        Linking.getInitialURL().then(handleUrl).catch(() => {});
      }
    });

    return () => {
      subscription.remove();
      appStateSubscription.remove();
    };
  }, [
    router,
    markVerified,
    markFailed,
    pendingRole,
    hasHydrated,
    authUser?.email,
    logout,
  ]);
}