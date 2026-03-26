# VIGILUX Week 3 - Quick Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 13+ installed
- Expo CLI installed (`npm install -g expo-cli`)
- iOS Simulator or Android Emulator (or physical device with Expo Go app)

## Quick Start (5 minutes)

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and set your database password

# Create database
createdb vigilux_db

# Run migrations
npm run migrate

# Start server
npm run dev
```

Backend will run on http://localhost:3000

### 2. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Default settings work for local development

# Start Expo
npm start
```

### 3. Test the App

- Scan QR code with Expo Go app
- Or press 'i' for iOS simulator
- Or press 'a' for Android emulator

### Default Login Credentials

- Email: `admin@vigilux.app`
- Password: `Admin@123`

## What's Included

### Backend Features ✅

- JWT authentication with refresh tokens
- User registration and login
- Password hashing with bcrypt
- Protected API endpoints
- Database migrations
- Input validation

### Frontend Features ✅

- Secure token storage (Keychain/EncryptedSharedPreferences)
- Auto token refresh
- Login/Register screens
- Protected navigation
- Tab navigation (Home, Map, Report, Profile)
- Smooth animations
- Professional UI

### Screens ✅

1. **Login** - Email/password authentication
2. **Register** - New user signup
3. **Home** - Dashboard with quick actions
4. **Map** - Interactive map with location
5. **Report** - Submit incident reports
6. **Profile** - User profile and logout

## API Endpoints

All endpoints use `/api/v1` prefix:

- `POST /auth/register` - Create account
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token
- `POST /auth/logout` - Logout
- `GET /auth/me` - Get current user

## Common Issues

### Backend won't start

- Check PostgreSQL is running: `pg_isready`
- Verify database exists: `psql -l | grep vigilux`
- Check .env file has correct credentials

### Frontend can't connect to API

- On physical device, update REACT_APP_API_URL to your computer's IP
- Example: `REACT_APP_API_URL=http://192.168.1.100:3000/api/v1`
- Make sure backend is running

### "Unauthorized" errors

- Clear app data and login again
- Check JWT_SECRET in backend .env
- Verify token is being sent in requests

## Next Steps

1. Try registering a new user
2. Login and explore all screens
3. Submit a test report
4. Check the map with your location
5. Review profile and logout

## Documentation

- [AUTH-FLOW.md](../AUTH-FLOW.md) - Authentication architecture
- [NAVIGATION-FLOW.md](../NAVIGATION-FLOW.md) - App navigation structure
- [week3-implementation-summary.md](week3-implementation-summary.md) - Complete implementation details

## Need Help?

- Check backend logs: `npm run dev` output
- Check frontend logs: Metro bundler console
- Verify all dependencies: `npm install` in both folders
- Ensure correct Node.js version: `node -v` (should be 18+)
