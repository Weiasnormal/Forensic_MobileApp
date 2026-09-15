import { colors } from '@/constants/colors';
import {
    fetchNotifications,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    type BackendNotification,
} from '@/services/notificationsApi';
import { Bell, CheckCheck } from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  tintColor?: string;
};

export default function NotificationBell({ tintColor = colors.textPrimary }: Props) {
  const [visible, setVisible] = useState(false);
  const [notifications, setNotifications] = useState<BackendNotification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const load = async () => {
    setIsLoading(true);
    try {
      setNotifications(await fetchNotifications());
    } catch (error) {
      console.warn('[NotificationBell] Unable to load notifications', error);
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

  const markRead = async (notification: BackendNotification) => {
    if (notification.isRead) return;
    try {
      await markNotificationAsRead(notification.id);
      setNotifications((current) => current.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ));
    } catch (error) {
      console.warn('[NotificationBell] Unable to mark notification as read', error);
    }
  };

  const markAllRead = async () => {
    if (!unreadCount) return;
    try {
      await markAllNotificationsAsRead();
      setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    } catch (error) {
      console.warn('[NotificationBell] Unable to mark notifications as read', error);
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

      <Modal visible={visible} transparent animationType="slide" onRequestClose={() => setVisible(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.header}>
              <Text style={styles.title}>Notifications</Text>
              <View style={styles.headerActions}>
                <Pressable accessibilityLabel="Mark all notifications as read" onPress={markAllRead} style={styles.markAllButton}>
                  <CheckCheck size={18} color={colors.primary} />
                  <Text style={styles.markAllText}>Mark all read</Text>
                </Pressable>
                <Pressable accessibilityLabel="Close notifications" onPress={() => setVisible(false)} style={styles.closeButton}>
                  <Text style={styles.closeText}>Close</Text>
                </Pressable>
              </View>
            </View>

            {isLoading ? (
              <View style={styles.empty}><ActivityIndicator color={colors.primary} /></View>
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
                    {!notification.isRead ? <View style={styles.unreadDot} /> : null}
                  </Pressable>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
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
  badgeText: { color: colors.primaryText, fontSize: 10, fontWeight: '700' },
  backdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(15, 23, 42, 0.35)' },
  sheet: { maxHeight: '78%', backgroundColor: colors.background2, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 20 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  title: { color: colors.textPrimary, fontSize: 20, fontWeight: '700' },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  markAllButton: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  markAllText: { color: colors.primary, fontSize: 12, fontWeight: '600' },
  closeButton: { paddingVertical: 6 },
  closeText: { color: colors.label, fontSize: 12, fontWeight: '600' },
  list: { gap: 8, paddingBottom: 12 },
  item: { flexDirection: 'row', alignItems: 'flex-start', padding: 13, borderRadius: 10, backgroundColor: colors.background },
  unreadItem: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  itemCopy: { flex: 1, gap: 4 },
  itemTitle: { color: colors.textPrimary, fontSize: 14, fontWeight: '700' },
  itemMessage: { color: colors.textSecondary, fontSize: 13, lineHeight: 19 },
  itemDate: { color: colors.label, fontSize: 11 },
  unreadDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary, marginTop: 4, marginLeft: 8 },
  empty: { minHeight: 150, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: colors.label, fontSize: 14 },
});
