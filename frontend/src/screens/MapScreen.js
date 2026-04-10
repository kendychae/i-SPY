import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ActivityIndicator,
  TouchableOpacity,
  Dimensions,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import api from '../services/api';

const { width, height } = Dimensions.get('window');
const LATITUDE_DELTA = 0.02;
const LONGITUDE_DELTA = LATITUDE_DELTA * (width / height);

const MapScreen = ({ navigation }) => {
  const mapRef = useRef(null);
  const locationSubscriptionRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [followUser, setFollowUser] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [radius, setRadius] = useState(5000); // 5km default

  // Incident type icons for markers
  const incidentIcons = {
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

  // Priority colors for markers
  const priorityColors = {
    low: '#4CAF50',
    medium: '#FFC107',
    high: '#FF9800',
    urgent: '#F44336',
  };

  useEffect(() => {
    initializeMap();
    return () => {
      if (locationSubscriptionRef.current) {
        locationSubscriptionRef.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    if (location) {
      fetchNearbyReports();
    }
  }, [location, radius]);

  const initializeMap = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        Alert.alert(
          'Location Permission Required',
          'Please enable location services to use the map features.'
        );
        setLoading(false);
        return;
      }

      // Get current location
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      };

      setLocation(userLocation);
      setLoading(false);

      // Watch location for real-time tracking
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (newLocation) => {
          const updated = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA,
          };
          setLocation(updated);

          // Auto-center if following user
          if (followUser && mapRef.current) {
            mapRef.current.animateToRegion(updated, 1000);
          }
        }
      );
      locationSubscriptionRef.current = subscription;

    } catch (error) {
      console.error('Error initializing map:', error);
      setErrorMsg('Failed to load map');
      setLoading(false);
    }
  };

  const fetchNearbyReports = async () => {
    try {
      const response = await api.get('/reports', {
        params: {
          latitude: location.latitude,
          longitude: location.longitude,
          radius: radius / 1000, // Convert to km
          status: 'submitted,under_review,in_progress', // Show active reports
        },
      });

      if (response.data.success) {
        setReports(response.data.data.reports || []);
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const handleMarkerPress = (report) => {
    setSelectedReport(report);
    
    // Center map on selected report
    if (mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: report.latitude,
          longitude: report.longitude,
          latitudeDelta: LATITUDE_DELTA / 2,
          longitudeDelta: LONGITUDE_DELTA / 2,
        },
        500
      );
    }
  };

  const handleRecenterPress = () => {
    if (location && mapRef.current) {
      setFollowUser(true);
      mapRef.current.animateToRegion(location, 1000);
    }
  };

  const handleZoomIn = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          ...location,
          latitudeDelta: location.latitudeDelta / 2,
          longitudeDelta: location.longitudeDelta / 2,
        },
        500
      );
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current && location) {
      mapRef.current.animateToRegion(
        {
          ...location,
          latitudeDelta: location.latitudeDelta * 2,
          longitudeDelta: location.longitudeDelta * 2,
        },
        500
      );
    }
  };

  const handleRefresh = () => {
    fetchNearbyReports();
    Alert.alert('Refreshed', 'Map data has been updated.');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2196F3" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  if (errorMsg || !location) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorIcon}>📍</Text>
        <Text style={styles.errorText}>
          {errorMsg || 'Unable to load map'}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={initializeMap}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Map View */}
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
        onPanDrag={() => setFollowUser(false)}
      >
        {/* Radius circle around user */}
        {location && (
          <Circle
            center={{
              latitude: location.latitude,
              longitude: location.longitude,
            }}
            radius={radius}
            strokeColor="rgba(33, 150, 243, 0.3)"
            fillColor="rgba(33, 150, 243, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Report markers */}
        {reports.map((report) => (
          <Marker
            key={report.id}
            coordinate={{
              latitude: report.latitude,
              longitude: report.longitude,
            }}
            title={report.title}
            description={report.incident_type.replace('_', ' ').toUpperCase()}
            onPress={() => handleMarkerPress(report)}
            pinColor={priorityColors[report.priority] || '#2196F3'}
          >
            <View style={styles.markerContainer}>
              <View
                style={[
                  styles.marker,
                  {
                    backgroundColor: priorityColors[report.priority] || '#2196F3',
                  },
                ]}
              >
                <Text style={styles.markerIcon}>
                  {incidentIcons[report.incident_type] || '📌'}
                </Text>
              </View>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        {/* Zoom buttons */}
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomIn}>
          <Text style={styles.controlButtonText}>+</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.controlButton} onPress={handleZoomOut}>
          <Text style={styles.controlButtonText}>−</Text>
        </TouchableOpacity>
      </View>

      {/* Recenter button */}
      <TouchableOpacity
        style={[
          styles.recenterButton,
          followUser && styles.recenterButtonActive,
        ]}
        onPress={handleRecenterPress}
      >
        <Text style={styles.recenterIcon}>📍</Text>
      </TouchableOpacity>

      {/* Refresh button */}
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={handleRefresh}
      >
        <Text style={styles.refreshIcon}>🔄</Text>
      </TouchableOpacity>

      {/* Reports count badge */}
      <View style={styles.badge}>
        <Text style={styles.badgeText}>
          {reports.length} {reports.length === 1 ? 'Report' : 'Reports'}
        </Text>
      </View>

      {/* Selected Report Card */}
      {selectedReport && (
        <View style={styles.reportCard}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setSelectedReport(null)}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

          <View style={styles.reportHeader}>
            <Text style={styles.reportIcon}>
              {incidentIcons[selectedReport.incident_type] || '📌'}
            </Text>
            <View style={styles.reportTitleContainer}>
              <Text style={styles.reportTitle}>{selectedReport.title}</Text>
              <Text style={styles.reportType}>
                {selectedReport.incident_type.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.reportDescription} numberOfLines={3}>
            {selectedReport.description}
          </Text>

          <View style={styles.reportMeta}>
            <View
              style={[
                styles.priorityBadge,
                { backgroundColor: priorityColors[selectedReport.priority] },
              ]}
            >
              <Text style={styles.priorityText}>
                {selectedReport.priority.toUpperCase()}
              </Text>
            </View>

            <Text style={styles.reportDate}>
              {new Date(selectedReport.created_at).toLocaleDateString()}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.viewButton}
            onPress={() => {
              navigation.navigate('Home');
              setSelectedReport(null);
            }}
          >
            <Text style={styles.viewButtonText}>View Details →</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F7FA',
    padding: 32,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  markerContainer: {
    alignItems: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerIcon: {
    fontSize: 20,
  },
  controls: {
    position: 'absolute',
    right: 16,
    top: 60,
    gap: 8,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  controlButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  recenterButton: {
    position: 'absolute',
    right: 16,
    bottom: 120,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  recenterButtonActive: {
    backgroundColor: '#2196F3',
  },
  recenterIcon: {
    fontSize: 24,
  },
  refreshButton: {
    position: 'absolute',
    right: 16,
    bottom: 60,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  refreshIcon: {
    fontSize: 20,
  },
  badge: {
    position: 'absolute',
    top: 60,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  badgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  reportCard: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#6B7280',
    fontWeight: 'bold',
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  reportIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  reportTitleContainer: {
    flex: 1,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 2,
  },
  reportType: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  reportDescription: {
    fontSize: 14,
    color: '#4B5563',
    marginBottom: 12,
    lineHeight: 20,
  },
  reportMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  priorityBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  reportDate: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  viewButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  viewButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  locationLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  locationText: {
    fontSize: 14,
    color: '#666',
    marginVertical: 2,
  },
  note: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
    marginTop: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    padding: 20,
  },
});

export default MapScreen;

