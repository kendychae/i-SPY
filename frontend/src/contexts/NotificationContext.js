/**
 * NotificationContext.js
 * Issue #44 — W5: Configure Firebase Cloud Messaging & Notification Architecture
 * Issue #54 — W5: Notification Listener & Notification History Screen
 *
 * Wires up Expo Notifications to:
 *  - Request permission and register the push token on app start
 *  - POST the token to /api/v1/users/fcm-token
 *  - Display an in-app banner when a notification arrives in the foreground
 *  - Expose a badge count and the latest notification payload to all screens
 *  - Map notification data.type to the appropriate navigation action on tap
 *
 * FCM Architecture (Issue #44):
 *  - Per-user device tokens stored in fcm_tokens table
 *  - Backend events that fire notifications:
 *      • report status changed  → notify report owner
 *      • report assigned        → notify assigned officer
 *  - Token strategy: per-user device tokens (not topics) for targeted delivery
 *  - Token lifecycle: registered on login, refreshed on app open, removed on logout
 */
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Platform, Alert } from 'react-native';

let Notifications = null;
let Device = null;

// Lazy-load expo-notifications — graceful degradation if not installed
try {
  Notifications = require('expo-notifications');
  Device = require('expo-device');
} catch (_) {
  console.warn('[FCM] expo-notifications not installed — push disabled');
}

import apiClient from '../services/api';

// ─── Context ──────────────────────────────────────────────────────────────────

export const NotificationContext = createContext({
  badgeCount: 0,
  latestNotification: null,
  clearBadge: () => {},
});

export const useNotifications = () => useContext(NotificationContext);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const NotificationProvider = ({ children, navigationRef }) => {
  const [badgeCount, setBadgeCount] = useState(0);
  const [latestNotification, setLatestNotification] = useState(null);

  const notificationListener = useRef(null);
  const responseListener = useRef(null);

  useEffect(() => {
    if (!Notifications) return;

    // Set foreground display options
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    registerForPushNotifications();

    // Foreground listener → in-app banner via state
    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setLatestNotification(notification);
        setBadgeCount((c) => c + 1);
      }
    );

    // Tap listener → navigate to relevant screen
    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        const data = response.notification.request.content.data || {};
        handleNotificationTap(data, navigationRef);
        setBadgeCount(0);
      }
    );

    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const clearBadge = () => {
    setBadgeCount(0);
    if (Notifications) Notifications.setBadgeCountAsync(0);
  };

  return (
    <NotificationContext.Provider value={{ badgeCount, latestNotification, clearBadge }}>
      {children}
    </NotificationContext.Provider>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function registerForPushNotifications() {
  if (!Notifications || !Device) return;

  if (!Device.isDevice) {
    // Expo Go on simulator — skip token registration
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('[FCM] Push notification permission denied');
      return;
    }

    // Get Expo push token (works with Firebase via expo-notifications on bare workflow)
    const tokenData = await Notifications.getExpoPushTokenAsync();
    const token = tokenData.data;

    // Send token to backend
    await apiClient.post('/users/fcm-token', {
      token,
      platform: Platform.OS,
    });

    // Android channel setup
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'VIGILUX Alerts',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#007AFF',
      });
    }

    console.log('[FCM] Push token registered:', token);
  } catch (error) {
    console.error('[FCM] Token registration error:', error);
  }
}

/**
 * Map notification data.type to navigation action
 */
function handleNotificationTap(data, navigationRef) {
  if (!navigationRef?.current) return;

  const nav = navigationRef.current;

  switch (data.type) {
    case 'report_status_change':
    case 'report_assigned':
      if (data.reportId) {
        nav.navigate('Report');
      }
      break;
    case 'nearby_incident':
      nav.navigate('Map');
      break;
    default:
      nav.navigate('Notifications');
      break;
  }
}
