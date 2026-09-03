import { Platform } from 'react-native';
import Constants, { ExecutionEnvironment } from 'expo-constants';
import type * as ExpoNotifications from 'expo-notifications';
const IS_EXPO_GO = Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

let notificationsModule: typeof ExpoNotifications | null = null;
let loadAttempted = false;
let isConfigured = false;

async function getNotifications(): Promise<typeof ExpoNotifications | null> {
  if (IS_EXPO_GO) return null;
  if (notificationsModule) return notificationsModule;
  if (loadAttempted) return null;

  loadAttempted = true;
  try {
    notificationsModule = await import('expo-notifications');
    return notificationsModule;
  } catch (error) {
    console.warn('[processingNotifications] expo-notifications native module unavailable', error);
    return null;
  }
}

export async function configureProcessingNotifications() {
  if (isConfigured) return;
  const Notifications = await getNotifications();
  if (!Notifications) return;

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: false,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });

    if (Platform.OS === 'android') {
      Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      }).catch(() => {});
    }

    isConfigured = true;
  } catch (error) {
    console.warn('[processingNotifications] Setup failed', error);
  }
}

let permissionRequested = false;

async function ensurePermission(): Promise<boolean> {
  const Notifications = await getNotifications();
  if (!Notifications) return false;

  try {
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    if (permissionRequested) return false;
    permissionRequested = true;
    const requested = await Notifications.requestPermissionsAsync();
    return requested.granted;
  } catch (error) {
    console.warn('[processingNotifications] Unable to check/request permission', error);
    return false;
  }
}

export async function notifyProcessingComplete(caseCode: string, isSuspected: boolean): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const granted = await ensurePermission();
  if (!granted) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Case analysis complete',
        body: isSuspected
          ? `Case ${caseCode} finished processing — signature flagged as Suspected.`
          : `Case ${caseCode} finished processing — signature marked Genuine.`,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[processingNotifications] Unable to schedule completion notification', error);
  }
}

export async function notifyProcessingFailed(caseCode: string): Promise<void> {
  const Notifications = await getNotifications();
  if (!Notifications) return;

  const granted = await ensurePermission();
  if (!granted) return;

  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Case analysis failed',
        body: `Case ${caseCode} could not be processed. Open the app to retry.`,
      },
      trigger: null,
    });
  } catch (error) {
    console.warn('[processingNotifications] Unable to schedule failure notification', error);
  }
}