import React from 'react';

import { UserProvider } from '@/store/userStore';
import { useAuthStore } from '@/store/authStore';
import { Sora_400Regular, Sora_500Medium, Sora_600SemiBold, Sora_700Bold, Sora_800ExtraBold, useFonts } from '@expo-google-fonts/sora';
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';

SplashScreen.preventAutoHideAsync().catch(() => {});

const PUBLIC_SEGMENTS = ['_login', '_introPage'];

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);

  React.useEffect(() => {
    if (!hasHydrated) return;

    const currentSegment = segments[0];
    const isPublicRoute = !currentSegment || PUBLIC_SEGMENTS.includes(currentSegment);
    const isAuthenticated = Boolean(accessToken) && !isTokenExpired();

    if (!isAuthenticated && !isPublicRoute) {
      router.replace('/_login/GetStarted');
    }
  }, [accessToken, hasHydrated, isTokenExpired, router, segments]);

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

  React.useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync().catch(() => {});
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
      </UserProvider>
    </SafeAreaProvider>
  );
}