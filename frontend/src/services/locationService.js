/**
 * Location Service
 * Issue #34: Implement GPS location capture for incident reports
 * Issue #35: Add address lookup using reverse geocoding API
 * Author: Figuelia Ya'Sin
 *
 * Provides reusable GPS capture and reverse geocoding utilities
 * for use across the app (ReportScreen, MapScreen, etc.)
 */

import * as Location from 'expo-location';
import { Alert } from 'react-native';

// ─── Permission ──────────────────────────────────────────────────────────────

/**
 * Request foreground location permission from the user.
 * Shows an informative alert if permission is denied.
 *
 * @returns {Promise<boolean>} true if permission was granted
 */
export const requestLocationPermission = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      Alert.alert(
        'Location Permission Required',
        'Please enable location access in your device settings so VIGILUX can attach your position to incident reports.',
        [{ text: 'OK' }]
      );
      return false;
    }

    return true;
  } catch (error) {
    console.error('[locationService] Permission request failed:', error);
    return false;
  }
};

// ─── GPS Capture (#34) ───────────────────────────────────────────────────────

/**
 * Get the device's current GPS coordinates.
 * Requests permission automatically if not yet granted.
 *
 * @param {Object} [options]
 * @param {number} [options.accuracy=Location.Accuracy.High] - expo-location accuracy level
 * @param {number} [options.timeoutMs=15000] - max ms to wait for a fix
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, timestamp: number} | null>}
 */
export const getCurrentLocation = async (options = {}) => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const result = await Location.getCurrentPositionAsync({
      accuracy: options.accuracy ?? Location.Accuracy.High,
      timeInterval: options.timeoutMs ?? 15000,
    });

    return {
      latitude: result.coords.latitude,
      longitude: result.coords.longitude,
      accuracy: result.coords.accuracy,
      timestamp: result.timestamp,
    };
  } catch (error) {
    console.error('[locationService] GPS capture failed:', error);
    Alert.alert(
      'Location Error',
      'Could not retrieve your location. Please ensure location services are enabled and try again.',
      [{ text: 'OK' }]
    );
    return null;
  }
};

/**
 * Watch the device's position with a callback as it changes.
 * Returns a subscription object — call `.remove()` to stop watching.
 *
 * @param {Function} onLocation - callback({latitude, longitude, accuracy, timestamp})
 * @param {Object}   [options]
 * @param {number}   [options.accuracy=Location.Accuracy.Balanced]
 * @param {number}   [options.distanceInterval=10] - min meters of movement before update
 * @returns {Promise<Location.LocationSubscription | null>}
 */
export const watchLocation = async (onLocation, options = {}) => {
  const hasPermission = await requestLocationPermission();
  if (!hasPermission) return null;

  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: options.accuracy ?? Location.Accuracy.Balanced,
        distanceInterval: options.distanceInterval ?? 10,
      },
      (result) => {
        onLocation({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
          accuracy: result.coords.accuracy,
          timestamp: result.timestamp,
        });
      }
    );
    return subscription;
  } catch (error) {
    console.error('[locationService] watchLocation failed:', error);
    return null;
  }
};

// ─── Reverse Geocoding (#35) ─────────────────────────────────────────────────

/**
 * Convert GPS coordinates into a human-readable address string.
 * Uses the device's built-in reverse geocoding (no API key required).
 *
 * @param {number} latitude
 * @param {number} longitude
 * @returns {Promise<string>} Formatted address, or empty string on failure
 */
export const reverseGeocode = async (latitude, longitude) => {
  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });

    if (!results || results.length === 0) return '';

    return formatAddress(results[0]);
  } catch (error) {
    console.error('[locationService] reverseGeocode failed:', error);
    return '';
  }
};

/**
 * Format a raw expo-location geocode result into a readable string.
 *
 * @param {Object} geocodeResult - result from Location.reverseGeocodeAsync
 * @returns {string} e.g. "123 Main St, Rexburg, ID 83440"
 */
export const formatAddress = (geocodeResult) => {
  if (!geocodeResult) return '';

  const parts = [
    geocodeResult.streetNumber,
    geocodeResult.street,
    geocodeResult.district,
    geocodeResult.city,
    geocodeResult.region,
    geocodeResult.postalCode,
    geocodeResult.country !== 'United States' ? geocodeResult.country : null,
  ].filter(Boolean);

  return parts.join(', ');
};

// ─── Combined Helper ──────────────────────────────────────────────────────────

/**
 * Get current GPS coordinates AND resolve the address in one call.
 * Convenience wrapper used by ReportScreen and similar screens.
 *
 * @returns {Promise<{latitude: number, longitude: number, accuracy: number, address: string} | null>}
 */
export const getLocationWithAddress = async () => {
  const coords = await getCurrentLocation();
  if (!coords) return null;

  const address = await reverseGeocode(coords.latitude, coords.longitude);

  return {
    latitude: coords.latitude,
    longitude: coords.longitude,
    accuracy: coords.accuracy,
    address,
  };
};
