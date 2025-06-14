import { auth } from './firebase';

const API_BASE_URL = 'http://localhost:3000/api/v1'; // Replace with your actual API URL

export const getHeaders = async () => {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('User not authenticated');
  }

  const token = await user.getIdToken();
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`,
    'X-User-ID': user.uid, // Include the Firebase UID
  };
};

export const api = {
  baseUrl: API_BASE_URL,
  endpoints: {
    campaigns: {
      list: '/campaigns',
      details: (id: string) => `/campaigns/${id}`,
      create: '/campaigns',
      update: (id: string) => `/campaigns/${id}`,
      delete: (id: string) => `/campaigns/${id}`,
      addPost: (id: string) => `/campaigns/${id}/posts`,
      removePost: (id: string) => `/campaigns/${id}/posts`,
      updatePosts: (id: string) => `/campaigns/${id}/posts`,
    },
  },
};

// API Configuration
export const API_CONFIG = {
  // Development URLs
  DEV_BASE_URL: 'http://localhost:3000/api/v1',
  DEV_BASE_URL_ANDROID: 'http://10.0.2.2:3000/api/v1', // Android emulator
  
  // Production URL - Replace with your deployed backend URL
  PROD_BASE_URL: 'https://your-app.herokuapp.com/api',
  
  // Current environment
  IS_DEV: __DEV__,
  
  // Request timeout
  TIMEOUT: 30000, // 30 seconds
};

// Get the appropriate base URL based on environment
export const getApiBaseUrl = (): string => {
  if (API_CONFIG.IS_DEV) {
    // For development, you might want to use different URLs for iOS/Android
    // This is a simple approach - you can make it more sophisticated based on your needs
    return API_CONFIG.DEV_BASE_URL;
  }
  
  return API_CONFIG.PROD_BASE_URL;
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    LOGOUT_SESSION: '/auth/logout-session',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    PROFILE: '/user/profile',
    UPDATE_PROFILE: '/user/profile',
  },
  CAMPAIGNS: {
    LIST: '/campaigns',
    CREATE: '/campaigns',
    UPDATE: (id: string) => `/campaigns/${id}`,
    DELETE: (id: string) => `/campaigns/${id}`,
    CALENDAR: '/campaigns/calendar',
    DAY_DETAILS: '/campaigns/calendar/day',
  },
  PARTNERS: {
    LIST: '/campaigns/partners',
    CREATE: '/campaigns/partners',
    UPDATE: (id: string) => `/campaigns/partners/${id}`,
    DELETE: (id: string) => `/campaigns/partners/${id}`,
  },
}; 