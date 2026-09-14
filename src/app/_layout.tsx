import React from 'react';
import { UserProvider } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import GlobalToast from '@/_components/common/GlobalToast';
import { configureProcessingNotifications } from '@/services/processingNotifications';
import { useDeepLinkVerification } from '@/hooks/useDeepLinkVerification';

SplashScreen.preventAutoHideAsync().catch(() => {});

const PUBLIC_SEGMENTS = ['_login', '_introPage', '_devscan'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated) return;

    const currentSegment = segments[0];
    const isPublicRoute = !currentSegment || PUBLIC_SEGMENTS.includes(currentSegment);
    const isAuthenticated = Boolean(accessToken) && !isTokenExpired();
    const isAdminRoute = currentSegment === 'Admin';
    const isAdmin = user?.roles.some((role) => role.toLowerCase().includes('admin')) ?? false;
    const hasTenant = Boolean(user?.tenantId?.trim());
    const isUserRoute = currentSegment === 'User';

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/_login/GetStarted');
      return;
    }

    if (isAuthenticated && isAdminRoute && !isAdmin) {
      router.replace('/User/user_dashboard');
      return;
    }

    if (isAuthenticated && isAdminRoute && !hasTenant) {
      router.replace('/_login/_signup/OrganizationCreate');
      return;
    }

    if (isAuthenticated && isUserRoute && isAdmin) {
      router.replace('/Admin/admin_dashboard');
      return;
    }

    if (isAuthenticated && isUserRoute && !hasTenant) {
      router.replace('/_login/_signup/User&AdminCodepage?role=user');
    }
  }, [accessToken, hasHydrated, isTokenExpired, router, segments, user]);

  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Sora_400Regular,
    Sora_500Medium,
    Sora_600SemiBold,
    Sora_700Bold,
    Sora_800ExtraBold,
  });
  
  useDeepLinkVerification();

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
      void configureProcessingNotifications();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <UserProvider>
        <AuthGate>
          <Stack screenOptions={{ headerShown: false }} />
        </AuthGate>
        <GlobalToast />
      </UserProvider>
    </SafeAreaProvider>
  );
}