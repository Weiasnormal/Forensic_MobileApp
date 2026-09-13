import { API_ENDPOINTS, API_KEY, buildApiUrl } from '@/constants/api';
import { getAuthHeader, handleUnauthorizedResponse } from '@/store/authStore';

export interface BackendNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  resourceId: string | null;
  isRead: boolean;
  createdAt: string;
}

function normalizeNotification(raw: any): BackendNotification {
  return {
    id: String(raw?.id ?? raw?.Id ?? ''),
    type: String(raw?.type ?? raw?.Type ?? ''),
    title: String(raw?.title ?? raw?.Title ?? ''),
    message: String(raw?.message ?? raw?.Message ?? ''),
    resourceId: raw?.resourceId ?? raw?.ResourceId ?? null,
    isRead: Boolean(raw?.isRead ?? raw?.IsRead),
    createdAt: String(raw?.createdAt ?? raw?.CreatedAt ?? ''),
  };
}

function headers() {
  return {
    Accept: 'application/json',
    'X-Api-Key': API_KEY || '',
    ...getAuthHeader(),
  };
}

async function ensureOk(response: Response) {
  if (response.ok) return;
  if (await handleUnauthorizedResponse(response)) {
    throw new Error('Session expired. Please sign in again.');
  }
  throw new Error(`Unable to load notifications (${response.status})`);
}

export async function fetchNotifications(): Promise<BackendNotification[]> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.notifications.list), {
    method: 'GET',
    headers: headers(),
  });
  await ensureOk(response);
  const payload = await response.json();
  return (Array.isArray(payload) ? payload : []).map(normalizeNotification);
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.notifications.markAsRead(notificationId)), {
    method: 'PATCH',
    headers: headers(),
  });
  await ensureOk(response);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch(buildApiUrl(API_ENDPOINTS.notifications.markAllAsRead), {
    method: 'PATCH',
    headers: headers(),
  });
  await ensureOk(response);
}
