import { NOTIFICATION_HUB_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import { useFeedbackStore } from "@/store/feedbackStore";
import {
    HubConnectionBuilder,
    HubConnectionState,
    LogLevel,
} from "@microsoft/signalr";
import { useEffect } from "react";

export default function NotificationSignalRListener() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const tenantId = useAuthStore((state) => state.user?.tenantId?.trim() ?? "");

  useEffect(() => {
    // NotificationHub requires TenantId in the JWT. Users receive that claim
    // only after successfully joining an organization.
    if (!accessToken) return;

    const connection = new HubConnectionBuilder()
      .withUrl(NOTIFICATION_HUB_URL, {
        accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
      })
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

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

    connection.on("MemberRequestApproved", handleMemberRequestStatus);
    connection.on("MemberRequestRejected", handleMemberRequestStatus);
    connection.on("MemberRequestDeclined", handleMemberRequestStatus);
    connection.onclose((error) => {
      if (error) {
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
      console.warn(
        "[NotificationSignalRListener] Unable to connect to notification hub:",
        error,
      );
    });

    return () => {
      connection.off("MemberRequestApproved", handleMemberRequestStatus);
      connection.off("MemberRequestRejected", handleMemberRequestStatus);
      connection.off("MemberRequestDeclined", handleMemberRequestStatus);
      if (connection.state !== HubConnectionState.Disconnected) {
        void connection.stop().catch((error) => {
          console.warn(
            "[NotificationSignalRListener] Unable to stop notification connection:",
            error,
          );
        });
      }
    };
  }, [accessToken, tenantId]);

  return null;
}
