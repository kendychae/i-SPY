import React, { useState, useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator, CardStyleInterpolators } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, StyleSheet, AppState } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';

// Auth Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';

// Main App Screens
import HomeScreen from './screens/HomeScreen';
import MapScreen from './screens/MapScreen';
import ReportScreen from './screens/ReportScreen';
import ReportDetailScreen from './screens/ReportDetailScreen';
import ProfileScreen from './screens/ProfileScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import SettingsScreen from './screens/SettingsScreen';
import NotificationsScreen from './screens/NotificationsScreen';
import OfficerDashboardScreen from './screens/OfficerDashboardScreen';
import SystemAdminScreen from './screens/SystemAdminScreen';

// Notification Context
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';

// Services
import { authService } from './services/authService';
import api from './services/api';
import apiClient from './services/api';
import { processQueue } from './utils/offlineQueue';

const Stack = createStackNavigator();
const MainStack = createStackNavigator();
const Tab = createBottomTabNavigator();

/**
 * Auth Stack Navigator - Unauthenticated users
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        // Slide animation from right
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="Register" 
        component={RegisterScreen}
        options={{
          title: 'Create Account',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen}
        options={{
          title: 'Reset Password',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Profile Stack Navigator
 */
const ProfileStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          headerShown: true,
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          headerBackTitle: 'Back',
        }}
      />
      <Stack.Screen
        name="SystemAdmin"
        component={SystemAdminScreen}
        options={{
          title: 'System Admin',
          headerBackTitle: 'Back',
        }}
      />
    </Stack.Navigator>
  );
};

/**
 * Main Tab Navigator - Authenticated users
 */
const MainTabs = () => {
  const { badgeCount } = useNotifications();
  const [userRole, setUserRole] = useState(null);
  const [adminPendingCount, setAdminPendingCount] = useState(0);

  useEffect(() => {
    authService.getCachedUser().then(user => {
      if (user?.user_type || user?.userType) setUserRole(user.user_type || user.userType);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    const checkPending = async () => {
      try {
        const user = await authService.getCachedUser();
        if (!user || (user.userType !== 'admin' && user.user_type !== 'admin')) return;
        const res = await apiClient.get('/auth/pending-verifications');
        if (!cancelled) setAdminPendingCount(res.data?.data?.users?.length || 0);
      } catch (_) {}
    };
    checkPending();
    const interval = setInterval(checkPending, 30000);
    return () => { cancelled = true; clearInterval(interval); };
  }, []);

  const isOfficer = userRole === 'officer' || userRole === 'admin';

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{
          title: 'VIGILUX',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Map" 
        component={MapScreen}
        options={{
          title: 'Incident Map',
          tabBarLabel: 'Map',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="Report" 
        component={ReportScreen}
        options={{
          title: 'New Report',
          tabBarLabel: 'Report',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="document-text-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color} />
          ),
          tabBarBadge: badgeCount > 0 ? badgeCount : undefined,
        }}
      />
      {isOfficer && (
        <Tab.Screen
          name="Dashboard"
          component={OfficerDashboardScreen}
          options={{
            title: 'Officer Dashboard',
            tabBarLabel: 'Dashboard',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="shield-outline" size={size} color={color} />
            ),
          }}
        />
      )}
      <Tab.Screen 
        name="Profile" 
        component={ProfileStack}
        options={{
          headerShown: false,
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          tabBarBadge: adminPendingCount > 0 ? adminPendingCount : undefined,
        }}
      />
    </Tab.Navigator>
  );
};

const MainStackScreen = () => {
  return (
    <MainStack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
        cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
        gestureEnabled: true,
        gestureDirection: 'horizontal',
      }}
    >
      <MainStack.Screen
        name="MainTabs"
        component={MainTabs}
        options={{ headerShown: false }}
      />
      <MainStack.Screen
        name="ReportDetail"
        component={ReportDetailScreen}
        options={{ title: 'Report Details' }}
      />
    </MainStack.Navigator>
  );
};

/**
 * Root Navigator with Protected Routes
 */
export const AuthContext = React.createContext({
  isAuthenticated: false,
  setIsAuthenticated: () => {},
});

const RootNavigator = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(null); // null = checking, true/false = result
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
    
    // Re-check auth status every 2 seconds to catch login/logout
    const interval = setInterval(checkAuthStatus, 2000);
    return () => clearInterval(interval);
  }, []);

  // Offline queue processing
  useEffect(() => {
    if (!isAuthenticated) return; // Only process queue when authenticated

    const submitReport = async (payload) => {
      try {
        const response = await api.post('/reports', payload);
        return { success: response.data.success };
      } catch (error) {
        return { success: false };
      }
    };

    // Process queue when network reconnects
    const netInfoUnsubscribe = NetInfo.addEventListener(async (state) => {
      if (state.isConnected) {
        console.log('[App] Network reconnected, processing offline queue...');
        const result = await processQueue(submitReport);
        if (result.succeeded > 0 || result.failed > 0) {
          console.log(`[App] Queue processed: ${result.succeeded} succeeded, ${result.failed} failed`);
        }
      }
    });

    // Process queue when app becomes active
    const appStateUnsubscribe = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('[App] App became active, processing offline queue...');
        const result = await processQueue(submitReport);
        if (result.succeeded > 0 || result.failed > 0) {
          console.log(`[App] Queue processed: ${result.succeeded} succeeded, ${result.failed} failed`);
        }
      }
    });

    return () => {
      netInfoUnsubscribe();
      appStateUnsubscribe.remove();
    };
  }, [isAuthenticated]);

  const checkAuthStatus = async () => {
    try {
      const authenticated = await authService.isAuthenticated();
      setIsAuthenticated(authenticated);
    } catch (error) {
      console.error('Auth check error:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="shield-checkmark" size={80} color="#007AFF" style={{ marginBottom: 16 }} />
        <Text style={styles.appName}>VIGILUX</Text>
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, setIsAuthenticated }}>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          // Fade animation for auth state transitions
          cardStyleInterpolator: CardStyleInterpolators.forFadeFromBottomAndroid,
        }}
      >
        {isAuthenticated ? (
          <Stack.Screen 
            name="Main" 
            component={MainStackScreen}
            options={{
              animationEnabled: true,
            }}
          />
        ) : (
          <Stack.Screen 
            name="Auth" 
            component={AuthStack}
            options={{
              animationEnabled: true,
            }}
          />
        )}
      </Stack.Navigator>
    </AuthContext.Provider>
  );
};

/**
 * Main App Component
 */
const App = () => {
  const navigationRef = useRef(null);
  return (
    <NotificationProvider navigationRef={navigationRef}>
      <NavigationContainer ref={navigationRef}>
        <RootNavigator />
      </NavigationContainer>
    </NotificationProvider>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 32,
  },
  loader: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default App;

