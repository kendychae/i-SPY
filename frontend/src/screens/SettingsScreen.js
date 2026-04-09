/**
 * SettingsScreen.js
 * Issue #47 — W5: Settings Screen — Notifications & Privacy Preferences
 *
 * Two sections:
 *  - Notifications: push enabled, report status changes, nearby incidents, weekly digest
 *  - Privacy: location sharing visibility, account visibility
 *
 * Also provides: Change Password navigation and Sign Out.
 */
import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  Switch,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import apiClient from '../services/api';
import { authService } from '../services/authService';
import { AuthContext } from '../App';

const SettingsScreen = ({ navigation }) => {
  const { setIsAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [prefs, setPrefs] = useState({
    push_enabled: true,
    status_changes: true,
    nearby_incidents: false,
    weekly_digest: false,
    location_sharing_public: false,
    account_visible_to_public: true,
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const response = await apiClient.get('/users/preferences');
      if (response.data.success) {
        setPrefs(response.data.data.preferences);
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePref = async (key, value) => {
    const updated = { ...prefs, [key]: value };
    setPrefs(updated);
    setSaving(true);
    try {
      await apiClient.put('/users/preferences', updated);
    } catch (error) {
      // Revert on failure
      setPrefs(prefs);
      Alert.alert('Error', 'Failed to save preference. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const performSignOut = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const handleSignOut = async () => {
    if (Platform.OS === 'web') {
      const confirmed =
        typeof globalThis.confirm === 'function'
          ? globalThis.confirm('Are you sure you want to sign out?')
          : true;

      if (!confirmed) {
        return;
      }

      await performSignOut();
      return;
    }

    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: performSignOut,
      },
    ]);
  };

  const handleChangePassword = () => {
    navigation.navigate('ForgotPassword');
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Notifications Section ── */}
        <Text style={styles.sectionHeader}>Notifications</Text>
        <View style={styles.card}>

          <ToggleRow
            label="Push Notifications"
            description="Enable all push notifications"
            value={prefs.push_enabled}
            onValueChange={(v) => updatePref('push_enabled', v)}
            disabled={saving}
          />
          <Divider />
          <ToggleRow
            label="Report Status Changes"
            description="Alert me when my report status changes"
            value={prefs.status_changes}
            onValueChange={(v) => updatePref('status_changes', v)}
            disabled={saving || !prefs.push_enabled}
          />
          <Divider />
          <ToggleRow
            label="Nearby Incidents"
            description="Alert me about new reports near my location"
            value={prefs.nearby_incidents}
            onValueChange={(v) => updatePref('nearby_incidents', v)}
            disabled={saving || !prefs.push_enabled}
          />
          <Divider />
          <ToggleRow
            label="Weekly Digest"
            description="Receive a weekly summary of activity"
            value={prefs.weekly_digest}
            onValueChange={(v) => updatePref('weekly_digest', v)}
            disabled={saving || !prefs.push_enabled}
          />
        </View>

        {/* ── Privacy Section ── */}
        <Text style={styles.sectionHeader}>Privacy</Text>
        <View style={styles.card}>
          <ToggleRow
            label="Share Location Publicly"
            description="Allow your general location to be visible on incident maps"
            value={prefs.location_sharing_public}
            onValueChange={(v) => updatePref('location_sharing_public', v)}
            disabled={saving}
          />
          <Divider />
          <ToggleRow
            label="Public Account Visibility"
            description="Allow officers and other users to see your profile"
            value={prefs.account_visible_to_public}
            onValueChange={(v) => updatePref('account_visible_to_public', v)}
            disabled={saving}
          />
        </View>

        {/* ── Account Section ── */}
        <Text style={styles.sectionHeader}>Account</Text>
        <View style={styles.card}>
          <TouchableOpacity style={styles.actionRow} onPress={handleChangePassword}>
            <Text style={styles.actionLabel}>Change Password</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
          <Divider />
          <TouchableOpacity style={[styles.actionRow, styles.signOutRow]} onPress={handleSignOut}>
            <Text style={[styles.actionLabel, styles.signOutLabel]}>Sign Out</Text>
          </TouchableOpacity>
        </View>

        {saving && (
          <View style={styles.savingBanner}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.savingText}>Saving…</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

// ─── Sub-components ────────────────────────────────────────────────────────────

const ToggleRow = ({ label, description, value, onValueChange, disabled }) => (
  <View style={styles.toggleRow}>
    <View style={styles.toggleLabels}>
      <Text style={[styles.toggleLabel, disabled && styles.disabledText]}>{label}</Text>
      {description ? (
        <Text style={[styles.toggleDescription, disabled && styles.disabledText]}>{description}</Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: '#ddd', true: '#007AFF' }}
      thumbColor={value ? '#fff' : '#f4f3f4'}
    />
  </View>
);

const Divider = () => <View style={styles.divider} />;

// ─── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f2f2f7' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  content: { padding: 16, paddingBottom: 40 },

  sectionHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6c6c70',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 24,
    marginBottom: 8,
    marginLeft: 4,
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  toggleLabels: { flex: 1, marginRight: 12 },
  toggleLabel: { fontSize: 16, color: '#1c1c1e', fontWeight: '500' },
  toggleDescription: { fontSize: 13, color: '#8e8e93', marginTop: 2 },
  disabledText: { color: '#c7c7cc' },

  divider: { height: 1, backgroundColor: '#f2f2f7', marginLeft: 16 },

  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  signOutRow: { justifyContent: 'center' },
  actionLabel: { fontSize: 16, color: '#1c1c1e', fontWeight: '500' },
  signOutLabel: { color: '#ff3b30', textAlign: 'center' },
  chevron: { fontSize: 20, color: '#c7c7cc' },

  savingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 10,
    marginTop: 16,
    gap: 8,
  },
  savingText: { color: '#fff', fontSize: 14, marginLeft: 8 },
});

export default SettingsScreen;
