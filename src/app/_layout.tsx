import GlobalToast from "@/_components/common/GlobalToast";
import NotificationSignalRListener from "@/_components/common/NotificationSignalRListener";
import { useDeepLinkVerification } from "@/hooks/useDeepLinkVerification";
import { configureProcessingNotifications } from "@/services/processingNotifications";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { useCaseStore } from "@/store/caseStore";
import { UserProvider } from "@/store/userStore";
import {
  Sora_400Regular,
  Sora_500Medium,
  Sora_600SemiBold,
  Sora_700Bold,
  Sora_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/sora";
import { Stack, useRouter, useSegments } from "expo-router";
import React from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";

const PUBLIC_SEGMENTS = ["_login", "_introPage", "_devscan"];

function AuthGate({ children }: { children: React.ReactNode }) {
  const segments = useSegments();
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const user = useAuthStore((state) => state.user);
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const clearAdminState = useAdminStore((state) => state.clearAdminState);
  const clearUserScopedCaseState = useCaseStore(
    (state) => state.clearUserScopedState,
  );
  const previousSessionKey = React.useRef<string | null | undefined>(undefined);

  React.useEffect(() => {
    clearAdminState();
  }, [clearAdminState, user?.tenantId, user?.userId]);

  React.useEffect(() => {
    const sessionKey = user?.userId?.trim() || null;
    if (
      previousSessionKey.current !== undefined &&
      previousSessionKey.current !== null &&
      previousSessionKey.current !== sessionKey
    ) {
      clearUserScopedCaseState();
    }
    previousSessionKey.current = sessionKey;
  }, [clearUserScopedCaseState, user?.userId]);

  React.useEffect(() => {
    if (!hasHydrated) return;

    const currentSegment = segments[0];
    const isPublicRoute =
      !currentSegment || PUBLIC_SEGMENTS.includes(currentSegment);
    const isAuthenticated = Boolean(accessToken) && !isTokenExpired();
    const isAdminRoute = currentSegment === "Admin";
    const isAdmin =
      user?.roles.some((role) => role.toLowerCase().includes("admin")) ?? false;
    const hasTenant = Boolean(user?.tenantId?.trim());
    const isUserRoute = currentSegment === "User";

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/_login/GetStarted");
      return;
    }

    if (isAuthenticated && !isPublicRoute && !hasTenant) {
      router.replace(
        isAdmin
          ? "/_login/_signup/OrganizationCreate"
          : "/_login/_signup/User&AdminCodepage?role=user",
      );
      return;
    }

    if (isAuthenticated && isAdminRoute && !isAdmin) {
      router.replace("/User/user_dashboard");
      return;
    }

    if (isAuthenticated && isUserRoute && isAdmin) {
      router.replace("/Admin/admin_dashboard");
      return;
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
          <NotificationSignalRListener />
          <Stack
              screenOptions={{
                headerShown: false,
                animation: "ios_from_right",
              }}
            >
              <Stack.Screen
                name="_login/OnBoardingpage"
                options={{ animation: "none" }}
              />
            </Stack>
        </AuthGate>
        <GlobalToast />
      </UserProvider>
    </SafeAreaProvider>
  );
}
