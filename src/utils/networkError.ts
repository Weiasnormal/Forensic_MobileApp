export const NETWORK_ERROR_MESSAGE =
  "Network error. Please check your connection and try again.";

export function getServerErrorMessage(
  status: number,
  detail?: unknown,
): string {
  if (status >= 500) return NETWORK_ERROR_MESSAGE;

  if (typeof detail === "string" && detail.trim()) {
    return detail.trim();
  }

  return "Unable to complete the request. Please try again.";
}

export function getNetworkErrorMessage(
  error: unknown,
  fallback = NETWORK_ERROR_MESSAGE,
): string {
  const message = error instanceof Error ? error.message : String(error ?? "");
  if (/network|fetch|request failed|server error|backend/i.test(message)) {
    return fallback;
  }

  return message.trim() || fallback;
}
