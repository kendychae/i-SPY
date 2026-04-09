/**
 * NotificationsScreen.js
 * Issue #54 — W5: Notification Listener & Notification History Screen
 *
 * Shows paginated list of past notifications with:
 * - Read / unread indicator
 * - Swipe-to-dismiss (via long-press delete)
 * - "Mark all as read" button
 * - Empty state
 * - Tap navigates to relevant report detail (when available)
 */
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import apiClient from '../services/api';

const TYPE_LABELS = {
  report_status_change: 'Status',
  report_assigned:      'Assigned',
  nearby_incident:      'Nearby',
  weekly_digest:        'Digest',
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await apiClient.get(`/notifications?page=${pageNum}&limit=20`);
      if (response.data.success) {
        const { notifications: items, pagination } = response.data.data;
        setNotifications(prev => (append ? [...prev, ...items] : items));
        setTotalPages(pagination.totalPages);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications(1);
  }, [fetchNotifications]);

  const handleRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchNotifications(1);
  };

  const handleLoadMore = () => {
    if (loadingMore || page >= totalPages) return;
    const nextPage = page + 1;
    setPage(nextPage);
    setLoadingMore(true);
    fetchNotifications(nextPage, true);
  };

  const handleMarkAllRead = async () => {
    try {
      await apiClient.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      Alert.alert('Error', 'Failed to mark all as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await apiClient.patch(`/notifications/${id}/read`);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch (error) {
      // Non-critical — ignore
    }
  };

  const handleDelete = (id) => {
    Alert.alert(
      'Remove Notification',
      'Delete this notification?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiClient.delete(`/notifications/${id}`);
              setNotifications(prev => prev.filter(n => n.id !== id));
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notification');
            }
          },
        },
      ]
    );
  };

  const handleTap = (item) => {
    handleMarkRead(item.id);
    if (item.related_report_id) {
      navigation.navigate('ReportDetail', { id: item.related_report_id });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleTap(item)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.85}
    >
      <View style={styles.iconCol}>
        <View style={styles.iconBadge}>
          <Text style={styles.iconBadgeText}>{TYPE_LABELS[item.type] ?? 'Alert'}</Text>
        </View>
        {!item.is_read && <View style={styles.unreadDot} />}
      </View>
      <View style={styles.textCol}>
        <Text style={[styles.notifTitle, !item.is_read && styles.boldTitle]} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.notifBody} numberOfLines={2}>{item.message}</Text>
        <Text style={styles.notifTime}>{formatTime(item.created_at)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#007AFF" />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Notifications{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      {notifications.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}></Text>
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySubtitle}>
            You'll see updates about your reports and local incidents here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
          }
        />
      )}
    </SafeAreaView>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5ea',
  },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#1c1c1e' },
  markAllText: { fontSize: 14, color: '#007AFF', fontWeight: '500' },

  list: { padding: 12 },

  notifCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 10,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  unreadCard: { borderLeftWidth: 3, borderLeftColor: '#007AFF' },

  iconCol: { width: 40, alignItems: 'center', marginRight: 12 },
  iconBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 3,
    minWidth: 40,
    alignItems: 'center',
  },
  iconBadgeText: {
    color: '#1565C0',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#007AFF',
    marginTop: 4,
  },

  textCol: { flex: 1 },
  notifTitle: { fontSize: 15, color: '#1c1c1e', marginBottom: 2 },
  boldTitle: { fontWeight: '700' },
  notifBody: { fontSize: 13, color: '#636366', lineHeight: 18 },
  notifTime: { fontSize: 12, color: '#aeaeb2', marginTop: 4 },

  footerLoader: { paddingVertical: 16, alignItems: 'center' },

  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyIcon: { fontSize: 56, marginBottom: 16 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#1c1c1e', marginBottom: 8 },
  emptySubtitle: { fontSize: 15, color: '#8e8e93', textAlign: 'center', lineHeight: 22 },
});

export default NotificationsScreen;
