/**
 * OfficerDashboardScreen.js
 * Issue #62 — W6: Officer Dashboard Screen — React Native UI
 *
 * Officers see all reports in a priority queue, can claim and unclaim cases,
 * and filter by All | Mine | Unassigned tabs.
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
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';

const PRIORITY_COLORS = {
  urgent: '#D32F2F',
  high:   '#F57C00',
  medium: '#F9A825',
  low:    '#388E3C',
};

const STATUS_LABELS = {
  submitted:      'Submitted',
  under_review:   'Under Review',
  investigating:  'Investigating',
  resolved:       'Resolved',
  closed:         'Closed',
};

const TABS = [
  { key: 'all',        label: 'All' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'mine',       label: 'Mine' },
];

const OfficerDashboardScreen = ({ navigation }) => {
  const [reports, setReports]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab]   = useState('all');

  const fetchReports = useCallback(async (tab = 'all') => {
    try {
      let endpoint = '/officer/reports';
      if (tab === 'unassigned') {
        endpoint = '/officer/reports/queue';
      } else if (tab === 'mine') {
        endpoint = '/officer/reports?assignedTo=me';
      }
      const response = await api.get(endpoint);
      if (response.data.success) {
        const items = response.data.data?.reports ?? response.data.data ?? [];
        setReports(items);
      }
    } catch (error) {
      console.error('Failed to fetch officer reports:', error);
      Alert.alert('Error', 'Could not load reports. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchReports(activeTab);
  }, [fetchReports, activeTab]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReports(activeTab);
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setLoading(true);
  };

  const handleClaim = async (report) => {
    // Optimistic update
    setReports(prev =>
      prev.map(r =>
        r.id === report.id
          ? { ...r, status: 'under_review', assigned_to: 'me' }
          : r
      )
    );
    try {
      await api.patch(`/officer/reports/${report.id}/assign`);
    } catch (error) {
      // Revert
      setReports(prev =>
        prev.map(r => (r.id === report.id ? report : r))
      );
      Alert.alert('Error', 'Could not claim this report. Please try again.');
    }
  };

  const handleUnclaim = async (report) => {
    setReports(prev =>
      prev.map(r =>
        r.id === report.id ? { ...r, assigned_to: null } : r
      )
    );
    try {
      await api.patch(`/officer/reports/${report.id}/unassign`);
    } catch (error) {
      setReports(prev =>
        prev.map(r => (r.id === report.id ? report : r))
      );
      Alert.alert('Error', 'Could not unclaim this report. Please try again.');
    }
  };

  const renderPriorityChip = (priority) => (
    <View style={[styles.priorityChip, { backgroundColor: PRIORITY_COLORS[priority] || '#607D8B' }]}>
      <Text style={styles.priorityChipText}>{priority?.toUpperCase()}</Text>
    </View>
  );

  const renderStatusBadge = (status) => (
    <View style={styles.statusBadge}>
      <Text style={styles.statusBadgeText}>{STATUS_LABELS[status] || status}</Text>
    </View>
  );

  const renderItem = ({ item }) => {
    const isMine = !!item.assigned_to;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate('ReportDetail', { id: item.id })}
        activeOpacity={0.85}
      >
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle} numberOfLines={1}>{item.title}</Text>
            {renderPriorityChip(item.priority)}
          </View>
          {renderStatusBadge(item.status)}
        </View>

        <Text style={styles.cardType}>
          {(item.incident_type || '').replace(/_/g, ' ').toUpperCase()}
        </Text>
        <Text style={styles.cardDescription} numberOfLines={2}>
          {item.description}
        </Text>

        {item.distance_meters != null && (
          <Text style={styles.cardDistance}>
            {(item.distance_meters / 1000).toFixed(1)} km away
          </Text>
        )}

        <View style={styles.cardFooter}>
          {isMine ? (
            <TouchableOpacity
              style={styles.unclaimButton}
              onPress={() => handleUnclaim(item)}
            >
              <Text style={styles.unclaimButtonText}>Release</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.claimButton}
              onPress={() => handleClaim(item)}
            >
              <Text style={styles.claimButtonText}>Claim</Text>
            </TouchableOpacity>
          )}
          <Text style={styles.cardDate}>
            {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyState}>
      <Ionicons name="shield-checkmark-outline" size={64} color="#B0BEC5" />
      <Text style={styles.emptyTitle}>Queue is clear</Text>
      <Text style={styles.emptySubtitle}>
        {activeTab === 'mine'
          ? 'You have no assigned reports.'
          : 'No active reports in this queue.'}
      </Text>
    </View>
  );

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
      {/* Tab bar */}
      <View style={styles.tabBar}>
        {TABS.map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => handleTabChange(tab.key)}
          >
            <Text style={[styles.tabLabel, activeTab === tab.key && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={reports}
        keyExtractor={item => String(item.id)}
        renderItem={renderItem}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={reports.length === 0 ? styles.emptyContainer : styles.list}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: '#f0f2f5' },
  centered:       { flex: 1, justifyContent: 'center', alignItems: 'center' },
  list:           { padding: 12 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },

  // Tabs
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabActive: {
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  tabLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#757575',
  },
  tabLabelActive: {
    color: '#007AFF',
    fontWeight: '700',
  },

  // Report cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  cardTitleRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    flex: 1,
    marginRight: 8,
  },
  priorityChip: {
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  priorityChipText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  statusBadge: {
    backgroundColor: '#E3F2FD',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  statusBadgeText: {
    color: '#1565C0',
    fontSize: 11,
    fontWeight: '600',
  },
  cardType: {
    fontSize: 11,
    color: '#9E9E9E',
    fontWeight: '600',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 13,
    color: '#424242',
    lineHeight: 18,
    marginBottom: 8,
  },
  cardDistance: {
    fontSize: 12,
    color: '#607D8B',
    marginBottom: 8,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  claimButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  claimButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  unclaimButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#B0BEC5',
    paddingHorizontal: 18,
    paddingVertical: 7,
  },
  unclaimButtonText: {
    color: '#607D8B',
    fontSize: 13,
    fontWeight: '600',
  },
  cardDate: {
    fontSize: 11,
    color: '#9E9E9E',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#424242',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'center',
  },
});

export default OfficerDashboardScreen;
