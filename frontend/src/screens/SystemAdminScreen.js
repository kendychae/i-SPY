import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  RefreshControl,
  Linking,
  Platform,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import apiClient from '../services/api';
import { authService } from '../services/authService';

const ADMIN_ENDPOINTS = [
  {
    method: 'GET',
    path: '/auth/pending-verifications',
    description: 'List accounts waiting for approval',
  },
  {
    method: 'PATCH',
    path: '/auth/verify-user/:id',
    description: 'Approve or reject a pending account',
  },
];

const SystemAdminScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState(null);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [blocked, setBlocked] = useState(false);

  const loadPendingUsers = useCallback(async () => {
    if (!refreshing) {
      setLoading(true);
    }

    try {
      const currentUser = await authService.getCachedUser();
      if (currentUser?.userType !== 'admin') {
        setBlocked(true);
        setPendingUsers([]);
        return;
      }

      setBlocked(false);
      const response = await apiClient.get('/auth/pending-verifications');
      if (response.data?.success) {
        setPendingUsers(response.data.data.users || []);
      } else {
        setPendingUsers([]);
      }
    } catch (error) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to load admin queue.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useFocusEffect(
    useCallback(() => {
      loadPendingUsers();
    }, [loadPendingUsers])
  );

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
  };

  const handleDecision = async (userId, decision) => {
    const actionLabel = decision === 'approved' ? 'Approve' : 'Reject';

    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm(`Are you sure you want to ${actionLabel.toLowerCase()} this application?`)
          : true;
      if (!confirmed) return;

      setUpdatingUserId(userId);
      try {
        await apiClient.patch(`/auth/verify-user/${userId}`, {
          decision,
          notes:
            decision === 'approved'
              ? 'Approved via System Admin panel'
              : 'Rejected via System Admin panel',
        });
        setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
      } catch (error) {
        globalThis.alert?.(error.response?.data?.message || 'Failed to update verification status.');
      } finally {
        setUpdatingUserId(null);
      }
      return;
    }

    Alert.alert(
      `${actionLabel} Application`,
      `Are you sure you want to ${actionLabel.toLowerCase()} this application?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: actionLabel,
          style: decision === 'rejected' ? 'destructive' : 'default',
          onPress: async () => {
            setUpdatingUserId(userId);
            try {
              await apiClient.patch(`/auth/verify-user/${userId}`, {
                decision,
                notes:
                  decision === 'approved'
                    ? 'Approved via System Admin panel'
                    : 'Rejected via System Admin panel',
              });
              setPendingUsers((prev) => prev.filter((u) => u.id !== userId));
            } catch (error) {
              Alert.alert('Error', error.response?.data?.message || 'Failed to update verification status.');
            } finally {
              setUpdatingUserId(null);
            }
          },
        },
      ]
    );
  };

  const resolveDocumentUrl = (idDocumentUrl) => {
    if (!idDocumentUrl) {
      return null;
    }

    if (/^https?:\/\//i.test(idDocumentUrl)) {
      return idDocumentUrl;
    }

    const baseUrl = apiClient?.defaults?.baseURL || '';
    const backendOrigin = baseUrl.replace(/\/api\/v1\/?$/, '');
    const normalizedPath = idDocumentUrl.startsWith('/') ? idDocumentUrl : `/${idDocumentUrl}`;
    return `${backendOrigin}${normalizedPath}`;
  };

  const handlePreviewId = async (idDocumentUrl) => {
    const resolvedUrl = resolveDocumentUrl(idDocumentUrl);

    if (!resolvedUrl) {
      Alert.alert('Missing Document', 'No ID document URL was provided for this application.');
      return;
    }

    try {
      if (Platform.OS === 'web' && typeof globalThis.open === 'function') {
        globalThis.open(resolvedUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      const canOpen = await Linking.canOpenURL(resolvedUrl);
      if (!canOpen) {
        Alert.alert('Cannot Open Link', 'This ID document link cannot be opened on this device.');
        return;
      }

      await Linking.openURL(resolvedUrl);
    } catch (_) {
      Alert.alert('Preview Failed', 'Unable to open ID document preview.');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </SafeAreaView>
    );
  }

  if (blocked) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.blockedState}>
          <Text style={styles.blockedTitle}>Admin Access Required</Text>
          <Text style={styles.blockedText}>Only admin accounts can access this page.</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />}
      >
        <Text style={styles.title}>System Admin</Text>
        <Text style={styles.subtitle}>Manage all admin-privileged endpoints from one place.</Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Admin Endpoints</Text>
          {ADMIN_ENDPOINTS.map((item) => (
            <View key={`${item.method}:${item.path}`} style={styles.endpointRow}>
              <View style={styles.methodBadgeWrap}>
                <Text style={styles.methodBadge}>{item.method}</Text>
              </View>
              <View style={styles.endpointMeta}>
                <Text style={styles.endpointPath}>{item.path}</Text>
                <Text style={styles.endpointDesc}>{item.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Pending Applications ({pendingUsers.length})</Text>
          {pendingUsers.length === 0 ? (
            <Text style={styles.emptyText}>No applications are waiting for review.</Text>
          ) : (
            pendingUsers.map((user) => {
              const isUpdating = updatingUserId === user.id;
              return (
                <View key={user.id} style={styles.applicationCard}>
                  <Text style={styles.userName}>
                    {user.first_name} {user.last_name}
                  </Text>
                  <Text style={styles.userMeta}>{user.email}</Text>
                  <Text style={styles.userMeta}>Role requested: {user.user_type}</Text>
                  <Text style={styles.userMeta}>Document: {user.id_document_url || 'Not provided'}</Text>

                  <TouchableOpacity
                    style={[styles.previewButton, !user.id_document_url && styles.previewButtonDisabled]}
                    disabled={!user.id_document_url || isUpdating}
                    onPress={() => handlePreviewId(user.id_document_url)}
                  >
                    <Text style={styles.previewButtonText}>Preview ID</Text>
                  </TouchableOpacity>

                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.approveButton]}
                      disabled={isUpdating}
                      onPress={() => handleDecision(user.id, 'approved')}
                    >
                      <Text style={styles.actionButtonText}>Approve</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      disabled={isUpdating}
                      onPress={() => handleDecision(user.id, 'rejected')}
                    >
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>

                  {isUpdating ? <ActivityIndicator style={{ marginTop: 10 }} color="#007AFF" /> : null}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

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
    paddingBottom: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: '800',
    color: '#111827',
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 14,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#374151',
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  endpointRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  methodBadgeWrap: {
    marginRight: 10,
  },
  methodBadge: {
    backgroundColor: '#e5f0ff',
    color: '#1d4ed8',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    overflow: 'hidden',
  },
  endpointMeta: {
    flex: 1,
  },
  endpointPath: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  endpointDesc: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 2,
  },
  emptyText: {
    color: '#6b7280',
    fontSize: 14,
  },
  applicationCard: {
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    backgroundColor: '#fcfcfd',
  },
  userName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  userMeta: {
    marginTop: 2,
    fontSize: 13,
    color: '#4b5563',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  previewButton: {
    marginTop: 10,
    backgroundColor: '#0f766e',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  previewButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  previewButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  actionButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  approveButton: {
    backgroundColor: '#16a34a',
  },
  rejectButton: {
    backgroundColor: '#dc2626',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  blockedState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  blockedTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 8,
  },
  blockedText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 14,
    textAlign: 'center',
  },
  backButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 22,
  },
  backButtonText: {
    color: '#fff',
    fontWeight: '700',
  },
});

export default SystemAdminScreen;
