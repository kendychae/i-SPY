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

const STATUS_TRANSITIONS = {
  submitted:    ['under_review', 'closed'],
  under_review: ['investigating', 'submitted', 'closed'],
  investigating:['resolved', 'under_review', 'closed'],
  resolved:     ['closed', 'submitted'],
  closed:       ['submitted'],
};

const STATUS_ACTION_CONFIG = {
  under_review:  { label: 'Mark Under Review', color: '#3B82F6' },
  investigating: { label: 'Mark In Progress',  color: '#F59E0B' },
  resolved:      { label: 'Mark Completed',    color: '#10B981' },
  submitted:     { label: 'Re-open Report',    color: '#8B5CF6' },
  closed:        { label: 'Close Report',      color: '#6B7280' },
};

const ReportDetailScreen = ({ route, navigation }) => {
  const reportId = route?.params?.id || route?.params?.reportId;
  const source = route?.params?.source;
  const reportIds = Array.isArray(route?.params?.reportIds) ? route.params.reportIds : [];
  const currentAlertIndex = reportIds.findIndex((id) => id === reportId);
  const canCycleReports = source === 'alerts' && reportIds.length > 1 && currentAlertIndex >= 0;

  const [report, setReport] = useState(null);
  const [history, setHistory] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

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

  const handleBackToAlerts = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('AlertsTab');
  };

  const handlePreviousReport = () => {
    if (!canCycleReports) {
      return;
    }

    const previousIndex = (currentAlertIndex - 1 + reportIds.length) % reportIds.length;
    const previousId = reportIds[previousIndex];

    navigation.replace('ReportDetail', {
      id: previousId,
      source: 'alerts',
      reportIds,
      startIndex: previousIndex,
    });
  };

  const handleNextReport = () => {
    if (!canCycleReports) {
      return;
    }

    const nextIndex = (currentAlertIndex + 1) % reportIds.length;
    const nextId = reportIds[nextIndex];

    navigation.replace('ReportDetail', {
      id: nextId,
      source: 'alerts',
      reportIds,
      startIndex: nextIndex,
    });
  };

  const canEdit = report && currentUser && report.user_id === currentUser.id;
  const isOfficer = currentUser?.user_type === 'officer' || currentUser?.user_type === 'admin';
  const validNextStatuses = report ? (STATUS_TRANSITIONS[report.status] || []) : [];

  const handleStatusUpdate = (newStatus) => {
    const config = STATUS_ACTION_CONFIG[newStatus];
    Alert.alert(
      config.label,
      `Change status to "${STATUS_LABELS[newStatus] || newStatus}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            setStatusUpdating(true);
            try {
              await apiClient.patch(`/reports/${reportId}/status`, { status: newStatus });
              setRefreshing(true);
              setHistory([]);
              fetchReportData();
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to update status.');
            } finally {
              setStatusUpdating(false);
            }
          },
        },
      ]
    );
  };

  const handleRemoveReport = () => {
    Alert.alert(
      'Remove Report',
      'This will close the report and remove it from active alerts.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            setStatusUpdating(true);
            try {
              await apiClient.delete(`/reports/${reportId}`);
              Alert.alert('Removed', 'Report has been removed.', [
                { text: 'OK', onPress: () => {
                  if (navigation.canGoBack()) navigation.goBack();
                  else navigation.navigate('AlertsTab');
                }},
              ]);
            } catch (e) {
              Alert.alert('Error', e.response?.data?.message || 'Failed to remove report.');
              setStatusUpdating(false);
            }
          },
        },
      ]
    );
  };

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
            <Text style={styles.emptyIcon}>⚠️</Text>
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
        {source === 'alerts' && report?.priority ? (
          <View
            style={[
              styles.priorityAlertBanner,
              {
                backgroundColor: PRIORITY_COLORS[report.priority] || '#9CA3AF',
                borderColor: PRIORITY_COLORS[report.priority] || '#9CA3AF',
              },
            ]}
          >
            <Text style={styles.priorityAlertBannerText}>
              {formatPriorityLabel(report.priority)} Priority Alert
            </Text>
            <Text style={styles.priorityAlertBannerSubtext}>Opened from Alerts</Text>
          </View>
        ) : null}

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

        <View
          style={[
            styles.card,
            source === 'alerts' && report?.priority
              ? {
                  backgroundColor: PRIORITY_LIGHT_COLORS[report.priority] || '#fff',
                  borderColor: PRIORITY_COLORS[report.priority] || '#e5e7eb',
                  borderWidth: 1,
                }
              : null,
          ]}
        >
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

        {isOfficer ? (
          <View style={styles.officerCard}>
            <Text style={styles.officerCardTitle}>Officer Actions</Text>
            {statusUpdating ? (
              <ActivityIndicator size="small" color="#007AFF" style={{ marginVertical: 12 }} />
            ) : (
              <>
                {validNextStatuses
                  .filter((s) => s !== 'closed')
                  .map((nextStatus) => {
                    const cfg = STATUS_ACTION_CONFIG[nextStatus];
                    return (
                      <TouchableOpacity
                        key={nextStatus}
                        style={[styles.officerActionButton, { backgroundColor: cfg.color }]}
                        onPress={() => handleStatusUpdate(nextStatus)}
                        disabled={statusUpdating}
                      >
                        <Text style={styles.officerActionButtonText}>{cfg.label}</Text>
                      </TouchableOpacity>
                    );
                  })}
                {report.status !== 'closed' ? (
                  <TouchableOpacity
                    style={styles.officerRemoveButton}
                    onPress={handleRemoveReport}
                    disabled={statusUpdating}
                  >
                    <Text style={styles.officerRemoveButtonText}>Remove Report</Text>
                  </TouchableOpacity>
                ) : null}
              </>
            )}
          </View>
        ) : null}

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

        {source === 'alerts' ? (
          <View style={styles.alertNavSection}>
            <TouchableOpacity style={styles.backButton} onPress={handleBackToAlerts}>
              <Text style={styles.backButtonText}>← Back to Alerts</Text>
            </TouchableOpacity>

            <View style={styles.navButtonsRow}>
              <TouchableOpacity
                style={[styles.previousButton, !canCycleReports && styles.nextButtonDisabled]}
                onPress={handlePreviousReport}
                disabled={!canCycleReports}
              >
                <Text style={styles.previousButtonText}>← Previous</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.nextButton, !canCycleReports && styles.nextButtonDisabled]}
                onPress={handleNextReport}
                disabled={!canCycleReports}
              >
                <Text style={styles.nextButtonText}>Next →</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : null}
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

function formatPriorityLabel(priority) {
  if (!priority) return 'Unknown';
  return priority.charAt(0).toUpperCase() + priority.slice(1);
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
  priorityAlertBanner: {
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
  },
  priorityAlertBannerText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  priorityAlertBannerSubtext: {
    color: '#fff',
    fontSize: 12,
    opacity: 0.95,
    marginTop: 2,
    fontWeight: '600',
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
  alertNavSection: {
    marginBottom: 10,
    gap: 10,
  },
  navButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  backButton: {
    backgroundColor: '#e5e7eb',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#111827',
    fontWeight: '700',
    fontSize: 14,
  },
  previousButton: {
    flex: 1,
    backgroundColor: '#1f2937',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  previousButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  nextButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  nextButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 14,
  },
  officerCard: {
    backgroundColor: '#1e293b',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
  },
  officerCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#94a3b8',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  officerActionButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginBottom: 8,
  },
  officerActionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  officerRemoveButton: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  officerRemoveButtonText: {
    color: '#ef4444',
    fontWeight: '700',
    fontSize: 15,
  },
});

export default ReportDetailScreen;
