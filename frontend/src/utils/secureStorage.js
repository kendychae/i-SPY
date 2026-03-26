import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Secure token storage
 * - Web: localStorage
 * - iOS: Keychain (via SecureStore)
 * - Android: EncryptedSharedPreferences (via SecureStore)
 */

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'vigilux_access_token',
  REFRESH_TOKEN: 'vigilux_refresh_token',
  USER_DATA: 'vigilux_user_data',
};

// Platform-specific storage helpers
const setItem = async (key, value) => {
  if (Platform.OS === 'web') {
    localStorage.setItem(key, value);
    return true;
  } else {
    await SecureStore.setItemAsync(key, value);
    return true;
  }
};

const getItem = async (key) => {
  if (Platform.OS === 'web') {
    return localStorage.getItem(key);
  } else {
    return await SecureStore.getItemAsync(key);
  }
};

const deleteItem = async (key) => {
  if (Platform.OS === 'web') {
    localStorage.removeItem(key);
    return true;
  } else {
    await SecureStore.deleteItemAsync(key);
    return true;
  }
};

/**
 * Store access token securely
 */
export const storeAccessToken = async (token) => {
  try {
    await setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error storing access token:', error);
    return false;
  }
};

/**
 * Store refresh token securely
 */
export const storeRefreshToken = async (token) => {
  try {
    await setItem(STORAGE_KEYS.REFRESH_TOKEN, token);
    return true;
  } catch (error) {
    console.error('Error storing refresh token:', error);
    return false;
  }
};

/**
 * Store user data securely
 */
export const storeUserData = async (userData) => {
  try {
    await setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
    return true;
  } catch (error) {
    console.error('Error storing user data:', error);
    return false;
  }
};

/**
 * Get access token
 */
export const getAccessToken = async () => {
  try {
    const token = await getItem(STORAGE_KEYS.ACCESS_TOKEN);
    return token;
  } catch (error) {
    console.error('Error getting access token:', error);
    return null;
  }
};

/**
 * Get refresh token
 */
export const getRefreshToken = async () => {
  try {
    const token = await getItem(STORAGE_KEYS.REFRESH_TOKEN);
    return token;
  } catch (error) {
    console.error('Error getting refresh token:', error);
    return null;
  }
};

/**
 * Get user data
 */
export const getUserData = async () => {
  try {
    const userData = await SecureStore.getItemAsync(STORAGE_KEYS.USER_DATA);
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error('Error getting user data:', error);
    return null;
  }
};

/**
 * Store complete authentication data
 */
export const storeAuthData = async (tokens, user) => {
  try {
    await Promise.all([
      storeAccessToken(tokens.accessToken),
      storeRefreshToken(tokens.refreshToken),
      storeUserData(user),
    ]);
    return true;
  } catch (error) {
    console.error('Error storing auth data:', error);
    return false;
  }
};

/**
 * Clear all authentication data
 */
export const clearAuthData = async () => {
  try {
    await Promise.all([
      deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
      deleteItem(STORAGE_KEYS.USER_DATA),
    ]);
    return true;
  } catch (error) {
    console.error('Error clearing auth data:', error);
    return false;
  }
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = async () => {
  try {
    const accessToken = await getAccessToken();
    return !!accessToken;
  } catch (error) {
    console.error('Error checking authentication:', error);
    return false;
  }
};

export default {
  storeAccessToken,
  storeRefreshToken,
  storeUserData,
  getAccessToken,
  getRefreshToken,
  getUserData,
  storeAuthData,
  clearAuthData,
  isAuthenticated,
};
