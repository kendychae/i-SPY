// API configuration and axios instance
import axios from 'axios';
import Constants from 'expo-constants';
import { getAccessToken, getRefreshToken, storeAccessToken, storeRefreshToken, clearAuthData } from '../utils/secureStorage';

// EXPO_PUBLIC_API_URL is resolved at build time by Expo (SDK 49+)
// In Expo Go dev mode, derive the backend host from the Metro dev server host
// so the phone automatically reaches the right IP without manual config.
function getApiBaseUrl() {
  if (process.env.EXPO_PUBLIC_API_URL) return process.env.EXPO_PUBLIC_API_URL;

  // In Expo Go, Constants.expoConfig.hostUri is e.g. "192.168.0.249:8081"
  // Extract just the IP and use port 3000 for the backend
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest?.debuggerHost ||
    Constants.manifest2?.extra?.expoClient?.hostUri;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000/api/v1`;
    }
  }

  return 'http://localhost:3000/api/v1';
}

const API_BASE_URL = getApiBaseUrl();

if (__DEV__) {
  console.log('[VIGILUX] API Base URL:', API_BASE_URL);
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Flag to prevent multiple refresh attempts
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  
  failedQueue = [];
};

// Request interceptor for adding auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors and token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (error.response?.data?.code === 'TOKEN_EXPIRED') {
        if (isRefreshing) {
          // If already refreshing, queue this request
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return apiClient(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          // Attempt to refresh token
          const refreshToken = await getRefreshToken();
          
          if (!refreshToken) {
            throw new Error('No refresh token available');
          }

          const response = await axios.post(`${API_BASE_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data.tokens;

          // Store new tokens
          await storeAccessToken(accessToken);
          await storeRefreshToken(newRefreshToken);

          // Update original request with new token
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          // Process queued requests
          processQueue(null, accessToken);

          isRefreshing = false;

          return apiClient(originalRequest);
        } catch (refreshError) {
          // Refresh failed, clear auth data and redirect to login
          processQueue(refreshError, null);
          isRefreshing = false;
          
          await clearAuthData();
          // You can emit an event here to trigger navigation to login
          // EventEmitter.emit('LOGOUT');
          
          return Promise.reject(refreshError);
        }
      }
    }

    // Global error handling
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;

