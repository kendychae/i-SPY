# VIGILUX App Navigation Flow

## Navigation Architecture

### Overview

The VIGILUX app uses a hierarchical navigation structure with protected routes, ensuring authenticated users have access to the main app while unauthenticated users see only the auth screens.

## Navigation Hierarchy

```
NavigationContainer
└── RootNavigator (Stack)
    ├── Auth Stack (Unauthenticated)
    │   ├── LoginScreen
    │   ├── RegisterScreen
    │   └── ForgotPasswordScreen
    │
    └── Main Tabs (Authenticated)
        ├── Home Tab
        │   └── HomeScreen
        ├── Map Tab
        │   └── MapScreen
        ├── Report Tab
        │   └── ReportScreen
        └── Profile Tab
            └── ProfileScreen
```

## Screen Descriptions

### Authentication Screens

#### 1. LoginScreen

- **Route**: `/Auth/Login`
- **Access**: Public
- **Purpose**: User login with email and password
- **Features**:
  - Email/password input
  - Form validation
  - "Forgot Password" link
  - "Create Account" button
- **Navigation**:
  - Success → Main/Home
  - Register → RegisterScreen
  - Forgot Password → ForgotPasswordScreen

#### 2. RegisterScreen

- **Route**: `/Auth/Register`
- **Access**: Public
- **Purpose**: New user registration
- **Features**:
  - First/last name input
  - Email input
  - Phone number (optional)
  - Password with confirmation
  - Form validation
- **Navigation**:
  - Success → Main/Home
  - Back → LoginScreen

#### 3. ForgotPasswordScreen

- **Route**: `/Auth/ForgotPassword`
- **Access**: Public
- **Purpose**: Password reset request
- **Features**:
  - Email input
  - Reset link request
- **Navigation**:
  - Back → LoginScreen

### Main App Screens (Protected)

#### 4. HomeScreen

- **Route**: `/Main/Home`
- **Access**: Authenticated users only
- **Purpose**: Dashboard with quick actions
- **Features**:
  - Welcome message
  - Quick action cards (Submit Report, View Map)
  - Recent activity feed
- **Navigation**:
  - Submit Report → ReportScreen
  - View Map → MapScreen

#### 5. MapScreen

- **Route**: `/Main/Map`
- **Access**: Authenticated users only
- **Purpose**: Interactive map of incidents
- **Features**:
  - Live map with user location
  - Incident markers
  - Location permissions
- **Navigation**:
  - Via bottom tab navigation

#### 6. ReportScreen

- **Route**: `/Main/Report`
- **Access**: Authenticated users only
- **Purpose**: Submit new incident report
- **Features**:
  - Incident type selection
  - Title and description
  - Location (future: auto-detect)
  - Photo upload (future)
- **Navigation**:
  - Success → HomeScreen
  - Cancel → Previous screen

#### 7. ProfileScreen

- **Route**: `/Main/Profile`
- **Access**: Authenticated users only
- **Purpose**: User profile and settings
- **Features**:
  - User information display
  - Account settings
  - Support links
  - Logout functionality
- **Navigation**:
  - Logout → LoginScreen

## Navigation Features

### 1. Protected Routes

- **Implementation**: RootNavigator checks authentication state
- **Mechanism**:
  - On app load, check for valid access token
  - If authenticated → Show Main Tabs
  - If not authenticated → Show Auth Stack
- **Auto-redirect**: Token expiry triggers automatic redirect to login

### 2. Animations & Transitions

#### Auth Stack Animations

- **Type**: Horizontal slide (iOS-style)
- **Direction**: Right to left
- **Gesture**: Swipe from left edge to go back
- **Interpolator**: `CardStyleInterpolators.forHorizontalIOS`

#### Main Tabs Animations

- **Type**: Instant tab switching
- **Bottom bar**: Smooth icon/label color transitions
- **Active color**: #007AFF (iOS blue)
- **Inactive color**: #999 (gray)

#### Auth State Transitions

- **Type**: Fade
- **Duration**: ~300ms
- **Interpolator**: `CardStyleInterpolators.forFadeFromBottomAndroid`
- **Use cases**:
  - Login → Main app
  - Logout → Login screen

### 3. Navigation Guards

#### Authentication Guard

```javascript
// Check auth status on app load
const authenticated = await authService.isAuthenticated();
if (!authenticated) {
  // Redirect to login
}
```

#### Token Refresh Guard

```javascript
// API interceptor handles token refresh
// On 401 error with TOKEN_EXPIRED code:
//   1. Attempt token refresh
//   2. Retry original request
//   3. If refresh fails, redirect to login
```

## User Flows

### New User Flow

1. App opens → LoginScreen
2. Tap "Create New Account" → RegisterScreen
3. Fill form and submit → Auto-login
4. Navigate to Main/Home → Show welcome

### Returning User Flow

1. App opens → Check auth
2. If valid token → Main/Home
3. If expired token → Auto-refresh → Main/Home
4. If no token → LoginScreen

### Logout Flow

1. ProfileScreen → Tap "Logout"
2. Confirm dialog
3. Clear tokens from SecureStore
4. Navigate to Auth/Login
5. Clear navigation stack

### Report Submission Flow

1. Home or Map → Tap "Submit Report"
2. ReportScreen → Fill form
3. Submit → API call
4. Success → Navigate back with confirmation
5. Show in Home feed and Map

## Future Enhancements

### Planned Navigation Features

- [ ] Deep linking support (navigate to specific reports)
- [ ] Push notification navigation
- [ ] Share report via URL
- [ ] In-app browser for external links
- [ ] Modal stack for camera/image picker
- [ ] Report detail screen (drill-down)
- [ ] Admin panel (conditional navigation for admins)

### Planned Animations

- [ ] Shared element transitions (report cards)
- [ ] Skeleton loading screens
- [ ] Pull-to-refresh animations
- [ ] Swipe gestures on report cards
- [ ] Bottom sheet modals

## Testing Navigation

### Manual Testing Checklist

- [ ] Login redirects to home
- [ ] Logout redirects to login
- [ ] Token expiry redirects to login
- [ ] Back button behavior on each screen
- [ ] Tab switching works smoothly
- [ ] Deep link handling
- [ ] Android back button behavior
- [ ] iOS swipe-back gesture

### Navigation Performance

- First screen render: < 500ms
- Tab switch: < 100ms
- Auth state change: < 300ms
- Screen transition: 250-300ms

## Configuration

### Stack Navigator Options

```javascript
{
  headerStyle: { backgroundColor: '#007AFF' },
  headerTintColor: '#fff',
  cardStyleInterpolator: CardStyleInterpolators.forHorizontalIOS,
  gestureEnabled: true,
}
```

### Tab Navigator Options

```javascript
{
  tabBarActiveTintColor: '#007AFF',
  tabBarInactiveTintColor: '#999',
  tabBarStyle: { height: 60 },
}
```

## Troubleshooting

### Common Issues

1. **Blank screen on auth**: Check if authService.isAuthenticated() is working
2. **No animation**: Ensure react-native-gesture-handler is properly installed
3. **Tab bar not showing**: Check TabNavigator configuration
4. **Back button not working**: Verify navigation stack structure
