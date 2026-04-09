import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  TouchableOpacity,
  Alert,
} from 'react-native';
import apiClient from '../services/api';
import { authService } from '../services/authService';
import MediaPreview from '../components/MediaPreview';
import { Ionicons } from '@expo/vector-icons';

const INCIDENT_LABELS = {
  theft: 'Theft',
  vandalism: 'Vandalism',
  assault: 'Assault',
  suspicious_activity: 'Suspicious Activity',
  traffic_violation: 'Traffic Violation',
  noise_complaint: 'Noise Complaint',
  fire: 'Fire',
  medical_emergency: 'Medical Emergency',
  other: 'Other',
};

const STATUS_LABELS = {
  submitted: 'Submitted',
  under_review: 'Under Review',
  investigating: 'Investigating',
  resolved: 'Resolved',
  closed: 'Closed',
};

const ReportDetailScreen = ({ route, navigation }) => {
  const reportId = route?.params?.id || route?.params?.reportId;

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchHistory = useCallback(async () => {
    setHistoryLoading(true);
    try {
      const historyResponse = await apiClient.get(`/reports/${reportId}/status-history`);
      if (historyResponse.data?.success) {
        setHistory(historyResponse.data.data.history || []);
      }
    } catch (_) {
      // history failure is non-fatal — show empty state
    } finally {
      setHistoryLoading(false);
    }
  }, [reportId]);

  const fetchReportData = useCallback(async () => {
    if (!reportId) {
      setError('No report selected.');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setError(null);
    try {
      // Critical path: report + local user cache (fast)
      const [reportResponse, cachedUser] = await Promise.all([
        apiClient.get(`/reports/${reportId}`),
        authService.getCachedUser(),
      ]);

      if (reportResponse.data?.success) {
        setReport(reportResponse.data.data);
      } else {
        throw new Error(reportResponse.data?.message || 'Unable to load report.');
      }

      setCurrentUser(cachedUser || null);
    } catch (fetchError) {
      console.error('Report detail fetch error:', fetchError);
      setError('Unable to load report details. Pull down to try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }

    // Non-critical: load history in the background after content is visible
    fetchHistory();
  }, [reportId, fetchHistory]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const handleRefresh = () => {
    setRefreshing(true);
    setHistory([]);
    fetchReportData();
  };

  const handleEditPress = () => {
    Alert.alert('Edit Report', 'Editing is not available from this preview screen yet.');
  };

  const canEdit = report && currentUser && report.user_id === currentUser.id;

  // Pre-format history timestamps once instead of on every render
  const formattedHistory = useMemo(
    () => history.map((entry) => ({ ...entry, _formattedDate: formatDateTime(entry.changed_at) })),
    [history]
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
          }
        >
          <View style={styles.emptyState}>
            <Ionicons name="warning-outline" size={64} color="#F59E0B" />
            <Text style={styles.emptyTitle}>Could not load report</Text>
            <Text style={styles.emptySubtitle}>{error}</Text>
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const mediaItems = report?.media?.map((item) => ({ uri: item.file_url })) || [];
  const ownerName = report?.user_first_name || report?.user_last_name ? `${report.user_first_name || ''} ${report.user_last_name || ''}`.trim() : 'Report owner';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#007AFF" />
        }
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>{report.title}</Text>
            <Text style={styles.subtitle}>{STATUS_LABELS[report.status] || report.status}</Text>
          </View>
          {canEdit && (
            <TouchableOpacity style={styles.editButton} onPress={handleEditPress}>
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Incident Details</Text>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Type</Text>
            <Text style={styles.detailValue}>{INCIDENT_LABELS[report.incident_type] || report.incident_type || 'Unknown'}</Text>
          </View>
          {report.priority ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Priority</Text>
              <Text style={styles.detailValue}>{report.priority}</Text>
            </View>
          ) : null}
          {report.incident_date ? (
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Reported</Text>
              <Text style={styles.detailValue}>{formatDateTime(report.incident_date)}</Text>
            </View>
          ) : null}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Location</Text>
            <Text style={styles.detailValue} numberOfLines={2}>
              {report.address || formatCoordinates(report.latitude, report.longitude) || 'Not available'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{report.description || 'No description provided.'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Photos</Text>
          {mediaItems.length > 0 ? (
            <MediaPreview media={mediaItems} editable={false} maxItems={10} />
          ) : (
            <View style={styles.emptyStateSmall}>
              <Text style={styles.emptySubtitle}>No photos were attached to this report.</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Status History</Text>
          {historyLoading ? (
            <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 16 }} />
          ) : formattedHistory.length === 0 ? (
            <View style={styles.emptyStateSmall}>
              <Text style={styles.emptySubtitle}>No status changes yet.</Text>
            </View>
          ) : (
            formattedHistory.map((entry, index) => (
              <View key={entry.id || `${index}`} style={styles.timelineRow}>
                <View style={styles.timelineMarkerColumn}>
                  <View style={[styles.timelineDot, index === formattedHistory.length - 1 && styles.timelineDotLast]} />
                  {index < formattedHistory.length - 1 && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <Text style={styles.timelineStatus}>{STATUS_LABELS[entry.new_status] || entry.new_status}</Text>
                  <Text style={styles.timelineSubtitle} numberOfLines={1}>
                    {entry.first_name || entry.last_name ? `${entry.first_name || ''} ${entry.last_name || ''}`.trim() : 'Unknown user'} • {entry._formattedDate}
                  </Text>
                  {entry.notes ? <Text style={styles.timelineNotes}>{entry.notes}</Text> : null}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

function formatDateTime(isoString) {
  if (!isoString) return '';
  const date = new Date(isoString);
  return date.toLocaleString();
}

function formatCoordinates(lat, lng) {
  if (lat == null || lng == null) return null;
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f2f2f7',
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    flex: 1,
  },
  subtitle: {
    marginTop: 6,
    color: '#6b7280',
    fontSize: 14,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingVertical: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
    flex: 0.45,
  },
  detailValue: {
    fontSize: 14,
    color: '#111827',
    flex: 0.55,
    textAlign: 'right',
  },
  descriptionText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#374151',
  },
  emptyStateSmall: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  emptySubtitle: {
    color: '#6b7280',
    fontSize: 14,
    textAlign: 'center',
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineMarkerColumn: {
    width: 24,
    alignItems: 'center',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#007AFF',
    marginTop: 2,
  },
  timelineDotLast: {
    backgroundColor: '#4ade80',
  },
  timelineLine: {
    flex: 1,
    width: 2,
    backgroundColor: '#d1d5db',
    marginTop: 4,
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 16,
  },
  timelineStatus: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  timelineSubtitle: {
    color: '#6b7280',
    fontSize: 13,
    marginBottom: 6,
  },
  timelineNotes: {
    color: '#374151',
    fontSize: 14,
    lineHeight: 20,
  },
});

export default ReportDetailScreen;
