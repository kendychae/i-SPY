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
import { getCurrentLocation } from '../services/locationService';

const TYPE_ICONS = {
  report_status_change: '📋',
  report_assigned: '👮',
  nearby_incident: '📍',
  weekly_digest: '📊',
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  urgent: '#F44336',
};

const PRIORITY_ORDER = {
  urgent: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const PRIORITY_LIGHT_COLORS = {
  low: '#eaf7ec',
  medium: '#fff8df',
  high: '#fff1e6',
  urgent: '#fdebec',
};

const NotificationsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState([]);
  const [nearbyReports, setNearbyReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);

  const fetchNotifications = useCallback(async (pageNum = 1, append = false) => {
    try {
      const response = await apiClient.get(`/notifications?page=${pageNum}&limit=20`);
      if (response.data.success) {
        const { notifications: items, pagination } = response.data.data;
        setNotifications(prev => (append ? [...prev, ...items] : items));
        setTotalPages(pagination.totalPages);
        if (!append) {
          setPage(pageNum);
        }
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  }, []);

  const fetchNearbyReports = useCallback(async () => {
    try {
      setNearbyLoading(true);
      const location = await getCurrentLocation();

      if (!location) {
        setNearbyReports([]);
        return;
      }

      const response = await apiClient.get('/reports', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: 5000,
          status: 'submitted,under_review,investigating,in_progress',
          limit: 10,
        },
      });

      if (response.data.success) {
        const sortedReports = [...(response.data.data || [])].sort((a, b) => {
          const priorityA = PRIORITY_ORDER[a.priority] ?? 99;
          const priorityB = PRIORITY_ORDER[b.priority] ?? 99;

          if (priorityA !== priorityB) {
            return priorityA - priorityB;
          }

          const timeA = new Date(a.created_at || 0).getTime();
          const timeB = new Date(b.created_at || 0).getTime();
          return timeB - timeA;
        });

        setNearbyReports(sortedReports);
      }
    } catch (error) {
      console.error('Failed to fetch nearby reports:', error);
      setNearbyReports([]);
    } finally {
      setNearbyLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadScreen = async () => {
      await Promise.all([fetchNotifications(1), fetchNearbyReports()]);
    };

    loadScreen();
  }, [fetchNotifications, fetchNearbyReports]);

  const handleRefresh = () => {
    setRefreshing(true);
    Promise.all([fetchNotifications(1), fetchNearbyReports()]);
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
      const reportIds = notifications
        .map((notif) => notif.related_report_id)
        .filter(Boolean);
      const startIndex = reportIds.findIndex((id) => id === item.related_report_id);

      navigation.navigate('ReportDetail', {
        id: item.related_report_id,
        source: 'alerts',
        reportIds,
        startIndex: startIndex >= 0 ? startIndex : 0,
      });
    }
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleNearbyTap = (report) => {
    const reportIds = nearbyReports.map((item) => item.id).filter(Boolean);
    const startIndex = reportIds.findIndex((id) => id === report.id);

    navigation.navigate('ReportDetail', {
      id: report.id,
      source: 'alerts',
      reportIds,
      startIndex: startIndex >= 0 ? startIndex : 0,
    });
  };

  const renderNearbySection = () => (
    <View style={styles.sectionBlock}>
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Nearby reports</Text>
        <Text style={styles.sectionHint}>Within 5 km</Text>
      </View>

      {nearbyLoading ? (
        <View style={styles.inlineLoader}>
          <ActivityIndicator size="small" color="#007AFF" />
        </View>
      ) : nearbyReports.length === 0 ? (
        <View style={styles.sectionEmptyCard}>
          <Text style={styles.sectionEmptyTitle}>No nearby reports</Text>
          <Text style={styles.sectionEmptyText}>Pull to refresh after allowing location access.</Text>
        </View>
      ) : (
        nearbyReports.map((report) => (
          <TouchableOpacity
            key={report.id}
            style={[
              styles.reportCard,
              {
                backgroundColor: PRIORITY_LIGHT_COLORS[report.priority] || '#fff',
                borderColor: PRIORITY_COLORS[report.priority] || '#e5e7eb',
              },
            ]}
            onPress={() => handleNearbyTap(report)}
            activeOpacity={0.85}
          >
            <View
              style={[
                styles.priorityBanner,
                { backgroundColor: PRIORITY_COLORS[report.priority] || '#9CA3AF' },
              ]}
            >
              <Text style={styles.priorityBannerText}>{formatPriority(report.priority)} Priority Alert</Text>
            </View>

            <View style={styles.reportHeaderRow}>
              <Text style={styles.reportTitle} numberOfLines={1}>{report.title}</Text>
              <Text style={styles.reportDistance}>{formatDistance(report.distance_meters)}</Text>
            </View>
            <View style={styles.reportMetaRow}>
              <Text style={styles.reportMeta}>{formatIncidentType(report.incident_type)}</Text>
              <View
                style={[
                  styles.priorityBadge,
                  { backgroundColor: PRIORITY_COLORS[report.priority] || '#9CA3AF' },
                ]}
              >
                <Text style={styles.priorityBadgeText}>{formatPriority(report.priority)}</Text>
              </View>
            </View>
            <Text style={styles.reportBody} numberOfLines={2}>
              {report.address || report.description}
            </Text>
            <Text style={styles.reportTime}>{formatTime(report.created_at)}</Text>
          </TouchableOpacity>
        ))
      )}
    </View>
  );

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.notifCard, !item.is_read && styles.unreadCard]}
      onPress={() => handleTap(item)}
      onLongPress={() => handleDelete(item.id)}
      activeOpacity={0.85}
    >
      <View style={styles.iconCol}>
        <Text style={styles.icon}>{TYPE_ICONS[item.type] || '🔔'}</Text>
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
          Alerts{unreadCount > 0 ? ` (${unreadCount})` : ''}
        </Text>
        {unreadCount > 0 && (
          <TouchableOpacity onPress={handleMarkAllRead}>
            <Text style={styles.markAllText}>Mark all read</Text>
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.4}
        ListHeaderComponent={
          <View>
            {renderNearbySection()}
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionTitle}>Notification history</Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔕</Text>
            <Text style={styles.emptyTitle}>No notification history</Text>
            <Text style={styles.emptySubtitle}>
              Nearby reports still appear above when location is available.
            </Text>
          </View>
        }
        ListFooterComponent={renderFooter}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      />
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

