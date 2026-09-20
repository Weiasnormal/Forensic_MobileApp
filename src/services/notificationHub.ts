import { API_KEY, NOTIFICATION_HUB_URL } from "@/constants/api";
import { useAuthStore } from "@/store/authStore";
import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

export function createNotificationConnection() {
  return new HubConnectionBuilder()
    .withUrl(NOTIFICATION_HUB_URL, {
      accessTokenFactory: () => useAuthStore.getState().accessToken ?? "",
      headers: { "X-Api-Key": API_KEY ?? "" },
    })
    .withAutomaticReconnect()
    .configureLogging(LogLevel.Critical)
    .build();
}
