// Authentication service
import apiClient from './api';
import { storeAuthData, clearAuthData, getUserData, getAccessToken, getRefreshToken, isAuthenticated } from '../utils/secureStorage';
import { deleteFcmTokenFromBackend, syncFcmTokenToBackend } from './notificationService';

export const authService = {
  /**
   * Register new user
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        if (tokens?.accessToken && tokens?.refreshToken) {
          await storeAuthData(tokens, user);
        }
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Registration failed',
        errors: error.response?.data?.errors,
      };
    }
  },

  /**
   * Login user
   */
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      
      if (response.data.success) {
        const { user, tokens } = response.data.data;
        await storeAuthData(tokens, user);
        await syncFcmTokenToBackend();
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Login failed',
      };
    }
  },

  /**
   * Logout user
   */
  logout: async () => {
    // Clear local auth data immediately so logout is instant regardless of backend
    await clearAuthData().catch(() => {});

    // Best-effort backend cleanup — do not block or await
    deleteFcmTokenFromBackend().catch(() => {});
    apiClient.post('/auth/logout').catch(() => {});

    return { success: true };
  },

  /**
   * Get current user profile
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/auth/me');
      
      if (response.data.success) {
        return { success: true, user: response.data.data.user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch user',
      };
    }
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated: async () => {
    return await isAuthenticated();
  },

  /**
   * Get cached user data
   */
  getCachedUser: async () => {
    return await getUserData();
  },

  /**
   * Delete user account
   */
  deleteAccount: async (password) => {
    try {
      const response = await apiClient.delete('/auth/account', {
        data: { password },
      });

      if (response.data.success) {
        // Clear auth data on success
        await clearAuthData();
        return { success: true };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to delete account',
      };
    }
  },

  /**
   * Update user profile
   */
  updateProfile: async (profileData) => {
    try {
      const response = await apiClient.patch('/auth/profile', profileData);

      if (response.data.success) {
        const { user } = response.data.data;
        // Update cached user data
        await storeAuthData(
          {
            accessToken: await getAccessToken(),
            refreshToken: await getRefreshToken(),
          },
          user
        );
        return { success: true, user };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },
  /**
   * Update full profile (name, phone, bio, profile image)
   * Uses the dedicated PUT /api/v1/users/profile endpoint (Issue #46)
   */
  updateFullProfile: async (profileData) => {
    try {
      const response = await apiClient.put('/users/profile', profileData);

      if (response.data.success) {
        const { user } = response.data.data;
        await storeAuthData(
          {
            accessToken: await getAccessToken(),
            refreshToken: await getRefreshToken(),
          },
          user
        );
        return { success: true, user };
      }

      return { success: false, message: response.data.message };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to update profile',
      };
    }
  },
};

