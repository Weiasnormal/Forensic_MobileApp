import { createNotificationConnection } from "@/services/notificationHub";
import { useAdminStore } from "@/store/adminStore";
import { useAuthStore } from "@/store/authStore";
import { useCaseStore } from "@/store/caseStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import { useUser } from "@/store/userStore";
import { HubConnectionState } from "@microsoft/signalr";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export default function NotificationSignalRListener() {
  const router = useRouter();
  const accessToken = useAuthStore((state) => state.accessToken);
  const tenantId = useAuthStore((state) => state.user?.tenantId?.trim() ?? "");
  const isTokenExpired = useAuthStore((state) => state.isTokenExpired);
  const logout = useAuthStore((state) => state.logout);
  const isAdmin =
    useAuthStore((state) =>
      state.user?.roles.some((role) => role.toLowerCase().includes("admin")),
    ) ?? false;
  const { setUser } = useUser();

  useEffect(() => {
    // NotificationHub requires TenantId in the JWT. Users receive that claim
    // only after successfully joining an organization.
    if (!accessToken || !tenantId || isTokenExpired()) return;

    const connection = createNotificationConnection();
    let isDisposed = false;

    const handleSessionTermination = async (
      message: string,
      route: "/_login/GetStarted" | "/_login/SignInPage" = "/_login/GetStarted",
    ) => {
      // Show the reason before clearing auth state and leaving the protected route.
      useFeedbackStore.getState().showToast(message, "error");

      try {
        await logout();
      } catch {
        // Best-effort logout if the backend rejects the session close.
      }

      router.replace(route);
    };

    const handleMemberRequestStatus = (payload?: {
      message?: string;
      Message?: string;
    }) => {
      useFeedbackStore
        .getState()
        .showToast(
          payload?.message ??
            payload?.Message ??
            "Your organization request status was updated.",
          "infoLight",
        );
    };

    connection.on(
      "UserSuspended",
      async (payload?: { message?: string; Message?: string }) => {
        await handleSessionTermination(
          payload?.message ??
            payload?.Message ??
            "You have been suspended by your organization administrator.",
          "/_login/GetStarted",
        );
      },
    );

    connection.on(
      "UserRemoved",
      async (payload?: { message?: string; Message?: string }) => {
        await handleSessionTermination(
          payload?.message ??
            payload?.Message ??
            "You have been removed from the organization.",
          "/_login/GetStarted",
        );
      },
    );

    connection.on("UserDeleted", () => {
      void useAdminStore.getState().fetchTeamMembers();
      useFeedbackStore
        .getState()
        .showToast("A member deleted their account.", "infoLight");
    });

    connection.on(
      "TenantRenamed",
      (payload?: { newName?: string; NewName?: string }) => {
        const nextOrganizationName = payload?.newName ?? payload?.NewName ?? "";
        if (nextOrganizationName.trim()) {
          void setUser({ organization: nextOrganizationName.trim() });
        }
        void useAdminStore.getState().fetchTenantProfile();
        useFeedbackStore
          .getState()
          .showToast("Organization updated", "successLight");
      },
    );

    connection.on(
      "CaseFlagged",
      (payload?: { caseId?: string; CaseId?: string }) => {
        const caseId = payload?.caseId ?? payload?.CaseId;
        if (caseId) {
          void useCaseStore.getState().refreshCasesFromBackend();
        }
        useFeedbackStore
          .getState()
          .showToast("This case was flagged for internal review.", "infoLight");
      },
    );

    connection.on(
      "NewCaseResult",
      (payload?: { caseId?: string; CaseId?: string }) => {
        const caseId = payload?.caseId ?? payload?.CaseId;
        if (isAdmin && caseId) {
          router.push({
            pathname: "/Admin/CaseResultAdmin",
            params: { caseId },
          });
        }
        useFeedbackStore
          .getState()
          .showToast("A new case result is ready for review.", "successLight");
      },
    );

    connection.on(
      "CaseReviewCompleted",
      (payload?: { caseId?: string; CaseId?: string }) => {
        const caseId = payload?.caseId ?? payload?.CaseId;
        if (caseId) {
          void useCaseStore.getState().refreshCasesFromBackend();
        }
        useFeedbackStore
          .getState()
          .showToast("Your case review is complete.", "successLight");
      },
    );

    connection.on("MemberRequestApproved", handleMemberRequestStatus);
    connection.on("MemberRequestRejected", handleMemberRequestStatus);
    connection.on("MemberRequestDeclined", handleMemberRequestStatus);
    connection.onclose((error) => {
      if (error && !isDisposed) {
        console.warn(
          "[NotificationSignalRListener] Notification connection closed:",
          error.message,
        );
        useFeedbackStore
          .getState()
          .showToast(
            "Live notifications are temporarily unavailable. We will try to reconnect.",
            "infoLight",
          );
      }
    });

    void connection.start().catch((error) => {
      if (isDisposed) return;
      console.warn(
        "[NotificationSignalRListener] Unable to connect to notification hub:",
        error,
      );
    });

    return () => {
      isDisposed = true;
      connection.off("MemberRequestApproved", handleMemberRequestStatus);
      connection.off("MemberRequestRejected", handleMemberRequestStatus);
      connection.off("MemberRequestDeclined", handleMemberRequestStatus);
      connection.off("UserSuspended");
      connection.off("UserRemoved");
      connection.off("UserDeleted");
      connection.off("TenantRenamed");
      connection.off("CaseFlagged");
      connection.off("NewCaseResult");
      connection.off("CaseReviewCompleted");
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop().catch((error) => {
          console.warn(
            "[NotificationSignalRListener] Unable to stop notification connection:",
            error,
          );
        });
      }
    };
  }, [accessToken, isAdmin, isTokenExpired, logout, router, setUser, tenantId]);

  return null;
}
