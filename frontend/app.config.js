/**
 * app.config.js — dynamic Expo configuration
 * Reads environment variables so the same config works for:
 *   - local dev (from .env via dotenv)
 *   - EAS builds (from eas.json env block or EAS secrets)
 */

// Expo CLI loads .env automatically in SDK 49+
// For older SDKs or CI, uncomment the next two lines:
// const dotenv = require('dotenv');
// dotenv.config();

const apiUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  process.env.API_URL ||
  'http://localhost:3000/api/v1';

const googleMapsIos =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS ||
  process.env.GOOGLE_MAPS_API_KEY_IOS ||
  '';

const googleMapsAndroid =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID ||
  process.env.GOOGLE_MAPS_API_KEY_ANDROID ||
  '';

module.exports = {
  expo: {
    name: 'VIGILUX',
    slug: 'vigilux-app',
    owner: 'kendychae',
    version: '1.0.0',
    orientation: 'portrait',
    userInterfaceStyle: 'light',
    icon: './assets/icon.png',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#667eea',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
      supportsTablet: true,
      bundleIdentifier: 'com.vigilux.app',
      buildNumber: '1',
      privacyManifests: {
        NSPrivacyAccessedAPITypes: [
          {
            NSPrivacyAccessedAPIType: 'NSPrivacyAccessedAPICategoryUserDefaults',
            NSPrivacyAccessedAPITypeReasons: ['CA92.1'],
          },
        ],
      },
      config: {
        googleMapsApiKey: googleMapsIos,
      },
    },
    android: {
      adaptiveIcon: {
        foregroundImage: './assets/adaptive-icon.png',
        backgroundColor: '#667eea',
      },
      package: 'com.vigilux.app',
      versionCode: 1,
      permissions: [
        'ACCESS_FINE_LOCATION',
        'ACCESS_COARSE_LOCATION',
        'CAMERA',
        'READ_EXTERNAL_STORAGE',
        'WRITE_EXTERNAL_STORAGE',
        'READ_MEDIA_IMAGES',
      ],
      config: {
        googleMaps: {
          apiKey: googleMapsAndroid,
        },
      },
    },
    web: {
      bundler: 'metro',
      favicon: './assets/favicon.png',
    },
    plugins: [
      [
        'expo-location',
        {
          locationAlwaysAndWhenInUsePermission:
            'Allow VIGILUX to use your location to tag incident reports.',
        },
      ],
      [
        'expo-image-picker',
        {
          photosPermission:
            'Allow VIGILUX to access your photos to attach evidence to reports.',
          cameraPermission: 'Allow VIGILUX to take photos for incident reports.',
        },
      ],
      'expo-asset',
      'expo-font',
      'expo-secure-store',
    ],
    extra: {
      apiUrl,
      eas: {
        projectId: process.env.EAS_PROJECT_ID || 'vigilux-app',
      },
    },
  },
};
