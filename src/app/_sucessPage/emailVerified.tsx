import PrimaryButton from "@/_components/common/PrimaryButton";
import { colors } from "@/constants/colors";
import { resolveRole } from "@/constants/roles";
import { getTypographyStyle } from "@/constants/typography";
import { useAuthStore } from "@/store/authStore";
import {
	getPendingSignupCredentials,
	useEmailVerificationStore,
} from "@/store/emailVerificationStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
	KeyboardAvoidingView,
	Platform,
	ScrollView,
	StyleSheet,
	Text,
	View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const successIllustration = require("../../../assets/expo.icon/Assets/success.webp");

export default function EmailVerifiedPage() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ role?: string; email?: string }>();
  const login = useAuthStore((state) => state.login);
  const pendingRole = useEmailVerificationStore((state) => state.pendingRole);
  const [isContinuing, setIsContinuing] = useState(false);
  const activeRole = resolveRole(params.role ?? pendingRole ?? undefined);
  const pendingCredentials = getPendingSignupCredentials();
  const canAutoLogin = Boolean(
    pendingCredentials &&
    (!params.email ||
      pendingCredentials.email === params.email.trim().toLowerCase()),
  );

  const handleContinue = async () => {
    if (!canAutoLogin || !pendingCredentials) {
      router.replace({
        pathname: "/_login/SignInPage",
        params: {
          role: activeRole,
          verifiedEmail: params.email,
          next: activeRole === "user" ? "organizationCode" : undefined,
        },
      });
      return;
    }

    setIsContinuing(true);
    try {
      await login(pendingCredentials.email, pendingCredentials.password);
      const authenticatedUser = useAuthStore.getState().user;
      const authenticatedRole = authenticatedUser?.roles.some((role) =>
        role.toLowerCase().includes("admin"),
      )
        ? "admin"
        : "user";
      useFeedbackStore
        .getState()
        .showToast("Email verified successfully", "success");
      router.replace(
        authenticatedRole === "admin"
          ? "/_login/_signup/OrganizationCreate"
          : "/_login/_signup/User&AdminCodepage?role=user",
      );
    } catch {
      setIsContinuing(false);
      useFeedbackStore
        .getState()
        .showToast("Please sign in to continue", "infoLight");
      router.replace({
        pathname: "/_login/SignInPage",
        params: { role: activeRole, verifiedEmail: pendingCredentials.email },
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        style="dark"
        translucent
        backgroundColor={colors.background2}
      />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.mainContent}>
          <View style={styles.illustrationWrap}>
            <Image
              source={successIllustration}
              style={styles.illustration}
              contentFit="contain"
            />
          </View>

          <Text allowFontScaling={false} style={styles.title}>
            Email Verified
          </Text>
          <Text allowFontScaling={false} style={styles.subtitle}>
            Thanks for confirming your email.{"\n"}Sign in to continue.
          </Text>
        </View>
      </ScrollView>

      <View
        style={[styles.bottomActions, { paddingBottom: insets.bottom + 35 }]}
      >
        <PrimaryButton
          label={
            isContinuing
              ? "Signing in…"
              : canAutoLogin
                ? "Continue setup"
                : "Continue to Sign In"
          }
          onPress={handleContinue}
          loading={isContinuing}
          size="large"
        />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  mainContent: {
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 100,
  },
  illustrationWrap: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 6,
    marginBottom: 18,
  },
  illustration: {
    width: 300,
    height: 300,
  },
  title: {
    ...getTypographyStyle("t1Title"),
    color: colors.textPrimary,
    textAlign: "center",
  },
  subtitle: {
    ...getTypographyStyle("c1Caption", "regular"),
    color: colors.textSecondary,
    textAlign: "center",
    marginTop: 8,
  },
  bottomActions: {
    paddingHorizontal: 20,
    paddingTop: 12,
    backgroundColor: colors.background2,
  },
});
