import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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

let permissionRequested = false;

async function ensurePermission(): Promise<boolean> {
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