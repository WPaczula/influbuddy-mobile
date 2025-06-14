# Backend Integration Setup Guide

This guide explains how to connect the mobile app to the backend API for authentication and data management.

## Prerequisites

1. **Backend Server Running**: Ensure your NestJS backend is running on `http://localhost:3000`
2. **Database Setup**: PostgreSQL database should be configured and running
3. **Environment Variables**: Backend should have proper environment variables set

## Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Set up the database:

```bash
npx prisma migrate dev
npx prisma db seed
```

4. Start the backend server:

```bash
npm run start:dev
```

The backend should now be running on `http://localhost:3000`

## Mobile App Configuration

### 1. API Base URL Configuration

The mobile app is configured to connect to your backend through the configuration file located at:

```
mobile/config/api.ts
```

**For iOS Simulator**: The default URL `http://localhost:3000/api` should work.

**For Android Emulator**: You may need to change the URL to `http://10.0.2.2:3000/api` in the config file.

**For Physical Device**: You'll need to use your computer's IP address (e.g., `http://192.168.1.100:3000/api`).

### 2. Environment-Specific URLs

Update the `mobile/config/api.ts` file based on your setup:

```typescript
export const API_CONFIG = {
  // Development URLs
  DEV_BASE_URL: 'http://localhost:3000/api', // For iOS simulator
  DEV_BASE_URL_ANDROID: 'http://10.0.2.2:3000/api', // For Android emulator

  // For physical device, use your computer's IP:
  // DEV_BASE_URL: 'http://192.168.1.100:3000/api',

  // Production URL
  PROD_BASE_URL: 'https://your-deployed-backend.com/api',

  IS_DEV: __DEV__,
  TIMEOUT: 30000,
};
```

## Features Connected to Backend

### Authentication

- ✅ **User Registration**: Creates real user accounts in the database
- ✅ **User Login**: Authenticates against the backend with JWT tokens
- ✅ **Password Reset**: Sends reset emails (currently logged to console, will use SES later)
- ✅ **Token Management**: Automatic token refresh and validation
- ✅ **Demo Mode**: Still supports demo login for testing (`demo@influencer.com` / `demo123`)

### What's Connected

1. **Sign Up Flow**: Creates users in PostgreSQL database
2. **Sign In Flow**: Authenticates with backend JWT system
3. **Forgot Password**: Sends password reset requests to backend
4. **Auto-Login**: Validates stored tokens on app startup
5. **Logout**: Properly clears tokens and session data

### What's Still Local (To Be Connected)

- Campaign management (currently uses AsyncStorage)
- Partner management (currently uses AsyncStorage)
- Calendar data (currently uses AsyncStorage)
- File uploads (backend supports S3, mobile not connected yet)

## Testing the Integration

### 1. Test Registration

1. Open the mobile app
2. Tap "Create Account"
3. Fill in the registration form
4. Submit - this should create a real user in your database

### 2. Test Login

1. Use the credentials you just created
2. Or use demo credentials: `demo@influencer.com` / `demo123`
3. The app should authenticate and navigate to the dashboard

### 3. Verify Database

Check your PostgreSQL database to confirm users are being created:

```sql
SELECT * FROM "User";
```

## Troubleshooting

### Network Connection Issues

**Error**: "Network request failed"

- Ensure backend is running on `http://localhost:3000`
- Check if the mobile device/emulator can reach the backend
- Try updating the API URL in `mobile/config/api.ts`

### CORS Issues

If you see CORS errors, ensure your backend has CORS configured for your mobile app:

```typescript
// In your NestJS main.ts
app.enableCors({
  origin: true, // Allow all origins in development
  credentials: true,
});
```

### Authentication Errors

**Error**: "Login failed" or "Registration failed"

- Check backend logs for detailed error messages
- Verify database connection
- Ensure Prisma migrations are up to date

### Demo Mode

The app still supports demo mode for testing:

- Email: `demo@influencer.com`
- Password: `demo123`

This bypasses the backend and uses local storage for testing purposes.

## Next Steps

After confirming authentication works:

1. **Campaign Integration**: Connect campaign CRUD operations to backend
2. **Partner Integration**: Connect partner management to backend
3. **File Upload**: Connect S3 file upload for profile pictures
4. **Push Notifications**: Set up FCM for deadline reminders
5. **Real-time Updates**: Consider WebSocket for real-time collaboration

## Backend API Documentation

The backend provides these authentication endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user
- `POST /api/auth/refresh` - Refresh tokens
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password with token

See the backend documentation for complete API reference.
