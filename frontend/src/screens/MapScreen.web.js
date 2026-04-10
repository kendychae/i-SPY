import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MapContainer, TileLayer, Circle, CircleMarker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import api from '../services/api';
import { getCurrentLocation } from '../services/locationService';

const DEFAULT_CENTER = { latitude: 43.823, longitude: -111.789 };
const DEFAULT_RADIUS = 5000;

const INCIDENT_ICONS = {
  theft: '🚨',
  vandalism: '🔨',
  assault: '⚠️',
  suspicious_activity: '👀',
  traffic_violation: '🚗',
  noise_complaint: '🔊',
  fire: '🔥',
  medical_emergency: '🚑',
  other: '📌',
};

const PRIORITY_COLORS = {
  low: '#4CAF50',
  medium: '#FFC107',
  high: '#FF9800',
  urgent: '#F44336',
};

const MapScreen = ({ navigation }) => {
  const [location, setLocation] = useState(DEFAULT_CENTER);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapError, setMapError] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);

  const center = useMemo(() => [location.latitude, location.longitude], [location]);

  const fetchNearbyReports = useCallback(async (loc) => {
    try {
      const response = await api.get('/reports', {
        params: {
          latitude: loc.latitude,
          longitude: loc.longitude,
          radius: DEFAULT_RADIUS,
          status: 'submitted,under_review,investigating,in_progress',
          limit: 100,
        },
      });

      if (response.data?.success) {
        setReports(response.data.data || []);
      }
    } catch (error) {
      console.error('[MapScreen.web] Error loading reports:', error);
      setMapError('Could not load nearby reports.');
    }
  }, []);

  const initializeMap = useCallback(async () => {
    try {
      setLoading(true);
      setMapError(null);

      const currentLocation = await getCurrentLocation();
      const nextLocation = currentLocation
        ? { latitude: currentLocation.latitude, longitude: currentLocation.longitude }
        : DEFAULT_CENTER;

      setLocation(nextLocation);
      await fetchNearbyReports(nextLocation);
    } catch (error) {
      console.error('[MapScreen.web] Error initializing map:', error);
      setMapError('Could not initialize the map.');
    } finally {
      setLoading(false);
    }
  }, [fetchNearbyReports]);

  useEffect(() => {
    initializeMap();
  }, [initializeMap]);

  const handleRefresh = async () => {
    await initializeMap();
  };

  const handleViewDetails = () => {
    if (!selectedReport) {
      return;
    }
    navigation.navigate('ReportDetail', { id: selectedReport.id });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading web map...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapContainer center={center} zoom={14} style={styles.mapElement}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Circle
          center={center}
          radius={DEFAULT_RADIUS}
          pathOptions={{ color: '#2196F3', fillColor: '#2196F3', fillOpacity: 0.12 }}
        />

        <CircleMarker
          center={center}
          radius={8}
          pathOptions={{ color: '#fff', fillColor: '#0ea5e9', fillOpacity: 1, weight: 2 }}
        >
          <Popup>You are here</Popup>
        </CircleMarker>

        {reports.map((report) => {
          const markerColor = PRIORITY_COLORS[report.priority] || '#2196F3';
          return (
            <CircleMarker
              key={report.id}
              center={[Number(report.latitude), Number(report.longitude)]}
              radius={8}
              pathOptions={{ color: '#fff', fillColor: markerColor, fillOpacity: 1, weight: 2 }}
              eventHandlers={{ click: () => setSelectedReport(report) }}
            >
              <Popup>
                <div style={{ minWidth: 180 }}>
                  <strong>{report.title}</strong>
                  <div>{INCIDENT_ICONS[report.incident_type] || '📌'} {String(report.incident_type || '').replace(/_/g, ' ')}</div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <View style={styles.topBar}>
        <Text style={styles.badgeText}>{reports.length} nearby reports</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshButtonText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {mapError ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{mapError}</Text>
        </View>
      ) : null}

      {selectedReport ? (
        <View style={styles.reportCard}>
          <Text style={styles.reportTitle}>{selectedReport.title}</Text>
          <Text style={styles.reportMeta}>
            {INCIDENT_ICONS[selectedReport.incident_type] || '📌'} {String(selectedReport.incident_type || '').replace(/_/g, ' ')}
          </Text>
          <Text style={styles.reportDescription} numberOfLines={3}>{selectedReport.description}</Text>
          <View style={styles.cardActions}>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setSelectedReport(null)}>
              <Text style={styles.secondaryButtonText}>Close</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.primaryButton} onPress={handleViewDetails}>
              <Text style={styles.primaryButtonText}>View details</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e5edf4',
  },
  mapElement: {
    width: '100%',
    height: '100%',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  loadingText: {
    marginTop: 10,
    color: '#475569',
    fontSize: 14,
  },
  topBar: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 999,
  },
  badgeText: {
    backgroundColor: '#0f172a',
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: 'hidden',
  },
  refreshButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  refreshButtonText: {
    color: '#0f172a',
    fontSize: 12,
    fontWeight: '700',
  },
  errorBanner: {
    position: 'absolute',
    top: 60,
    left: 16,
    right: 16,
    backgroundColor: '#fee2e2',
    borderColor: '#ef4444',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    zIndex: 998,
  },
  errorText: {
    color: '#991b1b',
    fontSize: 12,
    fontWeight: '600',
  },
  reportCard: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    zIndex: 999,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 4,
  },
  reportMeta: {
    color: '#475569',
    fontSize: 13,
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  reportDescription: {
    color: '#334155',
    fontSize: 13,
    lineHeight: 18,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 12,
  },
  secondaryButton: {
    backgroundColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    color: '#0f172a',
    fontWeight: '700',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  primaryButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default MapScreen;
