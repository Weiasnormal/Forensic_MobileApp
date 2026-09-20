import PrimaryButton from "@/_components/common/PrimaryButton";
import { ScreenStatusBar } from "@/_components/common/ScreenStatusBar";
import { colors } from "@/constants/colors";
import { getTypographyStyle } from "@/constants/typography";
import { createNotificationConnection } from "@/services/notificationHub";
import { fetchNotifications } from "@/services/notificationsApi";
import { useAuthStore } from "@/store/authStore";
import {
  clearPendingSignupCredentials,
  getPendingSignupCredentials,
} from "@/store/emailVerificationStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { HubConnectionState } from "@microsoft/signalr";
import { Image } from "expo-image";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import {
  AppState,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { resolveRole, ROLE_SETTINGS } from "../../../constants/roles";

export default function PendingUserAndAdminPage() {
  const router = useRouter();
  const params = useLocalSearchParams<{ role?: string }>();
  const activeRole = resolveRole(params.role);
  const roleConfig = ROLE_SETTINGS[activeRole].pendingApproval;
  const email = useAuthStore((state) => state.user?.email ?? "");
  const login = useAuthStore((state) => state.login);
  const approvalHandled = useRef(false);

  useEffect(() => {
    if (activeRole !== "user") return;

    const handleApproved = async () => {
      if (approvalHandled.current) return;
      approvalHandled.current = true;
      const credentials = getPendingSignupCredentials();

      if (!credentials) {
        useFeedbackStore
          .getState()
          .showToast(
            "Your organization request was approved. Please sign in.",
            "success",
          );
        router.replace({
          pathname: "/_login/SignInPage",
          params: { role: "user", verifiedEmail: email },
        });
        return;
      }

      try {
        await login(credentials.email, credentials.password);
        clearPendingSignupCredentials();
        useFeedbackStore
          .getState()
          .showToast("Your organization request was approved.", "success");
        router.replace("/User/user_dashboard");
      } catch {
        approvalHandled.current = false;
        useFeedbackStore
          .getState()
          .showToast("Your request was approved. Please sign in.", "success");
        router.replace({
          pathname: "/_login/SignInPage",
          params: { role: "user", verifiedEmail: credentials.email },
        });
      }
    };

    const checkStoredApproval = async () => {
      try {
        const notifications = await fetchNotifications();
        const approval = notifications.find((notification) =>
          /approved|accepted/i.test(
            `${notification.type} ${notification.title} ${notification.message}`,
          ),
        );
        if (approval) await handleApproved();
      } catch (error) {
        console.warn(
          "[PendingUserAndAdmin] Unable to check approval notification:",
          error,
        );
      }
    };

    void checkStoredApproval();
    const appStateSubscription = AppState.addEventListener(
      "change",
      (state) => {
        if (state === "active") void checkStoredApproval();
      },
    );

    const accessToken = useAuthStore.getState().accessToken;
    if (!accessToken) {
      return () => appStateSubscription.remove();
    }

    const connection = createNotificationConnection();

    connection.on("MemberRequestApproved", handleApproved);
    void connection.start().catch((error) => {
      console.warn(
        "[PendingUserAndAdmin] Unable to connect to approval notifications:",
        error,
      );
    });
    const approvalPolling = setInterval(() => {
      void checkStoredApproval();
    }, 10000);

    return () => {
      appStateSubscription.remove();
      clearInterval(approvalPolling);
      connection.off("MemberRequestApproved", handleApproved);
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop().catch(() => {});
      }
    };
  }, [activeRole, email, login, router]);
  const handleWelcomePage = () => {
    router.push("/_login/GetStarted");
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScreenStatusBar variant="onBrand" />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        bounces={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.content}>
          <View style={styles.mainContent}>
            <View style={styles.illustrationWrap}>
              <Image
                source={require("../../../../assets/expo.icon/Assets/pending.webp")}
                style={styles.illustration}
                contentFit="contain"
              />
            </View>

            <Text allowFontScaling={false} style={styles.title}>
              Pending Approval
            </Text>
            <Text allowFontScaling={false} style={styles.subtitle}>
              {roleConfig.description}
            </Text>
          </View>

          <View style={styles.stepsContainer}>
            {roleConfig.steps.map((step, index) => (
              <View key={index} style={styles.stepRow}>
                <View style={styles.stepNumber}>
                  <Text allowFontScaling={false} style={styles.stepNumberText}>
                    {index + 1}
                  </Text>
                </View>
                <Text allowFontScaling={false} style={styles.stepText}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.bottomActions}>
            <PrimaryButton
              label="Back to Welcome Page"
              onPress={handleWelcomePage}
              size="large"
              backgroundColor={colors.primary}
              textColor={colors.primaryText}
              textStyle={styles.primaryButtonText}
            />
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollView: {
    flex: 1,
    backgroundColor: colors.background2,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 10,
    backgroundColor: colors.background2,
  },
  content: {
    flex: 1,
    backgroundColor: colors.background2,
    paddingHorizontal: 16,
    paddingTop: 42,
    paddingBottom: 20,
    justifyContent: "space-between",
  },
  mainContent: {
    alignItems: "center",
    paddingTop: 30,
  },
  illustrationWrap: {
    width: 300,
    height: 300,
    marginTop: 6,
    alignItems: "center",
    justifyContent: "center",
  },
  illustration: {
    width: "100%",
    height: "100%",
  },
  title: {
    ...getTypographyStyle("t1Title"),
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    color: colors.textSecondary,
    ...getTypographyStyle("c1Caption", "regular"),
    lineHeight: 20,
    textAlign: "center",
    marginBottom: 12,
  },
  stepsContainer: {
    width: "100%",
    marginBottom: 24,
    paddingTop: 6,
    marginLeft: 8,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    gap: 10,
  },
  stepNumber: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.background2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
    outlineWidth: 2,
    outlineColor: colors.primary,
  },
  stepNumberText: {
    color: colors.primary,
    ...getTypographyStyle("body", "bold"),
  },
  stepText: {
    flex: 1,
    paddingTop: 4,
    color: colors.textSecondary,
    ...getTypographyStyle("c1Caption", "regular"),
    lineHeight: 20,
  },
  bottomActions: {
    marginTop: "auto",
    width: "100%",
    paddingTop: 6,
    paddingBottom: 30,
  },
  primaryButtonText: {
    ...getTypographyStyle("b1Button"),
  },
});
