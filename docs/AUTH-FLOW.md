# VIGILUX Authentication Flow Documentation

## Overview

This document outlines the complete authentication flow for the VIGILUX mobile application, designed for production deployment on Google Play and Apple App Store.

## Authentication Architecture

### 1. Technology Stack

- **Backend**: JWT (JSON Web Tokens) with refresh token rotation
- **Frontend**: React Native with Expo SecureStore
- **Database**: PostgreSQL with encrypted password storage (bcrypt)
- **Security**: HTTPS only, token encryption, secure headers

### 2. Authentication Flow Diagram

```
┌─────────────┐
│   User      │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  1. Login Screen                        │
│     - Email + Password                  │
│     - Biometric Option (Future)         │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  2. Frontend Validation                 │
│     - Email format                      │
│     - Password strength                 │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  3. API Request (POST /auth/login)      │
│     - Encrypted HTTPS                   │
│     - Rate limiting applied             │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  4. Backend Verification                │
│     - Check user exists                 │
│     - Verify password (bcrypt)          │
│     - Check account status              │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  5. Generate Tokens                     │
│     - Access Token (15 min)             │
│     - Refresh Token (7 days)            │
│     - Include: userId, email, role      │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  6. Secure Token Storage                │
│     - Expo SecureStore (encrypted)      │
│     - Device-specific encryption        │
└──────┬──────────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────────┐
│  7. Navigate to Main App                │
│     - Protected routes enabled          │
│     - User context populated            │
└─────────────────────────────────────────┘
```

### 3. Token Structure

#### Access Token Payload

```json
{
  "userId": "uuid-v4",
  "email": "user@example.com",
  "userType": "citizen|officer|admin",
  "iat": 1234567890,
  "exp": 1234568790
}
```

#### Refresh Token Payload

```json
{
  "userId": "uuid-v4",
  "tokenVersion": 1,
  "iat": 1234567890,
  "exp": 1235172690
}
```

### 4. Security Features

#### Password Requirements

- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character

#### Rate Limiting

- Login attempts: 5 per 15 minutes per IP
- Registration: 3 per hour per IP
- Password reset: 3 per hour per email

#### Token Management

- Access token expires: 15 minutes
- Refresh token expires: 7 days
- Automatic token refresh on API calls
- Logout invalidates both tokens
- Token rotation on refresh

### 5. User States

1. **Unauthenticated**: No valid tokens, redirected to login
2. **Authenticated**: Valid access token, full app access
3. **Token Expired**: Access token expired, auto-refresh attempted
4. **Session Expired**: Both tokens expired, redirected to login
5. **Inactive**: Account disabled/suspended

### 6. API Endpoints

#### POST /api/v1/auth/register

- Register new user account
- Creates user record
- Returns tokens immediately

#### POST /api/v1/auth/login

- Authenticate existing user
- Returns access and refresh tokens

#### POST /api/v1/auth/refresh

- Exchange refresh token for new access token
- Implements token rotation

#### POST /api/v1/auth/logout

- Invalidates current tokens
- Clears server-side session data

#### POST /api/v1/auth/forgot-password

- Send password reset email
- Generate secure reset token

#### POST /api/v1/auth/reset-password

- Reset password with token
- Invalidates all existing tokens

### 7. Error Handling

| Error Code | Message             | Action                      |
| ---------- | ------------------- | --------------------------- |
| 401        | Invalid credentials | Show error, clear form      |
| 403        | Account disabled    | Show error, contact support |
| 429        | Too many attempts   | Lock for 15 minutes         |
| 500        | Server error        | Retry with backoff          |

### 8. Mobile-Specific Considerations

#### iOS

- Keychain integration via SecureStore
- Face ID/Touch ID support (Phase 2)
- Background token refresh

#### Android

- EncryptedSharedPreferences via SecureStore
- Biometric authentication (Phase 2)
- Foreground service for active sessions

### 9. Future Enhancements

- [ ] Biometric authentication (fingerprint/face)
- [ ] Two-factor authentication (2FA)
- [ ] Social login (Google, Apple)
- [ ] Remember device feature
- [ ] Session management dashboard
- [ ] Suspicious login detection

## Implementation Checklist

- [x] JWT token generation
- [x] Secure password hashing
- [x] Token refresh mechanism
- [x] Secure storage implementation
- [x] Protected route guards
- [x] Auto token refresh interceptor
- [x] Logout flow
- [x] Error handling
