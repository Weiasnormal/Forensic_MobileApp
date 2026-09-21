import { colors } from '@/constants/colors';
import { getTypographyStyle } from '@/constants/typography';
import {
  fetchNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  type BackendNotification,
} from '@/services/notificationsApi';
import { Bell, CheckCheck } from 'lucide-react-native';
import React, { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

type Props = {
  tintColor?: string;
};

export default function NotificationBell({ tintColor = colors.textPrimary }: Props) {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);
  const sheetTranslateY = useRef(new Animated.Value(420)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const load = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setNotifications(await fetchNotifications());
    } catch (error) {
      console.warn('[NotificationBell] Unable to load notifications', error);
      setLoadError(error instanceof Error ? error.message : 'Unable to load notifications.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const open = () => {
    setVisible(true);
    void load();
  };

  const close = () => {
    Animated.parallel([
      Animated.timing(sheetTranslateY, {
        toValue: 420,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start(() => setVisible(false));
  };

  useEffect(() => {
    if (!visible) return;

    sheetTranslateY.setValue(420);
    backdropOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(sheetTranslateY, {
        toValue: 0,
        damping: 20,
        stiffness: 180,
        mass: 0.8,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, sheetTranslateY, visible]);

  const markRead = async (notification: BackendNotification) => {
    if (notification.isRead || markingId || isMarkingAll) return;
    setMarkingId(notification.id);
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ));
    } catch (error) {
      console.warn('[NotificationBell] Unable to mark notification as read', error);
    } finally {
      setMarkingId(null);
    }
  };

  const markAllRead = async () => {
    if (!unreadCount || isMarkingAll || markingId) return;
    setIsMarkingAll(true);
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.warn('[NotificationBell] Unable to mark notifications as read', error);
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <>
      <Pressable accessibilityLabel="Notifications" onPress={open} style={styles.button}>
        <Bell size={22} color={tintColor} />
        {unreadCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <Modal visible={visible} transparent animationType="none" onRequestClose={close} statusBarTranslucent>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable accessibilityLabel="Close notifications" onPress={close} style={StyleSheet.absoluteFill} />
          <Animated.View style={[styles.sheet, { transform: [{ translateY: sheetTranslateY }] }]}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <View style={styles.headerActions}>
                <Pressable
                  accessibilityLabel="Mark all notifications as read"
                  disabled={!unreadCount || isMarkingAll || !!markingId}
                  onPress={markAllRead}
                  style={styles.markAllButton}
                >
                  {isMarkingAll ? <ActivityIndicator size="small" color={colors.primary} /> : <CheckCheck size={18} color={colors.primary} />}
                  <Text style={[styles.markAllText, !unreadCount && styles.disabledText]}>Mark all read</Text>
                </Pressable>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.empty}><ActivityIndicator color={colors.primary} /></View>
            ) : loadError ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>{loadError}</Text>
                <Pressable accessibilityRole="button" onPress={() => void load()} style={styles.retryButton}>
                  <Text style={styles.retryText}>Try again</Text>
                </Pressable>
              </View>
            ) : notifications.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyText}>No notifications</Text></View>
            ) : (
              <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
                {notifications.map((notification) => (
                  <Pressable
                    key={notification.id}
                    onPress={() => void markRead(notification)}
                    style={[styles.item, !notification.isRead && styles.unreadItem]}
                  >
                    <View style={styles.itemCopy}>
                      <Text style={styles.itemTitle}>{notification.title || notification.type || 'Notification'}</Text>
                      <Text style={styles.itemMessage}>{notification.message}</Text>
                      <Text style={styles.itemDate}>
                        {notification.createdAt ? new Date(notification.createdAt).toLocaleString() : ''}
                      </Text>
                    </View>
                    {markingId === notification.id ? <ActivityIndicator size="small" color={colors.primary} /> : !notification.isRead ? <View style={styles.unreadDot} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </Animated.View>
        </Animated.View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  button: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' },
  badge: {
    position: 'absolute', top: 3, right: 2, minWidth: 17, height: 17, paddingHorizontal: 3,
    borderRadius: 9, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { ...getTypographyStyle('c3Caption', 'bold'), color: colors.primaryText },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.35)' },
  sheet: { maxHeight: '78%', backgroundColor: colors.background2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { ...getTypographyStyle('t3Title'), color: colors.textPrimary },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  markAllText: { ...getTypographyStyle('b3Button'), color: colors.primary },
  disabledText: { color: colors.textTertiary },
  list: { gap: 8, paddingBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'flex-start', padding: 13, borderRadius: 10, backgroundColor: colors.background },
  unreadItem: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  itemCopy: { flex: 1, gap: 4 },
  itemTitle: { ...getTypographyStyle('headline'), color: colors.textPrimary },
  itemMessage: { ...getTypographyStyle('c1Caption', 'regular'), color: colors.textSecondary },
  itemDate: { ...getTypographyStyle('c3Caption', 'regular'), color: colors.label },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4, marginLeft: 8 },
  empty: { minHeight: 150, alignItems: 'center', justifyContent: 'center' },
  emptyText: { ...getTypographyStyle('c1Caption', 'regular'), color: colors.label },
  retryButton: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999, backgroundColor: colors.primaryLight },
  retryText: { ...getTypographyStyle('b3Button'), color: colors.primary },
});
