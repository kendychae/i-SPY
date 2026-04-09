import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import api from '../services/api';

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  urgent: '#F44336',
};

const PRIORITY_LIGHT_COLORS = {
  low: '#eaf7ec',
  medium: '#fff8df',
  high: '#fff1e6',
  urgent: '#fdebec',
};

const HomeScreen = ({ navigation }) => {
  const [latestReports, setLatestReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(true);

  const fetchLatestReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const response = await api.get('/reports', {
        params: {
          limit: 3,
          sort: 'created_at',
          order: 'desc',
        },
      });

      if (response.data?.success) {
        setLatestReports(response.data.data || []);
      } else {
        setLatestReports([]);
      }
    } catch (error) {
      console.error('Failed to fetch latest reports:', error);
      setLatestReports([]);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchLatestReports();
    }, [fetchLatestReports])
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Welcome to VIGILUX</Text>
          <Text style={styles.subtitle}>Your neighborhood watch companion</Text>
        </View>

        <View style={styles.quickActions}>
          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Report')}
          >
            <Text style={styles.actionIcon}>📝</Text>
            <Text style={styles.actionTitle}>Submit Report</Text>
            <Text style={styles.actionSubtitle}>Report an incident</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionCard}
            onPress={() => navigation.navigate('Map')}
          >
            <Text style={styles.actionIcon}>🗺️</Text>
            <Text style={styles.actionTitle}>View Map</Text>
            <Text style={styles.actionSubtitle}>See nearby reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Activity</Text>

          {loadingReports ? (
            <View style={styles.placeholder}>
              <ActivityIndicator size="small" color="#007AFF" />
              <Text style={styles.placeholderText}>Loading latest reports...</Text>
            </View>
          ) : latestReports.length === 0 ? (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>No recent reports yet</Text>
            </View>
          ) : (
            latestReports.map((report) => (
              <View
                key={report.id}
                style={[
                  styles.reportCard,
                  {
                    backgroundColor: PRIORITY_LIGHT_COLORS[report.priority] || '#fff',
                    borderColor: PRIORITY_COLORS[report.priority] || '#e5e7eb',
                  },
                ]}
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
                  <Text style={styles.reportDistance}>{formatTime(report.created_at)}</Text>
                </View>

                <View style={styles.reportMetaRow}>
                  <Text style={styles.reportMeta} numberOfLines={1}>{formatIncidentType(report.incident_type)}</Text>
                  <View
                    style={[
                      styles.priorityBadge,
                      { backgroundColor: PRIORITY_COLORS[report.priority] || '#9CA3AF' },
                    ]}
                  >
                    <Text style={styles.priorityBadgeText}>{formatPriority(report.priority)}</Text>
                  </View>
                </View>

                <Text style={styles.reportDescription} numberOfLines={2}>
                  {report.address || report.description || 'No details provided'}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function formatPriority(priority) {
  if (!priority) return 'Unknown';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatIncidentType(type) {
  if (!type) return 'Incident';
  return type
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatTime(iso) {
  if (!iso) return 'Unknown time';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return date.toLocaleDateString();
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  quickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 6,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  placeholder: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
  },
  placeholderText: {
    color: '#999',
    fontSize: 14,
    marginTop: 10,
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
    flex: 1,
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
  reportDescription: {
    fontSize: 13,
    color: '#3a3a3c',
    lineHeight: 18,
  },
});

export default HomeScreen;
