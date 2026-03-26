# React Native Maps Setup Guide

This guide covers setting up Google Maps integration for both iOS and Android platforms in the VIGILUX application.

## Prerequisites

- Google Cloud Console account
- iOS and Android development environment set up
- Expo development build configured

## Step 1: Get Google Maps API Keys

### 1.1 Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Library**
4. Enable the following APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API (optional, for address search)
   - Geocoding API (for address lookups)

### 1.2 Generate API Keys

#### For Android:

1. Go to **APIs & Services** > **Credentials**
2. Click **Create Credentials** > **API Key**
3. Click **Restrict Key** for security
4. Under **Application restrictions**, select **Android apps**
5. Add your package name: `com.vigilux.app`
6. Add your SHA-1 certificate fingerprint:

   ```bash
   # For debug builds
   keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

   # For production builds (use your keystore)
   keytool -list -v -keystore /path/to/your/keystore -alias your-alias
   ```

7. Under **API restrictions**, select **Restrict key** and enable:
   - Maps SDK for Android
   - Places API
   - Geocoding API
8. Save the key

#### For iOS:

1. Create another API key (or use the same with different restrictions)
2. Under **Application restrictions**, select **iOS apps**
3. Add your bundle identifier: `com.vigilux.app`
4. Under **API restrictions**, enable:
   - Maps SDK for iOS
   - Places API
   - Geocoding API
5. Save the key

## Step 2: Configure app.json

Update your `app.json` file with the API keys:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

**IMPORTANT**:

- Never commit real API keys to version control
- Use environment variables for production builds
- Store keys in `.env` file (add to `.gitignore`)

## Step 3: Install Dependencies

The required packages are already in `package.json`:

```bash
cd frontend
npm install
```

Dependencies:

- `react-native-maps@1.18.0` - Maps component
- `expo-location@~18.0.0` - Location services
- `expo-image-picker@~16.0.0` - Camera and gallery access
- `expo-image-manipulator@~13.0.0` - Image compression
- `expo-file-system@~18.0.0` - File handling

## Step 4: Build Development Client

Since react-native-maps requires native code, you need a custom development build:

```bash
# For iOS
npx expo prebuild --platform ios
npx expo run:ios

# For Android
npx expo prebuild --platform android
npx expo run:android
```

## Step 5: Test Map Functionality

The MapScreen includes:

- ✅ Real-time user location tracking (blue dot)
- ✅ Report markers with incident type icons
- ✅ Priority-based marker colors
- ✅ Zoom and pan controls
- ✅ Recenter to user location button
- ✅ Search radius visualization (circle)
- ✅ Report details card on marker tap
- ✅ Refresh nearby reports

## Map Features

### User Location Tracking

- Automatic permission request on first load
- Real-time location updates every 5 seconds or 10 meters
- Blue dot marker with accuracy circle
- "Follow user" mode with auto-centering

### Report Markers

- Custom icons for incident types:
  - 🚨 Theft
  - 🔨 Vandalism
  - ⚠️ Assault
  - 👀 Suspicious Activity
  - 🚗 Traffic Violation
  - 🔊 Noise Complaint
  - 🔥 Fire
  - 🚑 Medical Emergency
  - 📌 Other

- Color-coded by priority:
  - 🟢 Low: #4CAF50
  - 🟡 Medium: #FFC107
  - 🟠 High: #FF9800
  - 🔴 Urgent: #F44336

### Map Controls

1. **Zoom In/Out** - Top right buttons
2. **Recenter** - Blue when following user
3. **Refresh** - Reload nearby reports
4. **Reports Count Badge** - Shows active reports in radius

### Search Radius

- Default: 5km (adjustable)
- Visual circle overlay on map
- Filters reports within radius

## Troubleshooting

### Map not displaying (white screen)

- Verify API keys are correctly set in `app.json`
- Check that Maps SDK is enabled in Google Cloud Console
- Ensure you're running a development build (not Expo Go)
- Check console for API errors

### Location permission denied

- Request permissions in device settings
- Verify `expo-location` plugin is configured in `app.json`
- Check Info.plist (iOS) has location usage descriptions

### Markers not showing

- Verify API endpoint `/reports` is returning data
- Check network connectivity
- Ensure latitude/longitude values are valid numbers
- Check console for fetch errors

### Performance issues

- Limit number of markers (currently fetches reports in radius)
- Implement marker clustering for dense areas (see docs/MAP-CLUSTERING.md)
- Reduce location update frequency if needed

## Environment Variables (Production)

Create `.env` file:

```
GOOGLE_MAPS_API_KEY_IOS=your_ios_key
GOOGLE_MAPS_API_KEY_ANDROID=your_android_key
```

Update build process to inject keys:

```javascript
// app.config.js
module.exports = {
  expo: {
    ios: {
      config: {
        googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY_IOS,
      },
    },
    android: {
      config: {
        googleMaps: {
          apiKey: process.env.GOOGLE_MAPS_API_KEY_ANDROID,
        },
      },
    },
  },
};
```

## Security Best Practices

1. **Restrict API Keys**: Always use application restrictions
2. **Rate Limiting**: Monitor usage in Google Cloud Console
3. **Budget Alerts**: Set billing alerts to avoid unexpected charges
4. **Key Rotation**: Rotate keys periodically
5. **Environment-Specific Keys**: Use different keys for dev/staging/prod

## Cost Optimization

Google Maps has a free tier:

- $200 monthly credit (covers ~28,000 map loads)
- Dynamic Maps: $7 per 1,000 loads after credit
- Static Maps: $2 per 1,000 loads

Tips:

- Cache map tiles when possible
- Implement map clustering for dense markers
- Use static maps for thumbnails/previews
- Monitor usage dashboard regularly

## Additional Resources

- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Expo Location API](https://docs.expo.dev/versions/latest/sdk/location/)
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Expo Custom Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)

## Support

For issues with:

- Map clustering: See `docs/MAP-CLUSTERING.md`
- Backend geospatial queries: See `backend/src/utils/geospatial.js`
- Report API: See `docs/API-REPORTS.md`