function formatDistance(distanceMeters) {
  const value = Number(distanceMeters);
  if (!Number.isFinite(value)) return '';
  if (value < 1000) return `${Math.round(value)} m`;
  return `${(value / 1000).toFixed(1)} km`;
}

function formatIncidentType(type) {
  if (!type) return 'Incident';
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatPriority(priority) {
  if (!priority) return 'Priority unknown';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
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

  sectionBlock: {
    marginBottom: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  sectionHint: {
    fontSize: 12,
    color: '#8e8e93',
    fontWeight: '600',
  },
  inlineLoader: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  sectionEmptyCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
  },
  sectionEmptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#1c1c1e',
    marginBottom: 4,
  },
  sectionEmptyText: {
    fontSize: 13,
    color: '#636366',
    lineHeight: 18,
  },
  reportCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  priorityBanner: {
    marginHorizontal: -14,
    marginTop: -14,
    marginBottom: 10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  priorityBannerText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  reportHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: 8,
  },
  reportTitle: {
    flex: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#1c1c1e',
  },
  reportDistance: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '700',
  },
  reportMeta: {
    fontSize: 12,
    color: '#636366',
  },
  reportMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
    gap: 8,
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  reportBody: {
    fontSize: 13,
    color: '#3a3a3c',
    lineHeight: 18,
  },
  reportTime: {
    fontSize: 12,
    color: '#8e8e93',
    marginTop: 8,
  },

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
  icon: { fontSize: 22 },
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
